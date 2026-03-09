import { createServerSupabaseClient } from "@/lib/supabase/server";
import MetaAdsClient from "./meta-ads-client";

export const dynamic = "force-dynamic";

export default async function MetaAdsPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: estab } = await supabase
        .from("estabelecimentos")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!estab) return null;

    // Busca lançamentos de vendas (FL) para calcular ticket médio real
    const { data: lancamentos } = await supabase
        .from("lancamentos")
        .select("valor, data")
        .eq("estabelecimento_id", estab.id)
        .eq("tipo", "FL");

    // Ticket médio = total vendas / quantidade de lançamentos FL
    const totalVendas = (lancamentos ?? []).reduce((a, l) => a + l.valor, 0);
    const qtdLancamentos = lancamentos?.length ?? 0;
    const ticketMedioReal = qtdLancamentos > 0 ? totalVendas / qtdLancamentos : 0;

    return (
        <MetaAdsClient ticketMedioSugerido={ticketMedioReal} />
    );
}
