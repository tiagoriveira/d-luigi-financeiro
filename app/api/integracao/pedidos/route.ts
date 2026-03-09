import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const CW_API_BASE = "https://integracao.sandbox.cardapioweb.com";

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
        const dataInicio = body.dataInicio;
        const dataFim = body.dataFim;

        if (!estabelecimentoId || !token || !dataInicio || !dataFim) {
            return NextResponse.json({ error: "Faltam parâmetros requiridos" }, { status: 400 });
        }

        supabase = await createServerSupabaseClient();

        // 1. Chamar API Cardápio Web para buscar pedidos
        const params = new URLSearchParams({
            data_inicio: dataInicio,
            data_fim: dataFim,
            status: "completed" // Pensa-se em pedidos já concluídos/pagos
        });

        const resCw = await fetch(`${CW_API_BASE}/orders?${params.toString()}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
        });

        if (!resCw.ok && resCw.status !== 404) {
            throw new Error(`Erro API Cardápio Web: ${resCw.status} ${resCw.statusText}`);
        }

        let pedidosWeb: any[] = [];
        try {
            const data = await resCw.json();
            pedidosWeb = Array.isArray(data) ? data : (data.items || data.data || []);
        } catch (e) {
            console.warn("Retorno JSON de pedidos do CW inválido ou vazio.");
        }

        // 2. Agrupar os pedidos por [Data] e [Foma de Pagamento]
        // Regra do Usuário: "Agrupar por data + forma_de_pagamento. Um lançamento por grupo, não um por pedido."
        const agrupado: Record<string, { total: number }> = {};
        // A chave será algo como "2025-03-09|PIX" ou "2025-03-09|Cartão"

        for (const p of pedidosWeb) {
            // Extraindo data assumindo formato ISO ou similar
            const dataPedido = p.created_at || p.data || new Date().toISOString();
            const dataDia = dataPedido.split("T")[0]; // "YYYY-MM-DD"
            const formaPagamento = p.payment_method || p.forma_pagamento || "Dinheiro";
            const valor = parseFloat(p.total || p.valor) || 0;

            const key = `${dataDia}|${formaPagamento}`;
            if (!agrupado[key]) {
                agrupado[key] = { total: 0 };
            }
            agrupado[key].total += valor;
        }

        // Sem pedidos reais, não fazemos nada.
        if (Object.keys(agrupado).length === 0) {
            return NextResponse.json({ success: true, message: "A busca não retornou nenhum pedido pago no período." });
        }

        // 3. Salvar os grupos na tabela `lancamentos`
        let insercoes = 0;
        for (const [key, info] of Object.entries(agrupado)) {
            const [dataTag, formaTag] = key.split("|");

            await supabase.from("lancamentos").insert({
                estabelecimento_id: estabelecimentoId,
                descricao: `Vendas Delivery CW (${formaTag})`,
                valor: info.total,
                data: dataTag,
                pago: true,
                conta_bancaria: "Caixa Geral/A classificar",
                tipo: "FL", // Rule: Receita Faturamento
                categoria_despesa: null, // Nulo pois é receita
                tipo_lancamento: "Venda Direta",
                fonte: "cardapio_web"
            });
            insercoes++;
        }

        // 4. Update Timestamp 
        await supabase
            .from("integracoes_cw")
            .update({ ultimo_sync_pedidos: new Date().toISOString() })
            .eq("estabelecimento_id", estabelecimentoId);

        await logAction(supabase, estabelecimentoId, "import_pedidos", "sucesso", `Pedidos importados e agrupados em ${insercoes} lançamentos de caixa.`);

        return NextResponse.json({ success: true, message: `Foram gerados ${insercoes} lançamentos de faturamento no Fluxo de Caixa.` });

    } catch (error: any) {
        console.error("[Import Pedidos] Erro:", error);
        if (supabase && estabelecimentoId) {
            await logAction(supabase, estabelecimentoId, "import_pedidos", "erro", error.message);
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
