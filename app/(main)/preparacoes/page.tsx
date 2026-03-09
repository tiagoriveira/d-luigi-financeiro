import { createServerSupabaseClient } from "@/lib/supabase/server";
import PreparacoesClient from "./preparacoes-client";

export const dynamic = "force-dynamic";

export default async function PreparacoesPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: estab } = await supabase
        .from("estabelecimentos")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!estab) return null;

    const { data: preparacoes } = await supabase
        .from("preparacoes")
        .select("id, nome, rendimento, preparacao_ingredientes(id, ingrediente_id, nome_avulso, preco_avulso, quantidade, ingredientes(nome, unidade, preco_atual))")
        .eq("estabelecimento_id", estab.id)
        .order("nome");

    return (
        <PreparacoesClient
            estabelecimentoId={estab.id}
            preparacoes={preparacoes ?? []}
        />
    );
}
