"use client";

import { useState } from "react";
import { produtos, estabelecimento, formatBRL, calcMargem, getMargemBadge } from "@/lib/mock-data";

const FILTROS = [
    { label: "Todos", value: "todos" },
    { label: "Família", value: "familia" },
    { label: "Grande", value: "grande" },
    { label: "Broto", value: "broto" },
];

export default function ProdutosPage() {
    const [filtro, setFiltro] = useState("todos");
    const markup = estabelecimento.markup;
    const markupPct = (markup * 100).toFixed(1);

    const filtrados = filtro === "todos" ? produtos : produtos.filter((p) => p.filtro === filtro);

    return (
        <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2.5">
                <div className="flex gap-0.5 bg-surface-2 rounded-sm p-0.5 border border-border">
                    {FILTROS.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFiltro(f.value)}
                            className={`px-[14px] py-[5px] rounded-[6px] text-[12px] font-medium transition-all ${filtro === f.value ? "bg-surface text-text shadow-sm" : "text-text-2 hover:text-text"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2.5 text-[12.5px] text-text-2">
                    <span>Divisor de preço (markup)</span>
                    <span className="font-bold text-accent text-[16px]">{markupPct}%</span>
                    <span className="text-[11px] text-text-3">(definido em Despesas)</span>
                </div>
            </div>

            <div className="grid gap-[14px] mb-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}>
                {filtrados.map((produto) => {
                    const precoSugerido = markup > 0 ? produto.custo_direto / markup : 0;
                    const margem = calcMargem(produto.preco_atual, produto.custo_direto);
                    const badge = getMargemBadge(margem);

                    return (
                        <div key={produto.id} className="bg-surface rounded-card border border-border shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-px transition-all duration-200">
                            {/* Card Header */}
                            <div className="px-4 pt-[14px] pb-[10px] border-b border-border"
                                style={{ background: "linear-gradient(135deg,#F9F8F5 0%,#F0EEE8 100%)" }}>
                                <div className="font-serif text-[17px] font-medium text-text leading-[1.2]">{produto.nome}</div>
                                <div className="text-[10.5px] text-text-3 mt-0.5">{produto.tamanho} · {produto.categoria}</div>
                            </div>

                            {/* Ingredientes */}
                            <div className="px-4 py-3">
                                {produto.ingredientes.map((ingr, i) => (
                                    <div key={i} className={`flex justify-between items-center py-1 text-[12px] ${i < produto.ingredientes.length - 1 ? "border-b border-border" : ""}`}>
                                        <span className="text-text-2 flex-1">{ingr.nome}</span>
                                        <span className="text-text-3 text-[10.5px] mx-1.5">{ingr.quantidade}{ingr.unidade}</span>
                                        <span className="text-text font-medium tabular-nums">{formatBRL(ingr.quantidade * ingr.custo_un)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-[10px] bg-surface-2 border-t border-border">
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                        <div className="text-[9.5px] text-text-3 font-semibold uppercase tracking-[0.06em]">Custo Direto</div>
                                        <div className="font-serif text-[17px] font-medium text-text">{formatBRL(produto.custo_direto)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9.5px] text-text-3 font-semibold uppercase tracking-[0.06em]">Preço Sugerido</div>
                                        <div className="font-serif text-[17px] font-medium text-accent">{formatBRL(precoSugerido)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[9.5px] text-text-3 font-semibold uppercase tracking-[0.06em]">Praticado</div>
                                        <div className="font-serif text-[17px] font-semibold">{formatBRL(produto.preco_atual)}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9.5px] text-text-3 font-semibold uppercase tracking-[0.06em]">Margem</div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${badge === "verde" ? "bg-success-light text-success" : badge === "amarelo" ? "bg-warning-light text-warning" : "bg-danger-light text-danger"}`}>
                                            {margem.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Card de adicionar */}
                <div className="bg-surface rounded-card border-2 border-dashed border-border hover:border-accent cursor-pointer transition-all flex items-center justify-center min-h-[200px] group">
                    <div className="text-center text-text-3 group-hover:text-accent transition-colors">
                        <div className="text-3xl mb-2">+</div>
                        <div className="text-[13px] font-medium">Nova Ficha</div>
                        <div className="text-[11px] mt-1">Montar um novo produto</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
