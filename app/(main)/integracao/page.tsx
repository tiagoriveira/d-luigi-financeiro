import { createServerSupabaseClient } from "@/lib/supabase/server";
import IntegracaoClient from "./integracao-client";

export const dynamic = "force-dynamic";

export default async function IntegracaoPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: estab } = await supabase
        .from("estabelecimentos")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!estab) return null;

    // Buscar configurações de integração
    const { data: config } = await supabase
        .from("integracoes_cw")
        .select("*")
        .eq("estabelecimento_id", estab.id)
        .single();

    // Produtos importados (para exibir no catálogo)
    const { data: produtos } = await supabase
        .from("produtos")
        .select("nome, categoria, preco_sugerido, sincronizado")
        .eq("estabelecimento_id", estab.id)
        .order("nome");

    // Logs de integração (últimos 50)
    const { data: logs } = await supabase
        .from("integracao_logs")
        .select("*")
        .eq("estabelecimento_id", estab.id)
        .order("data_hora", { ascending: false })
        .limit(50);

    return (
        <IntegracaoClient
            estabelecimentoId={estab.id}
            configCw={config || null}
            produtosImportados={produtos || []}
            logs={logs || []}
        />
    );
}
