"use client";

import { useState } from "react";

function formatBRL(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Despesa { id: string; descricao: string; valor: number; categoria: string; }
interface Salario { id: string; funcao: string; salario: number; }
interface Prolabore { id: string; nome: string; valor: number; }

interface Props {
    estabelecimentoId: string;
    imposto: number;
    lucroDesejado: number;
    projecaoVendas: number;
    despesas: Despesa[];
    salarios: Salario[];
    prolabore: Prolabore[];
}

const ENCARGOS = 1.18;

function ProgressBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const pct = max ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="mb-2">
            <div className="flex justify-between text-[11px] text-text-3 mb-1"><span>{label}</span><span>{pct.toFixed(1)}%</span></div>
            <div className="h-[6px] bg-border rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    );
}

export default function DespesasClient({ estabelecimentoId, imposto, lucroDesejado, projecaoVendas, despesas: initialDespesas, salarios, prolabore: initialPl }: Props) {
    const [regime, setRegime] = useState(imposto);
    const [lucro, setLucro] = useState(lucroDesejado * 100);
    const [projecao, setProjecao] = useState(projecaoVendas);
    const [listaDespesas, setListaDespesas] = useState(initialDespesas);
    const [listaPl, setListaPl] = useState(initialPl);
    const [novaDescricao, setNovaDescricao] = useState("");
    const [novoValor, setNovoValor] = useState("");
    const [plNome, setPlNome] = useState("");
    const [plValor, setPlValor] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const markup = 1 - (regime + lucro / 100);
    const totalDesp = listaDespesas.reduce((a, d) => a + d.valor, 0);
    const totalSal = salarios.reduce((a, s) => a + s.salario * ENCARGOS, 0);
    const totalPl = listaPl.reduce((a, p) => a + p.valor, 0);
    const totalFixos = totalDesp + totalSal + totalPl;

    const addDespesa = async () => {
        if (!novaDescricao || !novoValor) return;
        setIsSaving(true);
        const res = await fetch("/api/despesas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estabelecimento_id: estabelecimentoId, descricao: novaDescricao, valor: parseFloat(novoValor), categoria: "Operacional" }),
        });
        if (res.ok) {
            const saved = await res.json();
            setListaDespesas([...listaDespesas, saved]);
            setNovaDescricao(""); setNovoValor("");
        }
        setIsSaving(false);
    };

    const addProlabore = async () => {
        if (!plNome || !plValor) return;
        setIsSaving(true);
        const res = await fetch("/api/prolabore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estabelecimento_id: estabelecimentoId, nome: plNome, valor: parseFloat(plValor) }),
        });
        if (res.ok) {
            const saved = await res.json();
            setListaPl([...listaPl, saved]);
            setPlNome(""); setPlValor("");
        }
        setIsSaving(false);
    };

    return (
        <div className="grid gap-[14px]" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {/* Coluna 1 */}
            <div>
                <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden mb-[18px]">
                    <div className="p-[16px_20px_12px] border-b border-border">
                        <div className="text-[13.5px] font-semibold text-text">Despesas Fixas do Negócio</div>
                        <div className="text-[11.5px] text-text-3 mt-0.5">Custos que você paga todo mês independente do volume de vendas</div>
                    </div>
                    <div className="grid gap-3 p-[18px_20px] border-b border-border items-end" style={{ gridTemplateColumns: "1fr 150px auto" }}>
                        <input type="text" value={novaDescricao} onChange={(e) => setNovaDescricao(e.target.value)} placeholder="Ex: Aluguel, Água, Luz..."
                            className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" />
                        <input type="number" value={novoValor} onChange={(e) => setNovoValor(e.target.value)} placeholder="0,00"
                            className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" />
                        <button onClick={addDespesa} disabled={isSaving}
                            className="inline-flex items-center gap-1.5 px-[15px] py-2 rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] disabled:opacity-50 transition-all">
                            + Adicionar
                        </button>
                    </div>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="px-5 py-[9px] text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Descrição</th>
                                <th className="px-5 py-[9px] text-right text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Valor/Mês</th>
                                <th className="px-5 py-[9px] text-right text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Custo por R$1 vendido</th>
                                <th className="px-5 py-[9px] border-b border-border bg-surface-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {listaDespesas.map((d) => {
                                const ratioUn = projecao ? d.valor / projecao : 0;
                                return (
                                    <tr key={d.id} className="hover:bg-surface-2">
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border">{d.descricao}</td>
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums font-medium">{formatBRL(d.valor)}</td>
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums text-text-2">R$ {ratioUn.toFixed(4)}</td>
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border text-right">
                                            <button className="text-[10.5px] px-2 py-0.5 rounded text-text-3 hover:text-danger hover:bg-danger-light transition-all">✕</button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {listaDespesas.length === 0 && (
                                <tr><td colSpan={4} className="px-5 py-8 text-center text-text-3 text-[13px]">Nenhuma despesa cadastrada.</td></tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-surface-2 font-semibold">
                                <td className="px-5 py-[10px] text-[13px]">Total Fixos</td>
                                <td className="px-5 py-[10px] text-[13px] text-right tabular-nums">{formatBRL(totalDesp)}</td>
                                <td className="px-5 py-[10px] text-[13px] text-right tabular-nums text-text-2">R$ {projecao ? (totalDesp / projecao).toFixed(4) : "—"}</td>
                                <td />
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Pró-labore */}
                <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden mb-[18px]">
                    <div className="p-[16px_20px_12px] border-b border-border">
                        <div className="text-[13.5px] font-semibold text-text">Pró-Labore (Retirada do Sócio)</div>
                        <div className="text-[11.5px] text-text-3 mt-0.5">O que o dono retira mensalmente — separado dos salários da equipe</div>
                    </div>
                    <div className="grid gap-3 p-[18px_20px] border-b border-border items-end" style={{ gridTemplateColumns: "1fr 1fr auto" }}>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Nome do Sócio</label>
                            <input type="text" value={plNome} onChange={(e) => setPlNome(e.target.value)} placeholder="Ex: Maria"
                                className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Retirada Mensal (R$)</label>
                            <input type="number" value={plValor} onChange={(e) => setPlValor(e.target.value)} placeholder="0,00"
                                className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all" />
                        </div>
                        <button onClick={addProlabore} disabled={isSaving}
                            className="inline-flex items-center gap-1.5 px-[15px] py-2 rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] disabled:opacity-50 transition-all">
                            + Adicionar
                        </button>
                    </div>
                    <table className="w-full border-collapse">
                        <tbody>
                            {listaPl.map((p) => (
                                <tr key={p.id} className="hover:bg-surface-2">
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border">{p.nome}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums font-medium">{formatBRL(p.valor)}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-right">
                                        <button className="text-[10.5px] px-2 py-0.5 rounded text-text-3 hover:text-danger hover:bg-danger-light transition-all">✕</button>
                                    </td>
                                </tr>
                            ))}
                            {listaPl.length === 0 && (
                                <tr><td colSpan={3} className="px-5 py-8 text-center text-text-3 text-[13px]">Nenhum pró-labore cadastrado.</td></tr>
                            )}
                        </tbody>
                        {listaPl.length > 0 && (
                            <tfoot>
                                <tr className="bg-surface-2 font-semibold">
                                    <td className="px-5 py-[10px] text-[13px]">Total Pró-Labore</td>
                                    <td className="px-5 py-[10px] text-[13px] text-right tabular-nums">{formatBRL(totalPl)}</td>
                                    <td />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* Coluna 2 */}
            <div>
                {/* Salários */}
                <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden mb-[18px]">
                    <div className="p-[16px_20px_12px] border-b border-border">
                        <div className="text-[13.5px] font-semibold text-text">Mão de Obra (Equipe)</div>
                        <div className="text-[11.5px] text-text-3 mt-0.5">Salários + 18% de encargos trabalhistas</div>
                    </div>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="px-5 py-[9px] text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Função</th>
                                <th className="px-5 py-[9px] text-right text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Salário</th>
                                <th className="px-5 py-[9px] text-right text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Com Encargos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salarios.map((s) => (
                                <tr key={s.id} className="hover:bg-surface-2">
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border">{s.funcao}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums">{formatBRL(s.salario)}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums font-medium">{formatBRL(s.salario * ENCARGOS)}</td>
                                </tr>
                            ))}
                            {salarios.length === 0 && (
                                <tr><td colSpan={3} className="px-5 py-8 text-center text-text-3 text-[13px]">Nenhum salário cadastrado.</td></tr>
                            )}
                        </tbody>
                        {salarios.length > 0 && (
                            <tfoot>
                                <tr className="bg-surface-2 font-semibold">
                                    <td className="px-5 py-[10px] text-[13px]">Total Equipe</td>
                                    <td className="px-5 py-[10px] text-[13px] text-right tabular-nums">{formatBRL(salarios.reduce((a, s) => a + s.salario, 0))}</td>
                                    <td className="px-5 py-[10px] text-[13px] text-right tabular-nums">{formatBRL(totalSal)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* Configurações */}
                <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
                    <div className="p-[16px_20px_12px] border-b border-border">
                        <div className="text-[13.5px] font-semibold text-text">Configurações do Negócio</div>
                    </div>
                    <div className="p-[16px_20px] flex flex-col gap-[14px]">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Faturamento Esperado por Mês (R$)</label>
                            <input type="number" value={projecao} onChange={(e) => setProjecao(Number(e.target.value))}
                                className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Regime de Imposto</label>
                            <select value={regime} onChange={(e) => setRegime(Number(e.target.value))}
                                className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all">
                                <option value={0.06}>Simples Nacional — 6%</option>
                                <option value={0.12}>Regime Normal — 12%</option>
                                <option value={0.0925}>PIS/COFINS — 9,25%</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Lucro Desejado (%)</label>
                            <input type="number" value={lucro} onChange={(e) => setLucro(Number(e.target.value))} step="1" min="0" max="100"
                                className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all" />
                        </div>
                        <div className="bg-surface-2 rounded-sm px-[16px] py-[14px] border border-border">
                            <div className="text-[10.5px] text-text-3 font-semibold uppercase tracking-[0.06em] mb-1.5">Divisor de Preço Calculado</div>
                            <div className="font-serif text-[34px] font-normal text-accent">{(markup * 100).toFixed(1)}%</div>
                            <div className="text-[11px] text-text-3 mt-0.5">Fórmula: 1 − (impostos + lucro)</div>
                        </div>
                        <div className="bg-surface-2 rounded-sm px-[16px] py-[14px] border border-border">
                            <div className="text-[10.5px] text-text-3 font-semibold uppercase tracking-[0.06em] mb-2.5">Distribuição dos Custos</div>
                            <ProgressBar label="Impostos" value={regime * 100} max={100} color="#0284C7" />
                            <ProgressBar label="Lucro Desejado" value={lucro} max={100} color="#2C6E49" />
                            <ProgressBar label="Custos Fixos sobre Faturamento" value={projecao ? (totalFixos / projecao) * 100 : 0} max={100} color="#C0392B" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
