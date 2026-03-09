import { createServerSupabaseClient } from "@/lib/supabase/server";
import DespesasClient from "./despesas-client";

export const dynamic = "force-dynamic";

export default async function DespesasPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: estab } = await supabase
        .from("estabelecimentos")
        .select("id, imposto, lucro_desejado, projecao_vendas")
        .eq("user_id", user.id)
        .single();

    if (!estab) {
        return (
            <div className="text-center py-20 text-text-2">
                <p>Estabelecimento não encontrado.</p>
            </div>
        );
    }

    const [despRes, salRes, plRes] = await Promise.all([
        supabase.from("despesas").select("id, descricao, valor, categoria").eq("estabelecimento_id", estab.id),
        supabase.from("salarios").select("id, funcao, salario").eq("estabelecimento_id", estab.id),
        supabase.from("prolabore").select("id, nome, valor").eq("estabelecimento_id", estab.id),
    ]);

    return (
        <DespesasClient
            estabelecimentoId={estab.id}
            imposto={estab.imposto ?? 0.06}
            lucroDesejado={estab.lucro_desejado ?? 0.10}
            projecaoVendas={estab.projecao_vendas ?? 0}
            despesas={despRes.data ?? []}
            salarios={salRes.data ?? []}
            prolabore={plRes.data ?? []}
        />
    );
}
