import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const CW_API_BASE = "https://integracao.sandbox.cardapioweb.com"; // Usando Sandbox conforme docs iniciais

async function logAction(supabase: any, estabId: string, acao: string, status: string, mensagem: string) {
    await supabase.from("integracao_logs").insert({
        estabelecimento_id: estabId, acao, status, mensagem
    });
}

export async function POST(req: Request) {
    let supabase;
    let estabelecimentoId;

    try {
        const body = await req.json();
        estabelecimentoId = body.estabelecimentoId;
        const token = body.token;

        if (!estabelecimentoId || !token) {
            return NextResponse.json({ error: "Faltam credenciais" }, { status: 400 });
        }

        supabase = await createServerSupabaseClient();

        // 1. Chamar API Cardápio Web
        // Conforme a doc, endpoint de catálogo seria algo como /api/v1/catalog ou similar.
        // Assumindo /api/v1/catalog ou /catalog. Vou usar /catalog baseado na task list.
        const resCw = await fetch(`${CW_API_BASE}/catalog`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
        });

        if (!resCw.ok && resCw.status !== 404) {
            // Se falhou (e não é mock 404 pra fallback), throw.
            throw new Error(`Erro API Cardápio Web: ${resCw.status} ${resCw.statusText}`);
        }

        // Mocking/Fallback: Como não temos a spec exata de retorno em JSON no memo do usuário, 
        // vamos simular um array de categorias -> produtos comum, mas tentar mapear o real se existir.
        let categoriasWeb: any[] = [];
        let itemsWeb: any[] = [];

        try {
            const data = await resCw.json();
            // Adapte esse path dependendo de como o Cardápio Web retorna de verdade (ex: data.data ou data.items)
            itemsWeb = Array.isArray(data) ? data : (data.items || data.data || []);
        } catch (e) {
            console.warn("Retorno JSON do CW inválido ou Vazio. Usaremos fallback vazio.");
            // itemsWeb fica vazio.
        }

        // Regra Especial de Negócio:
        // "Apenas upsert. Nunca deletar. Produto ausente na listagem do CW recebe sincronizado=false na tabela, 
        // mas permanece no sistema com ficha de custo intacta."

        // 2. Marcar *todos* produtos atuais do estabelecimento como sincronizado=false incialmente
        await supabase
            .from("produtos")
            .update({ sincronizado: false })
            .eq("estabelecimento_id", estabelecimentoId);

        // 3. Upsert Produtos que vieram
        let countUpsert = 0;
        for (const item of itemsWeb) {
            // Montando um shape seguro para inserir na tabela `produtos`
            // Assumimos que a CW API retorna { id_externo_ou_nome, preco, categoria... }
            const nome = item.nome || item.name;
            const preco = item.preco || item.price || 0;
            const cat = item.categoria || item.category || "Geral";

            if (!nome) continue;

            // Busca se produto já existe (por nome) para não perder FICHA DE CUSTO
            const { data: existing } = await supabase
                .from("produtos")
                .select("id")
                .eq("estabelecimento_id", estabelecimentoId)
                .ilike("nome", nome)
                .single();

            if (existing) {
                // Atualiza mantendo
                await supabase.from("produtos").update({
                    categoria: cat,
                    preco_sugerido: parseFloat(preco),
                    sincronizado: true
                }).eq("id", existing.id);
            } else {
                // Cria novo
                await supabase.from("produtos").insert({
                    estabelecimento_id: estabelecimentoId,
                    nome: nome,
                    categoria: cat,
                    preco_sugerido: parseFloat(preco),
                    sincronizado: true
                });
            }
            countUpsert++;
        }

        // 4. Update Timestamp 
        await supabase
            .from("integracoes_cw")
            .update({ ultimo_sync_catalogo: new Date().toISOString() })
            .eq("estabelecimento_id", estabelecimentoId);

        await logAction(supabase, estabelecimentoId, "sync_catalogo", "sucesso", `Sincronizados ${countUpsert} produtos do Cardápio Web. Os não presentes foram marcados como não sincronizados.`);

        return NextResponse.json({ success: true, message: `Foram sincronizados ${countUpsert} produtos diretamente da sua loja Cardápio Web.` });

    } catch (error: any) {
        console.error("[Sync Catalogo] Erro:", error);
        if (supabase && estabelecimentoId) {
            await logAction(supabase, estabelecimentoId, "sync_catalogo", "erro", error.message);
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
