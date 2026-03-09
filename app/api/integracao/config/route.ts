import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const { estabelecimentoId, token } = await req.json();

        if (!estabelecimentoId || !token) {
            return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
        }

        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        // TODO: Antes de ir para produção, implementar a criptografia pgsodium aqui.
        // Por ora, salvando em plain text.
        const { error } = await supabase
            .from("integracoes_cw")
            .upsert({
                estabelecimento_id: estabelecimentoId,
                token_api: token,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;

        // Registrar Log
        await supabase.from("integracao_logs").insert({
            estabelecimento_id: estabelecimentoId,
            acao: "config_token",
            status: "sucesso",
            mensagem: "Token da API atualizado com sucesso."
        });

        return NextResponse.json({ success: true, message: "Token salvo com sucesso." });
    } catch (error: any) {
        console.error("[Config CW] Erro:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
