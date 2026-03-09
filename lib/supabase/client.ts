import { createBrowserClient } from "@supabase/ssr";

/**
 * Cria o cliente Supabase para uso em componentes Client (browser).
 * Usar este em todo componente com 'use client'.
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
