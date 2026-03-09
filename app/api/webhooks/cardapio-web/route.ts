import { NextResponse } from "next/server";

// Função para receber requisições POST do Cardápio Web (Webhooks)
export async function POST(req: Request) {
    try {
        // Validação básica do cabeçalho para segurança (opcional, dependendo do CW)
        // const authHeader = req.headers.get("authorization");
        // if (authHeader !== `Bearer ${process.env.CW_WEBHOOK_SECRET}`) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        const payload = await req.json();
        console.log("📥 [Webhook Cardápio Web] Payload recebido:", JSON.stringify(payload, null, 2));

        // Aqui vai a lógica de processamento do pedido:
        // 1. Verificar o tipo de evento (ex: "order.created", "order.status_changed")
        // 2. Extrair dados do pedido (valor, itens, método de pagamento)
        // 3. Salvar no Supabase (Fluxo de Caixa / Pedidos)
        // 4. Abater estoque de ingredientes (Fichas Técnicas)

        // Resposta de sucesso rápida para não dar timeout no webhook
        return NextResponse.json({ success: true, message: "Webhook processado com sucesso" });

    } catch (error: any) {
        console.error("❌ [Webhook Cardápio Web] Erro ao processar:", error);
        return NextResponse.json(
            { success: false, error: "Erro interno ao processar webhook" },
            { status: 500 }
        );
    }
}

// Rota GET simples para verificar se o endpoint está no ar (útil para testes da URL)
export async function GET() {
    return NextResponse.json({ status: "online", service: "Cardápio Web Webhook Receiver" });
}
