"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function formatBRL(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Lancamento { id: string; data: string; tipo: string; descricao: string | null; valor: number; conta: string; fonte: string | null; }

interface Props {
    estabelecimentoId: string;
    lancamentos: Lancamento[];
}

const TIPO_LABELS: Record<string, string> = { FL: "Venda", MP: "Ingrediente", FX: "Despesa Fixa", VA: "Variável", TX: "Bancária", OP: "Operacional" };
const TIPO_COLORS: Record<string, string> = {
    FL: "bg-success-light text-success", TX: "bg-[#FDF0E6] text-accent-warm",
    MP: "bg-[#EEF2FF] text-[#4F46E5]", FX: "bg-danger-light text-danger",
    VA: "bg-[#FDF4FF] text-[#9333EA]", OP: "bg-info-light text-info",
};
const CONTAS_COLORS = ["#2C6E49", "#0284C7", "#BF6A2E", "#C0392B", "#9333EA", "#D97706"];

const FILTROS = [
    { label: "Todos", value: "todos" }, { label: "Vendas", value: "FL" },
    { label: "Ingredientes", value: "MP" }, { label: "Fixos", value: "FX" }, { label: "Variáveis", value: "VA" },
];

export default function CaixaClient({ estabelecimentoId, lancamentos }: Props) {
    const [filtroAtivo, setFiltroAtivo] = useState("todos");
    const [novoLanc, setNovoLanc] = useState({ data: "", tipo: "FL", descricao: "", valor: "", conta: "Caixa" });
    const [isSaving, setIsSaving] = useState(false);

    const filtrados = filtroAtivo === "todos" ? lancamentos : lancamentos.filter((l) => l.tipo === filtroAtivo);

    let acum = 0;
    const extrato = [...filtrados].sort((a, b) => a.data.localeCompare(b.data)).map((l) => {
        acum += l.valor;
        return { ...l, acumulado: acum };
    });

    const saldoTotal = lancamentos.reduce((a, l) => a + l.valor, 0);
    const contas = Array.from(new Set(lancamentos.map((l) => l.conta)));
    const saldoContas = contas.map((c) => ({ conta: c, saldo: lancamentos.filter((l) => l.conta === c).reduce((a, l) => a + l.valor, 0) }));
    const saldoTipos = Object.keys(TIPO_LABELS).map((t) => ({
        tipo: t, label: TIPO_LABELS[t], total: lancamentos.filter((l) => l.tipo === t).reduce((a, l) => a + Math.abs(l.valor), 0),
    })).filter((t) => t.total > 0);

    const lancar = async () => {
        if (!novoLanc.data || !novoLanc.descricao || !novoLanc.valor) return;
        setIsSaving(true);
        await fetch("/api/lancamentos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                estabelecimento_id: estabelecimentoId,
                data: novoLanc.data,
                tipo: novoLanc.tipo,
                descricao: novoLanc.descricao,
                valor: novoLanc.tipo === "FL" ? Math.abs(parseFloat(novoLanc.valor)) : -Math.abs(parseFloat(novoLanc.valor)),
                conta: novoLanc.conta,
                fonte: "manual",
            }),
        });
        setIsSaving(false);
        setNovoLanc({ data: "", tipo: "FL", descricao: "", valor: "", conta: "Caixa" });
        window.location.reload();
    };

    return (
        <div className="grid gap-[14px]" style={{ gridTemplateColumns: "1fr 320px" }}>
            <div>
                {/* Form */}
                <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden mb-4">
                    <div className="p-[16px_20px_12px] border-b border-border">
                        <div className="text-[13.5px] font-semibold text-text">Registrar Movimentação</div>
                        <div className="text-[11.5px] text-text-3 mt-0.5">Entradas e saídas do dia</div>
                    </div>
                    <div className="grid gap-3 p-[18px_20px] items-end" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
                        {[
                            { label: "Data", type: "date", field: "data", placeholder: "" },
                        ].map(({ label, field }) => (
                            <div key={field} className="flex flex-col gap-1.5">
                                <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">{label}</label>
                                <input type="date" value={novoLanc.data} onChange={(e) => setNovoLanc({ ...novoLanc, data: e.target.value })}
                                    className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all" />
                            </div>
                        ))}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Tipo</label>
                            <select value={novoLanc.tipo} onChange={(e) => setNovoLanc({ ...novoLanc, tipo: e.target.value })}
                                className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all">
                                <option value="FL">Venda / Entrada (FL)</option>
                                <option value="MP">Compra de Ingrediente (MP)</option>
                                <option value="FX">Despesa Fixa (FX)</option>
                                <option value="VA">Despesa Variável (VA)</option>
                                <option value="TX">Taxa Bancária (TX)</option>
                                <option value="OP">Operacional (OP)</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Descrição</label>
                            <input type="text" value={novoLanc.descricao} onChange={(e) => setNovoLanc({ ...novoLanc, descricao: e.target.value })} placeholder="Ex: Vendas do dia"
                                className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Valor (R$)</label>
                            <input type="number" value={novoLanc.valor} onChange={(e) => setNovoLanc({ ...novoLanc, valor: e.target.value })} placeholder="0,00" step="0.01"
                                className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Conta</label>
                            <select value={novoLanc.conta} onChange={(e) => setNovoLanc({ ...novoLanc, conta: e.target.value })}
                                className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all">
                                {["Caixa", "Pix", "Cartão Crédito", "Cartão Débito", "Conta Corrente"].map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={lancar} disabled={isSaving}
                                className="inline-flex items-center gap-1.5 px-[15px] py-2 rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] disabled:opacity-50 transition-all w-full justify-center">
                                {isSaving ? "Salvando…" : "Lançar"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Extrato */}
                <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden mb-[18px]">
                    <div className="p-[16px_20px_12px] flex items-center justify-between border-b border-border flex-wrap gap-2">
                        <div className="text-[13.5px] font-semibold text-text">Extrato do Período</div>
                        <div className="flex gap-1.5 flex-wrap">
                            {FILTROS.map((f) => (
                                <button key={f.value} onClick={() => setFiltroAtivo(f.value)}
                                    className={`px-2 py-0.5 rounded text-[10.5px] font-medium border transition-all ${filtroAtivo === f.value ? "bg-surface-2 border-border-strong text-text" : "bg-transparent border-border-strong text-text-2 hover:bg-surface"}`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="max-h-[420px] overflow-y-auto">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0">
                                <tr>
                                    {["Tipo", "Data", "Descrição", "Conta", "Valor", "Saldo Acum.", ""].map((h, i) => (
                                        <th key={i} className={`px-5 py-[9px] text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2 ${i >= 4 ? "text-right" : "text-left"}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {extrato.length === 0 ? (
                                    <tr><td colSpan={7} className="px-5 py-10 text-center text-text-3 text-[13px]">Nenhum lançamento encontrado.</td></tr>
                                ) : extrato.map((l) => (
                                    <tr key={l.id} className="hover:bg-surface-2">
                                        <td className="px-5 py-[10px] border-b border-border">
                                            <span className={`inline-flex items-center justify-center w-[26px] h-[26px] rounded-[5px] text-[9px] font-bold tracking-[0.04em] ${TIPO_COLORS[l.tipo] || "bg-surface-2 text-text-2"}`}>{l.tipo}</span>
                                        </td>
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border text-text-2">{new Date(l.data + "T00:00").toLocaleDateString("pt-BR")}</td>
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border">{l.descricao}</td>
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border text-text-2">{l.conta}</td>
                                        <td className={`px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums font-semibold ${l.valor >= 0 ? "text-success" : "text-danger"}`}>
                                            {l.valor >= 0 ? "+" : ""}{formatBRL(l.valor)}
                                        </td>
                                        <td className={`px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums ${l.acumulado >= 0 ? "text-success" : "text-danger"}`}>
                                            {formatBRL(l.acumulado)}
                                        </td>
                                        <td className="px-5 py-[10px] border-b border-border">
                                            <button className="text-[10.5px] px-2 py-0.5 rounded text-text-3 hover:text-danger hover:bg-danger-light transition-all">✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Resumo lateral */}
            <div>
                <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
                    <div className="text-center px-[18px] py-[22px] border-b border-border">
                        <div className="text-[10.5px] text-text-3 uppercase tracking-[0.08em] font-semibold mb-1.5">Saldo do Período</div>
                        <div className={`font-serif text-[38px] font-light tracking-[-1px] ${saldoTotal >= 0 ? "text-success" : "text-danger"}`}>{formatBRL(saldoTotal)}</div>
                    </div>
                    <div className="px-4 pt-3.5 pb-2.5 border-b border-border">
                        <div className="text-[10.5px] text-text-3 font-semibold uppercase tracking-[0.06em] mb-2">Saldo por Conta</div>
                        {saldoContas.length === 0 ? <p className="text-[12px] text-text-3 py-2">Sem movimentações.</p> : saldoContas.map((c, i) => (
                            <div key={c.conta} className="flex justify-between items-center py-[10px] border-b border-border last:border-b-0 text-[12.5px]">
                                <div className="flex items-center gap-2">
                                    <span className="w-[7px] h-[7px] rounded-full" style={{ background: CONTAS_COLORS[i % CONTAS_COLORS.length] }} />{c.conta}
                                </div>
                                <span className={`font-semibold tabular-nums ${c.saldo >= 0 ? "text-success" : "text-danger"}`}>{formatBRL(c.saldo)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="px-4 pt-3.5 pb-4">
                        <div className="text-[10.5px] text-text-3 font-semibold uppercase tracking-[0.06em] mb-2">Por Tipo de Movimentação</div>
                        {saldoTipos.map((t) => (
                            <div key={t.tipo} className="flex justify-between text-[12px] py-1 text-text-2">
                                <span>{t.label}</span>
                                <span className="tabular-nums font-medium text-text">{formatBRL(t.total)}</span>
                            </div>
                        ))}
                        {saldoTipos.length > 0 && (
                            <div className="mt-3">
                                <ResponsiveContainer width="100%" height={120}>
                                    <BarChart data={saldoTipos} barSize={14}>
                                        <XAxis dataKey="tipo" tick={{ fontSize: 9, fill: "#AEAEB2" }} axisLine={false} tickLine={false} />
                                        <YAxis hide />
                                        <Tooltip formatter={(v: unknown) => formatBRL(Number(v))} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                                        <Bar dataKey="total" fill="#2C6E49" radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
