"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

const BASE_URL = "https://api.cardapioweb.com";

interface CardapioWebToken {
    token: string;
    lojaId: string;
}

/**
 * Busca o catálogo da API do Cardápio Web e atualiza os produtos no Supabase
 * do usuário atualmente logado.
 */
export async function syncCatalogoCardapioWeb(credentials: CardapioWebToken) {
    if (!credentials.token || !credentials.lojaId) {
        return { success: false, error: "Credenciais inválidas ou não preenchidas." };
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Usuário não autenticado." };
    }

    try {
        // 1. Buscar (ou criar) o Estabelecimento do usuário logado
        let { data: estabData, error: estabError } = await supabase
            .from("estabelecimentos")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (estabError && estabError.code === "PGRST116") {
            // PGRST116 = nenhum registro encontrado → criar automaticamente
            const nome = user.email?.split("@")[0] ?? "Meu Estabelecimento";
            const { data: newEstab, error: createError } = await supabase
                .from("estabelecimentos")
                .insert({ user_id: user.id, nome })
                .select("id")
                .single();

            if (createError || !newEstab) {
                return { success: false, error: "Falha ao criar estabelecimento automaticamente: " + createError?.message };
            }
            estabData = newEstab;
        } else if (estabError || !estabData) {
            return { success: false, error: "Erro ao buscar estabelecimento: " + estabError?.message };
        }

        const estabelecimentoId = estabData.id;

        // 2. Fazer a requisição real para o Cardápio Web
        const response = await fetch(`${BASE_URL}/catalog`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${credentials.token}`,
                "Content-Type": "application/json",
                // Algumas APIs exigem que a loja seja especificada no header ou URL,
                // enviando a loja_id por garantia caso necessário custom headers
                "X-Store-ID": credentials.lojaId
            },
        });

        if (!response.ok) {
            console.error("Erro API Cardápio Web STATUS:", response.status);
            return { success: false, error: "Falha na comunicação com Cardápio Web. Verifique o Token." };
        }

        const data = await response.json();
        const catalogItems = Array.isArray(data) ? data : data.items || data.data || [];

        if (catalogItems.length === 0) {
            return { success: true, message: "Nenhum produto encontrado no catálogo do Cardápio Web para importar." };
        }

        // 3. Persistir os dados no Supabase (Upsert / Inserir)
        let contagemInsecoes = 0;

        for (const item of catalogItems) {
            // Tentamos mapear os campos genéricos. Dependendo da estrutura exata
            // `data` pode ser { nome: '...', preco: 50.0 } etc. Adapte se necessário:
            const nomeProduto = item.name || item.nome || item.title || "Produto Desconhecido";
            const preco = item.price || item.preco || item.value || 0;
            const categoria = item.category?.name || item.categoria || "Geral";

            // Inserimos o produto (ignorar duplicados ou fazer upsert no futuro caso precisemos)
            const { error: insertError } = await supabase
                .from("produtos")
                .insert({
                    estabelecimento_id: estabelecimentoId,
                    nome: nomeProduto,
                    preco_atual: preco,
                    categoria: categoria,
                    tamanho: "Único" // Padrão
                });

            if (!insertError) {
                contagemInsecoes++;
            }
        }

        return {
            success: true,
            message: `Catálogo sincronizado com sucesso! ${contagemInsecoes} produtos adicionados ou atualizados.`
        };

    } catch (error: any) {
        console.error("Erro interno a sincronizar catálogo:", error);
        return { success: false, error: "Erro interno no servidor ao tentar concluir a sincronização." };
    }
}
