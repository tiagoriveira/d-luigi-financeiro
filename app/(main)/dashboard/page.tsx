"use client";

import { useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    lancamentos,
    despesas,
    salarios,
    prolabore,
    produtos,
    estabelecimento,
    formatBRL,
    calcMargem,
    getMargemBadge,
} from "@/lib/mock-data";

const ENCARGOS = 1.18;

const fluxoPorDia = () => {
    const mapa: Record<string, { entradas: number; saidas: number; label: string }> = {};
    lancamentos.forEach((l) => {
        const d = l.data.split("-")[2];
        if (!mapa[d]) mapa[d] = { entradas: 0, saidas: 0, label: `dia ${parseInt(d)}` };
        if (l.valor > 0) mapa[d].entradas += l.valor;
        else mapa[d].saidas += Math.abs(l.valor);
    });
    return Object.values(mapa);
};

export default function DashboardPage() {
    const faturamento = lancamentos.filter((l) => l.tipo === "FL").reduce((a, l) => a + l.valor, 0);
    const totalDesp = despesas.reduce((a, d) => a + d.valor, 0);
    const totalSal = salarios.reduce((a, s) => a + s.salario * ENCARGOS, 0);
    const totalPl = prolabore.reduce((a, p) => a + p.valor, 0);
    const custos_fixos = totalDesp + totalSal + totalPl;
    const cmv = lancamentos.filter((l) => l.tipo === "MP").reduce((a, l) => a + Math.abs(l.valor), 0);
    const lucro = faturamento - cmv - custos_fixos;

    const cmvPct = faturamento ? (cmv / faturamento) * 100 : 0;
    const despPct = faturamento ? (custos_fixos / faturamento) * 100 : 0;
    const lucroPct = faturamento ? (lucro / faturamento) * 100 : 0;

    const fluxo = fluxoPorDia();

    const pieDados = [
        { name: "Insumos", value: cmvPct, color: "#BF6A2E" },
        { name: "Fixos", value: despPct, color: "#C0392B" },
        { name: "Lucro", value: Math.max(lucroPct, 0), color: "#2C6E49" },
    ];

    const rateioFixo = faturamento ? custos_fixos / faturamento : 0;

    return (
        <div>
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-[14px] mb-5">
                <KpiCard
                    label="Faturamento Bruto"
                    tooltip="Total de vendas do período registradas no fluxo de caixa (entradas do tipo Venda)."
                    value={formatBRL(faturamento)}
                    delta="Mês atual"
                    deltaClass="pos"
                    barWidth={72}
                    barColor="var(--accent)"
                />
                <KpiCard
                    label="Custo dos Insumos"
                    tooltip="Quanto você gastou em matéria-prima. Ideal ficar abaixo de 35% em pizzarias."
                    value={formatBRL(cmv)}
                    delta={`${cmvPct.toFixed(1)}% do faturamento`}
                    deltaClass={cmvPct > 35 ? "neg" : "warn"}
                    barWidth={cmvPct}
                    barColor="var(--accent-warm)"
                />
                <KpiCard
                    label="Custos Fixos + Equipe"
                    tooltip="Soma de aluguel, contas, salários e pró-labore."
                    value={formatBRL(custos_fixos)}
                    delta={`${despPct.toFixed(1)}% do faturamento`}
                    deltaClass="neg"
                    barWidth={despPct}
                    barColor="var(--red-color)"
                />
                <KpiCard
                    label="Lucro Estimado"
                    tooltip="Faturamento menos custos dos insumos e despesas fixas."
                    value={formatBRL(lucro)}
                    delta={`${lucroPct.toFixed(1)}% do faturamento`}
                    deltaClass={lucro >= 0 ? "pos" : "neg"}
                    barWidth={Math.max(lucroPct, 0)}
                    barColor="var(--accent)"
                />
            </div>

            {/* Charts */}
            <div className="grid gap-[14px] mb-5" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
                <div className="bg-surface rounded-card border border-border p-[18px_20px_12px] shadow-sm">
                    <div className="text-[13px] font-semibold text-text mb-3.5">Entradas e Saídas por Dia</div>
                    <ResponsiveContainer width="100%" height={155}>
                        <BarChart data={fluxo} barSize={8} barGap={2}>
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#AEAEB2" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: "#AEAEB2" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid rgba(0,0,0,0.07)" }}
                                formatter={(v: any) => formatBRL(Number(v))}
                            />
                            <Bar dataKey="entradas" fill="#2C6E49" radius={[3, 3, 0, 0]} name="Entradas" />
                            <Bar dataKey="saidas" fill="#C0392B" radius={[3, 3, 0, 0]} name="Saídas" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-surface rounded-card border border-border p-[18px_20px_12px] shadow-sm">
                    <div className="text-[13px] font-semibold text-text mb-3.5 flex items-center gap-1.5">
                        Para onde vai cada real?
                        <Tooltip2 text="De cada R$1,00 que entra, veja quanto vai para insumos, fixos e sobra como lucro." />
                    </div>
                    <ResponsiveContainer width="100%" height={155}>
                        <PieChart>
                            <Pie data={pieDados} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" nameKey="name" paddingAngle={3}>
                                {pieDados.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-1">
                        {pieDados.map((d) => (
                            <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-text-2">
                                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                                {d.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabela Análise de Margem */}
            <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden mb-[18px]">
                <div className="p-[16px_20px_12px] flex items-center justify-between border-b border-border">
                    <div>
                        <div className="text-[13.5px] font-semibold text-text">Análise de Margem por Produto</div>
                        <div className="text-[11.5px] text-text-3 mt-0.5">Quanto sobra de lucro em cada pizza vendida</div>
                    </div>
                </div>
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="px-5 py-[9px] text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Produto</th>
                            <th className="px-5 py-[9px] text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Tamanho</th>
                            <th className="px-5 py-[9px] text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Custo Ingredientes</th>
                            <th className="px-5 py-[9px] text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Custo Total*</th>
                            <th className="px-5 py-[9px] text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Preço</th>
                            <th className="px-5 py-[9px] text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Margem</th>
                            <th className="px-5 py-[9px] text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Situação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {produtos.map((p) => {
                            const custoTotal = p.custo_direto + p.custo_direto * rateioFixo;
                            const margem = calcMargem(p.preco_atual, custoTotal);
                            const badge = getMargemBadge(margem);
                            return (
                                <tr key={p.id} className="hover:bg-surface-2">
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border font-medium">{p.nome}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-text-2">{p.tamanho}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border tabular-nums font-medium">{formatBRL(p.custo_direto)}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border tabular-nums font-medium">{formatBRL(custoTotal)}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border tabular-nums font-semibold text-accent">{formatBRL(p.preco_atual)}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border tabular-nums font-semibold">
                                        <span className={badge === "verde" ? "text-accent" : badge === "amarelo" ? "text-warning" : "text-danger"}>
                                            {margem.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border">
                                        {badge === "verde" && <Badge variant="green">Saudável</Badge>}
                                        {badge === "amarelo" && <Badge variant="yellow">Atenção</Badge>}
                                        {badge === "vermelho" && <Badge variant="red">Crítico</Badge>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div className="px-5 py-[10px] text-[11px] text-text-3 border-t border-border">
                    *Custo total inclui rateio proporcional de despesas fixas, salários e encargos sobre a projeção de vendas.
                </div>
            </div>
        </div>
    );
}

// ─── Helpers de UI locais ──────────────────────────────

function KpiCard({
    label, tooltip, value, delta, deltaClass, barWidth, barColor,
}: {
    label: string; tooltip: string; value: string; delta: string;
    deltaClass: "pos" | "neg" | "warn"; barWidth: number; barColor: string;
}) {
    return (
        <div className="bg-surface rounded-card border border-border shadow-sm p-[18px_20px]">
            <div className="text-[10.5px] text-text-3 tracking-[0.06em] uppercase font-semibold mb-[7px] flex items-center gap-1.5">
                {label}
                <Tooltip2 text={tooltip} />
            </div>
            <div className="font-serif text-[26px] font-normal text-text leading-none">{value}</div>
            <div className={`text-[11.5px] mt-[5px] flex items-center gap-1 ${deltaClass === "pos" ? "text-accent" : deltaClass === "neg" ? "text-danger" : "text-warning"}`}>
                {deltaClass === "pos" ? "▲" : deltaClass === "neg" ? "▼" : "⚠"} {delta}
            </div>
            <div className="mt-[9px] h-[3px] bg-border rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(barWidth, 100)}%`, background: barColor }} />
            </div>
        </div>
    );
}

function Tooltip2({ text }: { text: string }) {
    const [show, setShow] = useState(false);
    return (
        <span className="relative inline-flex items-center cursor-help" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
            <span className="w-[13px] h-[13px] rounded-full bg-text-3 text-white text-[8px] font-bold inline-flex items-center justify-center">?</span>
            {show && (
                <span className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-text text-white text-[11px] px-[10px] py-[7px] rounded-[7px] shadow-lg z-[200] whitespace-normal max-w-[220px] leading-[1.4] font-normal pointer-events-none">
                    {text}
                </span>
            )}
        </span>
    );
}

function Badge({ variant, children }: { variant: "green" | "yellow" | "red" | "blue" | "neutral"; children: React.ReactNode }) {
    const styles = {
        green: "bg-success-light text-success",
        yellow: "bg-warning-light text-warning",
        red: "bg-danger-light text-danger",
        blue: "bg-info-light text-info",
        neutral: "bg-surface-2 text-text-2 border border-border",
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.02em] ${styles[variant]}`}>
            {children}
        </span>
    );
}
