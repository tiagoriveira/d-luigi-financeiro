import { createServerSupabaseClient } from "@/lib/supabase/server";
import CategoriasClient from "./categorias-client";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: estab } = await supabase
        .from("estabelecimentos")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!estab) return null;

    const { data: categorias } = await supabase
        .from("categorias_custom")
        .select("id, grupo, valor")
        .eq("estabelecimento_id", estab.id)
        .order("grupo");

    const byGroup = (group: string) => (categorias ?? []).filter((c) => c.grupo === group).map((c) => c.valor);

    return (
        <CategoriasClient
            estabelecimentoId={estab.id}
            tiposLancamento={byGroup("tipo_lancamento")}
            contasBancarias={byGroup("conta_bancaria")}
            categoriasDespesa={byGroup("categoria_despesa")}
            categoriasProduto={byGroup("categoria_produto")}
            unidadesMedida={byGroup("unidade_medida")}
        />
    );
}
