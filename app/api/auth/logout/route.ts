import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";

/**
 * GET /api/auth/logout
 * Encerra a sessão e redireciona para /login.
 */
export async function GET(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
}
