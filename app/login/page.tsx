"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"login" | "signup">("login");

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (mode === "login") {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setError("E-mail ou senha incorretos.");
            } else {
                window.location.href = "/dashboard";
            }
        } else {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setError(error.message);
            } else {
                setError(null);
                alert("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
                setMode("login");
            }
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
            <div className="bg-surface rounded-card border border-border shadow-sm w-full max-w-[360px] p-[36px_32px]">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="font-serif text-[28px] text-text leading-none mb-1">D-Luigi</div>
                    <div className="text-[12px] text-text-3 tracking-[0.06em] uppercase font-semibold">
                        Gestão de Custos & Caixa
                    </div>
                </div>

                {/* Tabs Login / Cadastro */}
                <div className="flex rounded-sm bg-surface-2 p-[3px] mb-6">
                    {(["login", "signup"] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => { setMode(m); setError(null); }}
                            className={`flex-1 py-[6px] text-[12.5px] font-medium rounded-[4px] transition-all ${mode === m
                                    ? "bg-surface text-text shadow-sm"
                                    : "text-text-2 hover:text-text"
                                }`}
                        >
                            {m === "login" ? "Entrar" : "Criar conta"}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-text-3 uppercase tracking-[0.06em]">
                            E-mail
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="px-3 py-[9px] border border-border-strong rounded-sm text-[13.5px] text-text bg-surface outline-none focus:border-accent transition-all placeholder:text-text-3"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-text-3 uppercase tracking-[0.06em]">
                            Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            minLength={6}
                            className="px-3 py-[9px] border border-border-strong rounded-sm text-[13.5px] text-text bg-surface outline-none focus:border-accent transition-all placeholder:text-text-3"
                        />
                    </div>

                    {error && (
                        <div className="px-3 py-2 bg-danger-light text-danger text-[12px] rounded-sm font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        id="btn-submit-login"
                        type="submit"
                        disabled={isLoading}
                        className="mt-1 w-full py-[10px] bg-accent text-white rounded-sm text-[13.5px] font-semibold hover:bg-[#245A3C] transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : mode === "login" ? (
                            "Entrar"
                        ) : (
                            "Criar conta"
                        )}
                    </button>
                </form>

                <p className="text-center text-[11.5px] text-text-3 mt-5">
                    Use as credenciais cadastradas no Supabase Auth.
                </p>
            </div>
        </div>
    );
}
