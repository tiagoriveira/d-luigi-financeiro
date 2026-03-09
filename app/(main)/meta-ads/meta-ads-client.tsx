"use client";

import { useState } from "react";

function formatBRL(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Props {
    ticketMedioSugerido: number;
}

const campanhasDemo = [
    { id: "1", nome: "Promoção do Dia", status: "Ativa", statusColor: "bg-success-light text-success", impressoes: "—", cliques: 0, gasto: 0, conversoes: 0 },
];

export default function MetaAdsClient({ ticketMedioSugerido }: Props) {
    const [orcamento, setOrcamento] = useState(50);
    const [ticketMedio, setTicketMedio] = useState(ticketMedioSugerido > 0 ? Math.round(ticketMedioSugerido) : 50);
    const [margemMedia, setMargemMedia] = useState(35);

    // Cálculo baseado em ticket médio e margem média (não produto específico — conforme AGENTS.md)
    const vendasMinimas = margemMedia > 0 ? orcamento / (margemMedia / 100) : 0;
    const pedidosMinimos = ticketMedio > 0 ? Math.ceil(vendasMinimas / ticketMedio) : 0;

    return (
        <div>
            {/* Hero */}
            <div className="rounded-card px-8 py-7 text-white mb-5 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg,#1877F2 0%,#0D5FCC 100%)" }}>
                <div className="absolute right-[-40px] top-[-40px] w-[200px] h-[200px] rounded-full bg-white/[0.06]" />
                <div className="font-serif text-[26px] font-normal mb-1.5">Calculadora de Tráfego Pago</div>
                <div className="text-[13px] opacity-80 leading-relaxed">
                    Descubra quantos pedidos extras o anúncio precisa gerar para se pagar — baseado no seu ticket médio real.
                </div>
            </div>

            <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {/* Calculadora */}
                <div className="bg-surface rounded-card border border-border shadow-sm p-7">
                    <div className="text-[14px] font-semibold mb-1">Ponto de Equilíbrio do Anúncio</div>
                    <div className="text-[12px] text-text-3 mb-4">Quanto o anúncio precisa gerar em vendas para se pagar</div>

                    <div className="flex flex-col gap-4 mb-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Orçamento do Anúncio (R$)</label>
                            <div className="flex gap-2.5 items-center">
                                <input type="range" min={5} max={500} step={5} value={orcamento} onChange={(e) => setOrcamento(Number(e.target.value))}
                                    className="flex-1 h-1 rounded-full appearance-none bg-border outline-none cursor-pointer accent-accent" />
                                <input type="number" value={orcamento} onChange={(e) => setOrcamento(Number(e.target.value))} min={5} max={500}
                                    className="w-[80px] text-[13px] font-semibold text-center px-2 py-1.5 border border-border-strong rounded-sm bg-surface outline-none focus:border-accent" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">
                                Ticket Médio (R$){ticketMedioSugerido > 0 && <span className="text-accent ml-1 font-normal normal-case text-[10px]">← calculado do seu histórico</span>}
                            </label>
                            <input type="number" value={ticketMedio} onChange={(e) => setTicketMedio(Number(e.target.value))} min={1}
                                className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Margem Média (%)</label>
                            <input type="number" value={margemMedia} onChange={(e) => setMargemMedia(Number(e.target.value))} min={1} max={100}
                                className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all" />
                        </div>
                    </div>

                    <div className="text-center p-6 rounded-sm border border-accent/15 mb-4"
                        style={{ background: "linear-gradient(135deg,var(--accent-2,#E8F2ED),#fff)" }}>
                        <div className="text-[11px] text-text-3 font-semibold uppercase tracking-[0.06em] mb-2">Para cobrir o anúncio, você precisa gerar pelo menos:</div>
                        <div className="font-serif text-[48px] font-light text-accent leading-none">{pedidosMinimos}</div>
                        <div className="text-[13px] text-text-2 mt-1 font-medium">pedidos extras pelo anúncio</div>
                        <div className="text-[12px] text-text-3 mt-2 pt-2 border-t border-border">
                            = {formatBRL(vendasMinimas)} em faturamento novo
                        </div>
                    </div>

                    <div className="p-3.5 bg-surface-2 rounded-sm border border-border">
                        <div className="text-[11px] font-semibold text-text-3 uppercase tracking-[0.06em] mb-2">Como é calculado</div>
                        <div className="text-[12px] text-text-2 leading-relaxed">
                            <strong>Vendas mínimas</strong> = Orçamento ÷ Margem Média<br />
                            <strong>Pedidos mínimos</strong> = Vendas Mínimas ÷ Ticket Médio<br />
                            Acima desse número, cada pedido extra gerado pelo anúncio é lucro.
                        </div>
                    </div>
                </div>

                {/* Conexão Meta Ads */}
                <div>
                    <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden mb-3.5">
                        <div className="p-[16px_20px_12px] flex items-center justify-between border-b border-border">
                            <div>
                                <div className="text-[13.5px] font-semibold text-text">Conectar ao Meta Ads</div>
                                <div className="text-[11.5px] text-text-3 mt-0.5">Puxa o resultado real das campanhas ativas</div>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full text-[12px] font-semibold bg-danger-light text-danger">
                                <span className="w-[7px] h-[7px] rounded-full bg-current" /> Desconectado
                            </span>
                        </div>
                        <div className="p-[18px_20px]">
                            <div className="flex flex-col gap-3 mb-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Token de Acesso (Meta Marketing API)</label>
                                    <input type="password" placeholder="EAAxxxxxxxxxxxxxxx"
                                        className="font-mono text-[12px] px-[11px] py-2 border border-border-strong rounded-sm bg-surface outline-none focus:border-accent transition-all" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">ID da Conta de Anúncio</label>
                                    <input type="text" placeholder="act_123456789"
                                        className="px-[11px] py-2 border border-border-strong rounded-sm bg-surface outline-none focus:border-accent transition-all text-[13px]" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="inline-flex items-center gap-1.5 px-[11px] py-[5px] rounded-sm text-[11.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all">Conectar</button>
                                <button className="inline-flex items-center gap-1.5 px-[11px] py-[5px] rounded-sm text-[11.5px] font-medium border border-border-strong text-text-2 hover:bg-surface hover:text-text transition-all">Gerar Token ↗</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 bg-info-light border border-info/30 rounded-sm px-3.5 py-2.5 text-[12.5px] text-[#075985] mb-3">
                        <span>ℹ️</span>
                        <div>Configure o token acima para ver campanhas reais com dados da sua conta Meta Ads.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
