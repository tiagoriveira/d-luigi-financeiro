import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProdutosClientWrapper from "./produtos-client";

export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
    const supabase = await createServerSupabaseClient();

    // Buscar o estabelecimento do usuário logado
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="text-center py-20 text-text-2">
                <p>Você precisa estar autenticado para ver esta página.</p>
            </div>
        );
    }

    const { data: estab } = await supabase
        .from("estabelecimentos")
        .select("id, nome")
        .eq("user_id", user.id)
        .single();

    if (!estab) {
        return (
            <div className="text-center py-20 text-text-2">
                <p>Estabelecimento não encontrado. Configure na aba de Integrações.</p>
            </div>
        );
    }

    // Busca todos os produtos do estabelecimento
    const { data: produtos, error } = await supabase
        .from("produtos")
        .select("id, nome, categoria, tamanho, preco_atual")
        .eq("estabelecimento_id", estab.id)
        .order("categoria", { ascending: true })
        .order("nome", { ascending: true });

    if (error) {
        return (
            <div className="text-center py-20 text-danger">
                <p>Erro ao carregar produtos: {error.message}</p>
            </div>
        );
    }

    return <ProdutosClientWrapper produtos={produtos ?? []} />;
}
