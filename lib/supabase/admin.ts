import { createClient } from "@supabase/supabase-js";

/**
 * Cria o cliente Supabase contornando RLS (Row Level Security).
 * IMPORTANTE: Usar apenas em Rotas de API no lado do servidor (como Webhooks),
 * nunca em Client Components ou onde não houver controle estrito de segurança.
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
}
