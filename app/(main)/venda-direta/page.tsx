import { createServerSupabaseClient } from "@/lib/supabase/server";
import VendaDiretaClient from "./venda-direta-client";

export const dynamic = "force-dynamic";

export default async function VendaDiretaPage() {
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

    const { data: vendaDireta } = await supabase
        .from("venda_direta")
        .select("id, nome, categoria, custo, preco_atual, previsao_mes")
        .eq("estabelecimento_id", estab.id)
        .order("nome");

    return (
        <VendaDiretaClient
            estabelecimentoId={estab.id}
            itens={vendaDireta ?? []}
        />
    );
}
