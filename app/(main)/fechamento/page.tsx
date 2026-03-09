"use client";

import { useState } from "react";
import { lancamentos, despesas, ingredientes, formatBRL } from "@/lib/mock-data";

const CHECKLIST_ITEMS = [
    "Todas as vendas da semana foram lançadas no fluxo de caixa",
    "Compras de ingredientes lançadas como MP",
    "Despesas fixas lançadas (aluguel, luz, gás)",
    "Salários e encargos lançados",
    "Pró-labore lançado",
    "Retiradas extras registradas como VA",
];

export default function FechamentoPage() {
    const [step, setStep] = useState(1);
    const [checklist, setChecklist] = useState<boolean[]>(CHECKLIST_ITEMS.map(() => false));

    const toggleCheck = (i: number) => {
        const next = [...checklist];
        next[i] = !next[i];
        setChecklist(next);
    };

    const faturamento = lancamentos.filter((l) => l.tipo === "FL").reduce((a, l) => a + l.valor, 0);
    const saidas = lancamentos.filter((l) => l.valor < 0).reduce((a, l) => a + Math.abs(l.valor), 0);
    const saldo = lancamentos.reduce((a, l) => a + l.valor, 0);

    const month = new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });
    const monthCap = month.charAt(0).toUpperCase() + month.slice(1);

    const steps = [
        { num: 1, label: "Verificar lançamentos" },
        { num: 2, label: "Subir notas fiscais" },
        { num: 3, label: "Revisar custos" },
        { num: 4, label: "Relatório para contador" },
    ];

    return (
        <div>
            <div className="flex items-start gap-[9px] bg-info-light border border-info/30 rounded-sm px-[14px] py-[10px] text-[12.5px] text-[#075985] mb-5">
                <span className="text-[14px] mt-px">📅</span>
                <div>
                    <div className="font-semibold mb-0.5">Fluxo de uso mensal</div>
                    Abra este módulo uma vez por mês. O sistema guia você pelos 4 passos para fechar o mês, subir as notas e gerar o relatório para o contador.
                </div>
            </div>

            {/* Step bar */}
            <div className="flex mb-6">
                {steps.map((s, i) => (
                    <div
                        key={s.num}
                        onClick={() => setStep(s.num)}
                        className={`flex-1 px-4 py-[14px] border-r border-border last:border-r-0 cursor-pointer transition-all ${step === s.num ? "bg-accent-2 border-accent/25" :
                                step > s.num ? "bg-success-light" : "bg-surface border-border"
                            } ${i === 0 ? "rounded-l-sm" : ""} ${i === steps.length - 1 ? "border-r rounded-r-sm" : ""}`}
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mb-1.5 ${step === s.num ? "bg-accent text-white" : step > s.num ? "bg-success text-white" : "bg-border text-text-3"
                            }`}>{s.num}</div>
                        <div className={`text-[12px] font-semibold ${step === s.num ? "text-accent" : step > s.num ? "text-success" : "text-text-2"}`}>
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Passo 1 */}
            {step === 1 && (
                <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
                        <div className="p-[16px_20px_12px] border-b border-border">
                            <div className="text-[13.5px] font-semibold text-text">Checklist do Mês</div>
                        </div>
                        <div className="p-[16px_20px]">
                            {CHECKLIST_ITEMS.map((item, i) => (
                                <div key={i} onClick={() => toggleCheck(i)} className="flex items-center gap-2.5 py-[10px] border-b border-border last:border-b-0 cursor-pointer text-[13px]">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all border-2 ${checklist[i] ? "bg-accent border-accent text-white" : "border-border-strong"}`}>
                                        {checklist[i] && "✓"}
                                    </div>
                                    <span className={checklist[i] ? "line-through text-text-3" : "text-text"}>{item}</span>
                                </div>
                            ))}
                        </div>
                        <div className="p-[12px_20px] border-t border-border">
                            <button onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all">
                                Próximo → Notas Fiscais
                            </button>
                        </div>
                    </div>
                    <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
                        <div className="p-[16px_20px_12px] border-b border-border">
                            <div className="text-[13.5px] font-semibold text-text">Resumo do Período</div>
                            <div className="text-[11.5px] text-text-3 mt-0.5">Lançamentos registrados</div>
                        </div>
                        <div className="p-[16px_20px] flex flex-col gap-3">
                            {[
                                { label: "Total de Entradas", value: faturamento, color: "text-success" },
                                { label: "Total de Saídas", value: saidas, color: "text-danger" },
                                { label: "Saldo do Mês", value: saldo, color: saldo >= 0 ? "text-success" : "text-danger" },
                            ].map((item) => (
                                <div key={item.label} className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
                                    <span className="text-[13px] text-text-2">{item.label}</span>
                                    <span className={`font-serif text-[22px] font-medium ${item.color}`}>{formatBRL(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Passo 2 */}
            {step === 2 && (
                <div>
                    <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                        <div>
                            <div className="border-2 border-dashed border-border-strong rounded-card p-10 text-center cursor-pointer hover:border-accent hover:bg-accent-2 transition-all bg-surface-2 mb-3.5">
                                <div className="text-[32px] mb-2.5">📎</div>
                                <div className="text-[14px] font-medium mb-1.5">Arraste notas fiscais aqui</div>
                                <div className="text-[12px] text-text-3">Ou clique para selecionar · JPG, PNG, PDF</div>
                            </div>
                        </div>
                        <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
                            <div className="p-[16px_20px_12px] border-b border-border">
                                <div className="text-[13.5px] font-semibold text-text">Preencher a partir da nota</div>
                                <div className="text-[11.5px] text-text-3 mt-0.5">Veja a nota ao lado e preencha os campos</div>
                            </div>
                            <div className="p-5 text-center text-text-3 min-h-[200px] flex flex-col items-center justify-center border-b border-border">
                                <div className="text-[28px] mb-2">🧾</div>
                                <div className="text-[13px]">Selecione uma nota para visualizar</div>
                            </div>
                            <div className="grid gap-3 p-[18px_20px] border-b border-border items-end" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr auto" }}>
                                {["Fornecedor", "Tipo", "Valor (R$)", "Data"].map((lbl) => (
                                    <div key={lbl} className="flex flex-col gap-1.5">
                                        <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">{lbl}</label>
                                        <input type={lbl === "Valor (R$)" ? "number" : lbl === "Data" ? "date" : "text"} placeholder={lbl === "Fornecedor" ? "Ex: Mart Minas" : lbl === "Valor (R$)" ? "0,00" : ""}
                                            className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all" />
                                    </div>
                                ))}
                                <button className="inline-flex items-center justify-center gap-1.5 px-[15px] py-2 rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all whitespace-nowrap">
                                    + Lançar
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2.5">
                        <button onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium border border-border-strong bg-transparent text-text-2 hover:bg-surface hover:text-text transition-all">← Voltar</button>
                        <button onClick={() => setStep(3)} className="inline-flex items-center gap-1.5 px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all">Próximo → Revisar Custos</button>
                    </div>
                </div>
            )}

            {/* Passo 3 */}
            {step === 3 && (
                <div>
                    <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                        <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
                            <div className="p-[16px_20px_12px] border-b border-border">
                                <div className="text-[13.5px] font-semibold text-text">Ingredientes — atualizar preços</div>
                                <div className="text-[11.5px] text-text-3 mt-0.5">Algum preço mudou este mês?</div>
                            </div>
                            <div className="max-h-[380px] overflow-y-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="px-5 py-[9px] text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Ingrediente</th>
                                            <th className="px-5 py-[9px] text-right text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Preço Atual</th>
                                            <th className="px-5 py-[9px] text-right text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Atualizar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ingredientes.map((ingr) => (
                                            <tr key={ingr.id} className="hover:bg-surface-2">
                                                <td className="px-5 py-[10px] text-[13px] border-b border-border">{ingr.nome}</td>
                                                <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums font-medium">{formatBRL(ingr.preco_atual)}</td>
                                                <td className="px-5 py-[10px] border-b border-border text-right">
                                                    <input type="number" placeholder="Novo preço" step="0.01"
                                                        className="w-[90px] px-2 py-1 text-right text-[12px] border border-border-strong rounded bg-surface outline-none focus:border-accent" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
                            <div className="p-[16px_20px_12px] border-b border-border">
                                <div className="text-[13.5px] font-semibold text-text">Despesas — confirmar valores</div>
                                <div className="text-[11.5px] text-text-3 mt-0.5">Alguma despesa fixa mudou?</div>
                            </div>
                            <div className="max-h-[380px] overflow-y-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="px-5 py-[9px] text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Despesa</th>
                                            <th className="px-5 py-[9px] text-right text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Valor</th>
                                            <th className="px-5 py-[9px] text-right text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2">Editar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {despesas.map((d) => (
                                            <tr key={d.id} className="hover:bg-surface-2">
                                                <td className="px-5 py-[10px] text-[13px] border-b border-border">{d.descricao}</td>
                                                <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums font-medium">{formatBRL(d.valor)}</td>
                                                <td className="px-5 py-[10px] border-b border-border text-right">
                                                    <button className="text-[11px] px-2 py-0.5 rounded text-text-2 hover:bg-surface-3 border border-border transition-all">Editar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2.5">
                        <button onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium border border-border-strong bg-transparent text-text-2 hover:bg-surface hover:text-text transition-all">← Voltar</button>
                        <button onClick={() => setStep(4)} className="inline-flex items-center gap-1.5 px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all">Próximo → Gerar Relatório</button>
                    </div>
                </div>
            )}

            {/* Passo 4: Relatório */}
            {step === 4 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-[14px] font-semibold">Relatório Gerencial — pronto para enviar ao contador</div>
                        <div className="flex gap-2.5">
                            <button onClick={() => setStep(3)} className="inline-flex items-center gap-1.5 px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium border border-border-strong bg-transparent text-text-2 hover:bg-surface hover:text-text transition-all">← Voltar</button>
                            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all">🖨 Imprimir / PDF</button>
                        </div>
                    </div>
                    <div className="bg-white rounded-card border border-border shadow-md p-8 max-w-2xl">
                        <div className="font-serif text-[24px] font-normal text-text mb-1">Relatório Gerencial</div>
                        <div className="text-[12px] text-text-3 mb-6">{monthCap} · D&apos;Luigi Pizzaria</div>

                        {[
                            { title: "Faturamento", rows: [{ label: "Vendas Totais", value: faturamento }] },
                            { title: "Custos de Insumos (CMV)", rows: [{ label: "Compras de Ingredientes", value: lancamentos.filter((l) => l.tipo === "MP").reduce((a, l) => a + Math.abs(l.valor), 0) }] },
                            { title: "Despesas Fixas", rows: despesas.map((d) => ({ label: d.descricao, value: d.valor })) },
                        ].map((sec) => (
                            <div key={sec.title} className="mb-5">
                                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-3 mb-2 pb-1.5 border-b-2 border-text">{sec.title}</div>
                                {sec.rows.map((r) => (
                                    <div key={r.label} className="flex justify-between py-[5px] text-[13px] border-b border-border">
                                        <span>{r.label}</span>
                                        <span className="tabular-nums font-medium">{formatBRL(r.value)}</span>
                                    </div>
                                ))}
                            </div>
                        ))}

                        <div className="flex justify-between py-2 text-[14px] font-bold border-t-2 border-text mt-1">
                            <span>Lucro Estimado do Mês</span>
                            <span className={`tabular-nums ${saldo >= 0 ? "text-success" : "text-danger"}`}>{formatBRL(saldo)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
