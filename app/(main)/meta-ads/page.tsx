"use client";

import { useState } from "react";
import { produtos, formatBRL } from "@/lib/mock-data";

export default function MetaAdsPage() {
    const [orcamento, setOrcamento] = useState(50);
    const [produtoRef, setProdutoRef] = useState("");

    const produto = produtos.find((p) => p.id === produtoRef);
    const margemProduto = produto ? (produto.preco_atual - produto.custo_direto) / produto.preco_atual : 0;
    const breakeven = margemProduto > 0 ? orcamento / margemProduto : 0;
    const pizzasNecessarias = produto ? Math.ceil(breakeven / produto.preco_atual) : 0;

    const campanhasMock = [
        {
            id: "1",
            nome: "Pizza da Semana — Margherita",
            status: "Ativa",
            statusColor: "bg-success-light text-success",
            impressoes: "8.4k",
            cliques: 312,
            gasto: 43.2,
            conversoes: 7,
        },
        {
            id: "2",
            nome: "Quinta do Frango",
            status: "Ativa",
            statusColor: "bg-success-light text-success",
            impressoes: "5.1k",
            cliques: 189,
            gasto: 27.8,
            conversoes: 4,
        },
        {
            id: "3",
            nome: "Promoção de Final de Mês",
            status: "Pausada",
            statusColor: "bg-warning-light text-warning",
            impressoes: "12.3k",
            cliques: 548,
            gasto: 85.0,
            conversoes: 14,
        },
    ];

    return (
        <div>
            {/* Hero */}
            <div className="rounded-card px-8 py-7 text-white mb-5 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg,#1877F2 0%,#0D5FCC 100%)" }}>
                <div className="absolute right-[-40px] top-[-40px] w-[200px] h-[200px] rounded-full bg-white/[0.06]" />
                <div className="font-serif text-[26px] font-normal mb-1.5">Calculadora de Tráfego Pago</div>
                <div className="text-[13px] opacity-80 leading-relaxed">
                    Descubra quanto seu anúncio precisa faturar para valer a pena — baseado no custo real dos seus produtos.
                </div>
            </div>

            <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {/* Calculadora */}
                <div className="bg-surface rounded-card border border-border shadow-sm p-7">
                    <div className="text-[14px] font-semibold mb-1">Quanto vou gastar no anúncio?</div>
                    <div className="text-[12px] text-text-3 mb-4">Arraste o slider ou digite o valor do orçamento diário</div>

                    <div className="flex gap-2.5 items-center mb-2">
                        <span className="font-serif text-[28px] font-light text-accent">R$ {orcamento}</span>
                        <input type="number" value={orcamento} onChange={(e) => setOrcamento(Number(e.target.value))} min={5} max={500} step={5}
                            className="w-[90px] text-[15px] font-semibold text-center px-2 py-1.5 border border-border-strong rounded-sm bg-surface outline-none focus:border-accent transition-all" />
                    </div>

                    <div className="mb-4">
                        <input type="range" min={5} max={500} step={5} value={orcamento} onChange={(e) => setOrcamento(Number(e.target.value))}
                            className="w-full h-1 rounded-full appearance-none bg-border outline-none cursor-pointer accent-accent" />
                        <div className="flex justify-between text-[10px] text-text-3 mt-1">
                            <span>R$5</span><span>R$500</span>
                        </div>
                    </div>

                    <div className="text-[12px] font-semibold text-text-2 mb-2">Produto referência para o cálculo:</div>
                    <select value={produtoRef} onChange={(e) => setProdutoRef(e.target.value)}
                        className="w-full px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all mb-4">
                        <option value="">— Selecione um produto —</option>
                        {produtos.map((p) => (
                            <option key={p.id} value={p.id}>{p.nome} ({p.tamanho}) — {formatBRL(p.preco_atual)}</option>
                        ))}
                    </select>

                    {produto && (
                        <div className="text-center p-6 rounded-sm border border-accent/15 mb-4"
                            style={{ background: "linear-gradient(135deg,var(--accent-2,#E8F2ED),#fff)" }}>
                            <div className="text-[11px] text-text-3 font-semibold uppercase tracking-[0.06em] mb-2">Para cobrir o anúncio, você precisa vender pelo menos:</div>
                            <div className="font-serif text-[52px] font-light text-accent leading-none">{formatBRL(breakeven)}</div>
                            <div className="text-[12px] text-text-2 mt-1 font-medium">em pedidos extras gerados pelo anúncio</div>
                            <div className="text-[13px] text-text-2 mt-2.5 pt-2.5 border-t border-border">
                                ≈ <strong>{pizzasNecessarias} pizzas</strong> do tipo &quot;{produto.nome}&quot; ({produto.tamanho})
                            </div>
                        </div>
                    )}

                    {!produto && (
                        <div className="text-center p-5 text-text-3 text-[13px]">Selecione um produto acima para calcular</div>
                    )}

                    <div className="p-3.5 bg-surface-2 rounded-sm border border-border">
                        <div className="text-[11px] font-semibold text-text-3 uppercase tracking-[0.06em] mb-2">Como é calculado</div>
                        <div className="text-[12px] text-text-2 leading-relaxed">
                            <strong>Ponto de equilíbrio</strong> = Orçamento do anúncio ÷ Margem do produto<br />
                            Se a margem da pizza é 35% e você gastou R$50, precisa de R$143 em vendas extras. Acima disso, cada real é lucro.
                        </div>
                    </div>
                </div>

                {/* Conexão + Campanhas */}
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

                    <div className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-2 mb-2.5">Campanhas Ativas — Últimos 7 dias</div>

                    <div className="flex items-start gap-2 bg-info-light border border-info/30 rounded-sm px-3.5 py-2.5 text-[12.5px] text-[#075985] mb-3">
                        <span>ℹ️</span>
                        <div>Configure o token acima para ver campanhas reais — ou veja os dados simulados abaixo.</div>
                    </div>

                    {campanhasMock.map((camp) => {
                        const roas = camp.gasto > 0 ? (camp.conversoes * 50) / camp.gasto : 0;
                        const verdict = roas > 2 ? "ok" : roas > 1 ? "warn" : "bad";
                        return (
                            <div key={camp.id} className="bg-surface rounded-card border border-border shadow-sm p-[18px_20px] mb-3">
                                <div className="flex justify-between items-start mb-3.5">
                                    <div className="text-[14px] font-semibold text-text">{camp.nome}</div>
                                    <span className={`text-[11px] font-semibold px-[9px] py-[3px] rounded-full ${camp.statusColor}`}>{camp.status}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        { label: "Impressões", value: camp.impressoes },
                                        { label: "Cliques", value: camp.cliques },
                                        { label: "Gasto", value: formatBRL(camp.gasto) },
                                        { label: "Conversões", value: camp.conversoes },
                                    ].map((m) => (
                                        <div key={m.label} className="text-center p-2.5 bg-surface-2 rounded-sm">
                                            <div className="font-serif text-[20px] font-medium text-text">{m.value}</div>
                                            <div className="text-[10px] text-text-3 uppercase tracking-[0.05em] mt-0.5">{m.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className={`mt-3 px-3.5 py-2.5 rounded-sm text-[12.5px] flex items-center gap-2 ${verdict === "ok" ? "bg-success-light text-success" : verdict === "warn" ? "bg-warning-light text-warning" : "bg-danger-light text-danger"}`}>
                                    {verdict === "ok" ? "✓ ROAS positivo" : verdict === "warn" ? "⚠ ROAS limítrofe" : "✗ ROAS abaixo do ponto de equilíbrio"} — ROAS: {roas.toFixed(2)}×
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
