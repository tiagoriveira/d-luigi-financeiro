"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

// URLs oficiais confirmadas pelo usuário
const BASE_URL_PROD = "https://integracao.cardapioweb.com";
const BASE_URL_SANDBOX = "https://integracao.sandbox.cardapioweb.com";

// Token do ambiente de teste (sandbox) fornecido pela Cardápio Web
// Trocar pela variável de ambiente em produção
const SANDBOX_TEST_TOKEN = "7nSyGq49NVXuyZfgEQNPg3TdUqLNXTMNMNJwckvE";

interface CardapioWebCredentials {
    token: string;
    lojaId?: string; // opcional - o token já identifica o estabelecimento
    sandbox?: boolean;
}

/**
 * Faz uma requisição autenticada para a API do Cardápio Web.
 * Autenticação: header X-API-KEY (confirmado pela doc oficial)
 */
async function fetchCardapioWeb(
    endpoint: string,
    credentials: CardapioWebCredentials,
    options: RequestInit = {}
) {
    const baseUrl = credentials.sandbox ? BASE_URL_SANDBOX : BASE_URL_PROD;
    const url = `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        method: options.method ?? "GET",
        headers: {
            "X-API-KEY": credentials.token,   // Header oficial confirmado pela doc
            "Accept": "application/json",
            ...(options.headers ?? {}),
        },
    });

    return response;
}

/**
 * Busca o catálogo completo da API do Cardápio Web.
 * Tenta os endpoints mais prováveis baseado no padrão da API.
 */
export async function syncCatalogoCardapioWeb(credentials: CardapioWebCredentials): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    rawData?: unknown;
}> {
    if (!credentials.token) {
        return { success: false, error: "Token de API não informado." };
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
            const nome = user.email?.split("@")[0] ?? "Meu Estabelecimento";
            const { data: newEstab, error: createError } = await supabase
                .from("estabelecimentos")
                .insert({ user_id: user.id, nome })
                .select("id")
                .single();

            if (createError || !newEstab) {
                return { success: false, error: "Falha ao criar estabelecimento: " + createError?.message };
            }
            estabData = newEstab;
        } else if (estabError || !estabData) {
            return { success: false, error: "Erro ao buscar estabelecimento: " + estabError?.message };
        }

        const estabelecimentoId = estabData.id;

        // 2. Chamar a API do Cardápio Web
        // O endpoint /catalog foi assumido — pode precisar de ajuste.
        // O token já identifica o estabelecimento.
        const response = await fetchCardapioWeb("/catalog", credentials);

        console.log(`[CardapioWeb] GET /catalog → HTTP ${response.status}`);

        if (response.status === 401) {
            return { success: false, error: "Token inválido ou não autorizado (401). Verifique o token em Configurações → Integrações → API no Cardápio Web." };
        }
        if (response.status === 404) {
            return { success: false, error: "Endpoint não encontrado (404). O caminho /catalog pode estar incorreto." };
        }
        if (response.status === 429) {
            return { success: false, error: "Limite de requisições atingido (429). Aguarde 1 minuto e tente novamente." };
        }
        if (!response.ok) {
            const errorBody = await response.text().catch(() => "");
            return { success: false, error: `Erro na API Cardápio Web: HTTP ${response.status}. Detalhe: ${errorBody.slice(0, 200)}` };
        }

        // Verificar se a resposta é realmente JSON antes de tentar parsear
        const contentType = response.headers.get("content-type") ?? "";
        const rawBody = await response.text();

        if (!contentType.includes("application/json") || rawBody.trimStart().startsWith("<")) {
            console.error("[CardapioWeb] Resposta não é JSON. Content-Type:", contentType);
            console.error("[CardapioWeb] Body (primeiros 300 chars):", rawBody.slice(0, 300));
            return {
                success: false,
                error: `A API retornou HTML em vez de JSON (endpoint incorreto?). URL chamada: integracao.cardapioweb.com/catalog. Início da resposta: "${rawBody.slice(0, 150)}"`,
            };
        }

        const data = JSON.parse(rawBody);

        // 3. Mapear a resposta - suportando estruturas comuns da API
        // A estrutura real deve ser confirmada na doc oficial (Stoplight)
        let catalogItems: any[] = [];

        if (Array.isArray(data)) {
            catalogItems = data;
        } else if (Array.isArray(data?.products)) {
            catalogItems = data.products;
        } else if (Array.isArray(data?.items)) {
            catalogItems = data.items;
        } else if (Array.isArray(data?.data)) {
            catalogItems = data.data;
        } else if (Array.isArray(data?.catalog)) {
            catalogItems = data.catalog;
        }

        if (catalogItems.length === 0) {
            return {
                success: true,
                message: "Catálogo recebido, mas sem produtos para importar.",
                rawData: data, // retorna o JSON bruto para debug
            };
        }

        // 4. Persistir no Supabase
        let inseridos = 0;
        let erros = 0;

        for (const item of catalogItems) {
            const nome = item.name ?? item.nome ?? item.title ?? "Produto Desconhecido";
            const preco = Number(item.price ?? item.preco ?? item.value ?? 0);
            const categoria = item.category?.name ?? item.categoria?.nome ?? item.categoria ?? "Geral";
            const ativo = item.active ?? item.ativo ?? true;

            const { error: upsertError } = await supabase
                .from("produtos")
                .upsert(
                    {
                        estabelecimento_id: estabelecimentoId,
                        nome,
                        preco_atual: preco,
                        categoria,
                        tamanho: "Único",
                        // Guardar o ID externo para upsert futuro
                        cardapio_web_id: item.id?.toString() ?? null,
                    },
                    {
                        onConflict: "estabelecimento_id,cardapio_web_id",
                        ignoreDuplicates: false,
                    }
                );

            if (upsertError) {
                console.warn("[CardapioWeb] Erro ao salvar produto:", nome, upsertError.message);
                erros++;
            } else {
                inseridos++;
            }
        }

        return {
            success: true,
            message: `Catálogo sincronizado! ${inseridos} produto(s) importado(s)${erros > 0 ? `, ${erros} com erro` : ""}.`,
        };

    } catch (error: any) {
        console.error("[CardapioWeb] Erro interno:", error?.message ?? error);
        return {
            success: false,
            error: `Erro interno: ${error?.message ?? "Verifique os logs do servidor (Vercel)."}`,
        };
    }
}

/**
 * Busca pedidos do período da API do Cardápio Web.
 */
export async function syncPedidosCardapioWeb(
    credentials: CardapioWebCredentials,
    filtros?: { startDate?: string; endDate?: string }
): Promise<{ success: boolean; message?: string; error?: string; rawData?: unknown }> {
    if (!credentials.token) {
        return { success: false, error: "Token de API não informado." };
    }

    try {
        const params = new URLSearchParams();
        if (filtros?.startDate) params.set("start_date", filtros.startDate);
        if (filtros?.endDate) params.set("end_date", filtros.endDate);

        const query = params.toString() ? `?${params.toString()}` : "";
        const response = await fetchCardapioWeb(`/orders${query}`, credentials);

        console.log(`[CardapioWeb] GET /orders${query} → HTTP ${response.status}`);

        if (!response.ok) {
            return { success: false, error: `Erro na API: HTTP ${response.status}` };
        }

        const data = await response.json();
        return { success: true, message: "Pedidos recebidos com sucesso.", rawData: data };

    } catch (error: any) {
        return { success: false, error: `Erro interno: ${error?.message}` };
    }
}
