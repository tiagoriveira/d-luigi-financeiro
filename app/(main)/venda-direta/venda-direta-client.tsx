"use client";

import { useState } from "react";

function formatBRL(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface VendaDiretaItem { id: string; nome: string; categoria: string; custo: number; preco_atual: number; previsao_mes: number; }

interface Props {
    estabelecimentoId: string;
    itens: VendaDiretaItem[];
}

export default function VendaDiretaClient({ estabelecimentoId, itens }: Props) {
    const [lista, setLista] = useState(itens);
    const [markup, setMarkup] = useState(40);

    const totalLucro = lista.reduce((acc, p) => acc + (p.preco_atual - p.custo) * p.previsao_mes, 0);

    return (
        <div>
            <div className="flex items-start gap-[9px] bg-info-light border border-info/30 rounded-sm px-[14px] py-[10px] text-[12.5px] text-[#075985] mb-4">
                <span className="text-[14px] mt-px">🥤</span>
                <div>
                    <div className="font-semibold mb-0.5">O que é Venda Direta?</div>
                    Produtos que você compra prontos e revende. A margem costuma ser diferente das fichas de custo.
                </div>
            </div>

            <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden mb-[18px]">
                <div className="p-[16px_20px_12px] flex items-center justify-between border-b border-border flex-wrap gap-2">
                    <div>
                        <div className="text-[13.5px] font-semibold text-text">Produtos de Revenda</div>
                        <div className="text-[11.5px] text-text-3 mt-0.5">Comprados prontos e vendidos sem transformação</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-[12.5px]">
                            <span className="text-text-2">Markup bebidas:</span>
                            <input type="number" value={markup} onChange={(e) => setMarkup(Number(e.target.value))}
                                className="w-[60px] text-center font-semibold text-[13px] px-2 py-1.5 border border-border-strong rounded-sm bg-surface outline-none focus:border-accent" />
                            <span className="text-text-3">%</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse" style={{ minWidth: 800 }}>
                        <thead>
                            <tr>
                                {["Produto", "Categoria", "Custo de Compra", "Preço Sugerido", "Preço Praticado", "Lucro/Un", "Previsão Mensal", "Lucro Previsto/Mês"].map((h, i) => (
                                    <th key={i} className={`px-5 py-[9px] text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2 ${i > 1 && i < 8 ? "text-right" : "text-left"}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {lista.length === 0 ? (
                                <tr><td colSpan={8} className="px-5 py-10 text-center text-text-3 text-[13px]">Nenhum produto de revenda cadastrado.</td></tr>
                            ) : lista.map((p) => {
                                const precoSugerido = markup > 0 ? p.custo / (1 - markup / 100) : p.custo;
                                const lucroUn = p.preco_atual - p.custo;
                                const lucroMes = lucroUn * p.previsao_mes;
                                return (
                                    <tr key={p.id} className="hover:bg-surface-2">
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border font-medium">{p.nome}</td>
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border text-text-2">{p.categoria}</td>
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums">{formatBRL(p.custo)}</td>
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums text-text-2">{formatBRL(precoSugerido)}</td>
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums font-semibold">{formatBRL(p.preco_atual)}</td>
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums">
                                            <span className={lucroUn >= 0 ? "text-success font-medium" : "text-danger font-medium"}>{formatBRL(lucroUn)}</span>
                                        </td>
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums">{p.previsao_mes} un</td>
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums font-semibold text-accent">{formatBRL(lucroMes)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        {lista.length > 0 && (
                            <tfoot>
                                <tr className="bg-surface-2 font-semibold">
                                    <td colSpan={7} className="px-5 py-[10px] text-right text-text-2 text-[13px]">Total Lucro Previsto/Mês:</td>
                                    <td className="px-5 py-[10px] text-right tabular-nums font-bold text-[13px] text-accent">{formatBRL(totalLucro)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
}
