"use client";

import { preparacoes, formatBRL } from "@/lib/mock-data";

export default function PreparacoesPage() {
    return (
        <div>
            <div className="flex items-start gap-[9px] bg-info-light border border-info/30 rounded-sm px-[14px] py-[10px] text-[12.5px] text-[#075985] mb-4">
                <span className="text-[14px] mt-px">🍕</span>
                <div>
                    <div className="font-semibold mb-0.5">O que são Preparações?</div>
                    São itens que você faz na cozinha antes de montar os produtos finais. Ex: a massa de pizza, o molho de tomate, o strogonoff. Elas têm um custo próprio que entra nas fichas dos produtos.
                </div>
            </div>

            <div className="flex justify-end mb-4">
                <button className="inline-flex items-center gap-1.5 px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all whitespace-nowrap">
                    + Nova Preparação
                </button>
            </div>

            <div className="grid gap-[14px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                {preparacoes.map((prep) => (
                    <div key={prep.id} className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="px-4 pt-[14px] pb-[10px] flex items-center justify-between border-b border-border"
                            style={{ background: "linear-gradient(135deg, #F0F4FF, #E8EDF8)" }}>
                            <div>
                                <div className="font-serif text-[16px] font-medium text-text">{prep.nome}</div>
                                <div className="text-[10.5px] text-text-3 mt-0.5">Rendimento: {prep.rendimento}</div>
                            </div>
                            <button className="text-[11px] font-medium text-text-2 px-2 py-1 rounded hover:bg-white/50 transition-all">Editar</button>
                        </div>

                        {/* Body */}
                        <div className="px-4 py-[10px] pb-[14px]">
                            {prep.ingredientes.map((ingr, i) => (
                                <div key={i} className="flex justify-between text-[11.5px] py-[3px] text-text-2">
                                    <span>{ingr.nome}</span>
                                    <span className="text-text-3">{ingr.quantidade} {ingr.unidade}</span>
                                    <span className="font-medium text-text tabular-nums">{formatBRL(ingr.custo)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-[10px] bg-surface-2 border-t border-border flex justify-between items-center">
                            <div>
                                <div className="text-[9.5px] text-text-3 font-semibold uppercase tracking-[0.06em]">Custo Total</div>
                                <div className="font-serif text-[17px] font-medium text-text">{formatBRL(prep.custo_total)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[9.5px] text-text-3 font-semibold uppercase tracking-[0.06em]">Custo/Unidade</div>
                                <div className="font-serif text-[17px] font-medium text-accent">{formatBRL(prep.custo_por_unidade)}</div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Card de adicionar */}
                <div className="bg-surface rounded-card border-2 border-dashed border-border hover:border-accent cursor-pointer transition-all flex items-center justify-center min-h-[180px] group">
                    <div className="text-center text-text-3 group-hover:text-accent transition-colors">
                        <div className="text-3xl mb-2">+</div>
                        <div className="text-[13px] font-medium">Nova Preparação</div>
                        <div className="text-[11px] mt-1">Adicionar base ou subreceita</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
