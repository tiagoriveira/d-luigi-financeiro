import { createServerSupabaseClient } from "@/lib/supabase/server";
import IngredientesClient from "./ingredientes-client";

export const dynamic = "force-dynamic";

export default async function IngredientesPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: estab } = await supabase
        .from("estabelecimentos")
        .select("id, projecao_vendas")
        .eq("user_id", user.id)
        .single();

    if (!estab) {
        return (
            <div className="text-center py-20 text-text-2">
                <p>Estabelecimento não encontrado.</p>
            </div>
        );
    }

    const [dirRes, indirRes] = await Promise.all([
        supabase
            .from("ingredientes")
            .select("id, nome, unidade, preco_atual, preco_anterior")
            .eq("estabelecimento_id", estab.id)
            .order("nome"),
        supabase
            .from("ingredientes_indiretos")
            .select("id, nome, unidade, preco, qtde_mes")
            .eq("estabelecimento_id", estab.id)
            .order("nome"),
    ]);

    return (
        <IngredientesClient
            estabelecimentoId={estab.id}
            ingredientes={dirRes.data ?? []}
            ingredientesIndiretos={indirRes.data ?? []}
            projecaoVendas={estab.projecao_vendas ?? 0}
        />
    );
}
