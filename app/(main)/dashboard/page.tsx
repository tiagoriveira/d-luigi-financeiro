import { createServerSupabaseClient } from "@/lib/supabase/server";
import DashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: estab } = await supabase
        .from("estabelecimentos")
        .select("id, nome, regime_tributario, aliquota, projecao_vendas, lucro_desejado")
        .eq("user_id", user.id)
        .single();

    if (!estab) {
        return (
            <div className="text-center py-20 text-text-2">
                <p>Estabelecimento não configurado. Use a aba Integrações para começar.</p>
            </div>
        );
    }

    const [lancRes, despRes, salRes, plRes, prodRes] = await Promise.all([
        supabase
            .from("lancamentos")
            .select("id, data, tipo, descricao, valor, conta")
            .eq("estabelecimento_id", estab.id)
            .order("data", { ascending: true }),
        supabase
            .from("despesas")
            .select("id, descricao, valor, categoria")
            .eq("estabelecimento_id", estab.id),
        supabase
            .from("salarios")
            .select("id, funcao, salario")
            .eq("estabelecimento_id", estab.id),
        supabase
            .from("prolabore")
            .select("id, nome, valor")
            .eq("estabelecimento_id", estab.id),
        supabase
            .from("produtos")
            .select("id, nome, tamanho, categoria, preco_atual")
            .eq("estabelecimento_id", estab.id)
            .order("nome"),
    ]);

    return (
        <DashboardClient
            lancamentos={lancRes.data ?? []}
            despesas={despRes.data ?? []}
            salarios={salRes.data ?? []}
            prolabore={plRes.data ?? []}
            produtos={prodRes.data ?? []}
            projecaoVendas={estab.projecao_vendas ?? 0}
        />
    );
}
