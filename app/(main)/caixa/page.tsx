import { createServerSupabaseClient } from "@/lib/supabase/server";
import CaixaClient from "./caixa-client";

export const dynamic = "force-dynamic";

export default async function CaixaPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: estab } = await supabase
        .from("estabelecimentos")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!estab) {
        return (
            <div className="text-center py-20 text-text-2">
                <p>Estabelecimento não encontrado.</p>
            </div>
        );
    }

    const { data: lancamentos } = await supabase
        .from("lancamentos")
        .select("id, data, tipo, descricao, valor, conta, fonte")
        .eq("estabelecimento_id", estab.id)
        .order("data", { ascending: false });

    return (
        <CaixaClient
            estabelecimentoId={estab.id}
            lancamentos={lancamentos ?? []}
        />
    );
}
