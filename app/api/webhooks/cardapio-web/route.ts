import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
    let supabase;
    let estabelecimentoId;

    try {
        const url = new URL(req.url);
        estabelecimentoId = url.searchParams.get("estabelecimentoId");

        if (!estabelecimentoId) {
            console.warn("⚠️ [Webhook CW] Recebido sem estabelecimentoId na query string.");
            throw new Error("Missing estabelecimentoId");
        }

        const payload = await req.json();
        console.log(`📥 [Webhook CW] Payload para Estab="${estabelecimentoId}":`, JSON.stringify(payload));

        supabase = createAdminClient(); // Bypass RLS para request anônimo

        // Verifica se a integração desse estabelecimento ativou sincronização
        const { data: config } = await supabase
            .from("integracoes_cw")
            .select("sincroniza_pedidos_ativo")
            .eq("estabelecimento_id", estabelecimentoId)
            .single();

        if (!config || config.sincroniza_pedidos_ativo === false) {
            console.log("Ignorando webhook: sincronização de pedidos não ativada (ou config ausente).");
            return NextResponse.json({ success: true, message: "Webhook ignorado (sincronização não ativa)" });
        }

        // Lógica de Processamento de Pedido "Concluído"
        // Adapte keys conforme documentação real do Cardápio Web
        const eventType = payload.event || payload.action || "order.status_changed";
        const statusPedido = payload.data?.status || payload.status;

        if (statusPedido === "completed" || statusPedido === "concluido" || eventType === "order.completed") {
            const orderData = payload.data || payload;
            const formaPagamento = orderData.payment_method || orderData.forma_pagamento || "Dinheiro";
            const valorTotal = parseFloat(orderData.total || orderData.valor) || 0;
            const dataPedido = (orderData.created_at || new Date().toISOString()).split("T")[0];
            const orderId = orderData.id || orderData.id_pedido || "Desconhecido";

            // Registrar a Venda no Caixa (Venda Direta / Faturamento)
            const { error: insertError } = await supabase.from("lancamentos").insert({
                estabelecimento_id: estabelecimentoId,
                descricao: `Pedido #${orderId} - Delivery CW`,
                valor: valorTotal,
                data: dataPedido,
                pago: true,
                conta_bancaria: "Caixa Geral/A classificar",
                tipo: "FL", // Venda / Receita
                categoria_despesa: null,
                tipo_lancamento: "Venda Direta",
                fonte: "cardapio_web"
            });

            if (insertError) throw insertError;

            // Log de Sucesso
            await supabase.from("integracao_logs").insert({
                estabelecimento_id: estabelecimentoId,
                acao: "webhook_recebido",
                status: "sucesso",
                mensagem: `Pedido #${orderId} de R$ ${valorTotal.toFixed(2)} registrado.`
            });
        }

        return NextResponse.json({ success: true, message: "Webhook processado com sucesso" });

    } catch (error: any) {
        console.error("❌ [Webhook CW] Erro:", error);

        // Tentativa de Log se foi possível instanciar o supabase client e tinhamos EstabId
        if (supabase && estabelecimentoId) {
            await supabase.from("integracao_logs").insert({
                estabelecimento_id: estabelecimentoId,
                acao: "webhook_recebido",
                status: "erro",
                mensagem: `Falha no processamento: ${error.message}`
            });
        }

        return NextResponse.json({ success: false, error: "Erro ao processar webhook" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: "online", service: "Cardápio Web Webhook Receiver" });
}
