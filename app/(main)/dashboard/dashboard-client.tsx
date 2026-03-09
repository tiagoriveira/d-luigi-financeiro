"use client";

import { useState, useCallback } from "react";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
} from "recharts";

function formatBRL(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Lancamento { id: string; data: string; tipo: string; descricao: string | null; valor: number; conta: string; }
interface Despesa { id: string; descricao: string; valor: number; categoria: string; }
interface Salario { id: string; funcao: string; salario: number; }
interface Prolabore { id: string; nome: string; valor: number; }
interface Produto { id: string; nome: string; tamanho: string | null; categoria: string | null; preco_atual: number; }

interface Props {
    lancamentos: Lancamento[];
    despesas: Despesa[];
    salarios: Salario[];
    prolabore: Prolabore[];
    produtos: Produto[];
    projecaoVendas: number;
}

const ENCARGOS = 1.18;

export default function DashboardClient({ lancamentos, despesas, salarios, prolabore, produtos, projecaoVendas }: Props) {
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
    const rateioFixo = faturamento ? custos_fixos / faturamento : 0;

    // Fluxo por dia
    const mapa: Record<string, { entradas: number; saidas: number; label: string }> = {};
    lancamentos.forEach((l) => {
        const d = l.data.split("-")[2];
        if (!mapa[d]) mapa[d] = { entradas: 0, saidas: 0, label: `dia ${parseInt(d)}` };
        if (l.valor > 0) mapa[d].entradas += l.valor;
        else mapa[d].saidas += Math.abs(l.valor);
    });
    const fluxo = Object.values(mapa);

    const pieDados = [
        { name: "Insumos", value: cmvPct, color: "#BF6A2E" },
        { name: "Fixos", value: despPct, color: "#C0392B" },
        { name: "Lucro", value: Math.max(lucroPct, 0), color: "#2C6E49" },
    ];

    return (
        <div>
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-[14px] mb-5">
                <KpiCard label="Faturamento Bruto" tooltip="Total de vendas registradas no fluxo de caixa."
                    value={formatBRL(faturamento)} delta="Mês atual" deltaClass="pos" barWidth={72} barColor="var(--accent)" />
                <KpiCard label="Custo dos Insumos" tooltip="Quanto você gastou em matéria-prima."
                    value={formatBRL(cmv)} delta={`${cmvPct.toFixed(1)}% do faturamento`}
                    deltaClass={cmvPct > 35 ? "neg" : "warn"} barWidth={cmvPct} barColor="var(--accent-warm)" />
                <KpiCard label="Custos Fixos + Equipe" tooltip="Soma de aluguel, contas, salários e pró-labore."
                    value={formatBRL(custos_fixos)} delta={`${despPct.toFixed(1)}% do faturamento`}
                    deltaClass="neg" barWidth={despPct} barColor="var(--red-color)" />
                <KpiCard label="Lucro Estimado" tooltip="Faturamento menos custos dos insumos e despesas fixas."
                    value={formatBRL(lucro)} delta={`${lucroPct.toFixed(1)}% do faturamento`}
                    deltaClass={lucro >= 0 ? "pos" : "neg"} barWidth={Math.max(lucroPct, 0)} barColor="var(--accent)" />
            </div>

            {/* Charts */}
            <div className="grid gap-[14px] mb-5" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
                <div className="bg-surface rounded-card border border-border p-[18px_20px_12px] shadow-sm">
                    <div className="text-[13px] font-semibold text-text mb-3.5">Entradas e Saídas por Dia</div>
                    {fluxo.length > 0 ? (
                        <ResponsiveContainer width="100%" height={155}>
                            <BarChart data={fluxo} barSize={8} barGap={2}>
                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#AEAEB2" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "#AEAEB2" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid rgba(0,0,0,0.07)" }} formatter={(v: unknown) => formatBRL(Number(v))} />
                                <Bar dataKey="entradas" fill="#2C6E49" radius={[3, 3, 0, 0]} name="Entradas" />
                                <Bar dataKey="saidas" fill="#C0392B" radius={[3, 3, 0, 0]} name="Saídas" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[155px] flex items-center justify-center text-[12px] text-text-3">
                            Nenhum lançamento no período. Registre movimentações no Fluxo de Caixa.
                        </div>
                    )}
                </div>
                <div className="bg-surface rounded-card border border-border p-[18px_20px_12px] shadow-sm">
                    <div className="text-[13px] font-semibold text-text mb-3.5">Para onde vai cada real?</div>
                    {faturamento > 0 ? (
                        <ResponsiveContainer width="100%" height={155}>
                            <PieChart>
                                <Pie data={pieDados} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" nameKey="name" paddingAngle={3}>
                                    {pieDados.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(v: unknown) => `${Number(v).toFixed(1)}%`} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[155px] flex items-center justify-center text-[12px] text-text-3">
                            Sem faturamento registrado ainda.
                        </div>
                    )}
                    <div className="flex justify-center gap-4 mt-1">
                        {pieDados.map((d) => (
                            <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-text-2">
                                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />{d.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabela de produtos */}
            <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden mb-[18px]">
                <div className="p-[16px_20px_12px] flex items-center justify-between border-b border-border">
                    <div>
                        <div className="text-[13.5px] font-semibold text-text">Produtos Importados</div>
                        <div className="text-[11.5px] text-text-3 mt-0.5">{produtos.length} produto(s) no catálogo. Adicione ingredientes para calcular a margem.</div>
                    </div>
                </div>
                {produtos.length > 0 ? (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                {["Produto", "Categoria", "Tamanho", "Preço"].map((h, i) => (
                                    <th key={h} className={`px-5 py-[9px] text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2 ${i >= 3 ? "text-right" : "text-left"}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {produtos.slice(0, 20).map((p) => (
                                <tr key={p.id} className="hover:bg-surface-2">
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border font-medium">{p.nome}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-text-2">{p.categoria ?? "—"}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-text-2">{p.tamanho ?? "—"}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums font-semibold text-accent">{formatBRL(p.preco_atual)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="px-5 py-10 text-center text-[13px] text-text-3">
                        Sincronize o catálogo em <strong>Integrações → Cardápio Web</strong> para ver seus produtos aqui.
                    </div>
                )}
            </div>
        </div>
    );
}

function KpiCard({ label, tooltip, value, delta, deltaClass, barWidth, barColor }: {
    label: string; tooltip: string; value: string; delta: string;
    deltaClass: "pos" | "neg" | "warn"; barWidth: number; barColor: string;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="bg-surface rounded-card border border-border shadow-sm p-[18px_20px]">
            <div className="text-[10.5px] text-text-3 tracking-[0.06em] uppercase font-semibold mb-[7px] flex items-center gap-1.5">
                {label}
                <span className="relative inline-flex items-center cursor-help" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
                    <span className="w-[13px] h-[13px] rounded-full bg-text-3 text-white text-[8px] font-bold inline-flex items-center justify-center">?</span>
                    {show && <span className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-text text-white text-[11px] px-[10px] py-[7px] rounded-[7px] shadow-lg z-[200] whitespace-normal max-w-[220px] leading-[1.4] font-normal pointer-events-none">{tooltip}</span>}
                </span>
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
