"use client";

import { useState } from "react";

type Tab = "conexao" | "catalogo" | "pedidos" | "log";

const TABS: { id: Tab; label: string }[] = [
    { id: "conexao", label: "🔌 Conexão" },
    { id: "catalogo", label: "📋 Catálogo" },
    { id: "pedidos", label: "🛵 Pedidos" },
    { id: "log", label: "🗂 Histórico" },
];

const CATALOGO_MOCK = [
    { nome: "Margherita Grande", categoria: "Clássicas", preco: 52.9, status: "com_ficha" },
    { nome: "Calabresa Grande", categoria: "Clássicas", preco: 54.9, status: "com_ficha" },
    { nome: "Frango com Catupiry", categoria: "Especiais", preco: 58.9, status: "com_ficha" },
    { nome: "Coca-Cola 2L", categoria: "Bebidas", preco: 12.0, status: "sem_ficha" },
    { nome: "Água Mineral", categoria: "Bebidas", preco: 3.5, status: "sem_ficha" },
    { nome: "Pizza Batata com Bacon", categoria: "Especiais", preco: 61.9, status: "inativo" },
];

const LOG_MOCK = [
    { tipo: "✓", label: "Catálogo importado", det: "42 produtos sincronizados", data: "08/05/2025 14:32", bg: "bg-success-light" },
    { tipo: "↓", label: "Pedidos importados", det: "R$ 3.200,00 em 24 pedidos — Pix: R$1.800 | Crédito: R$1.400", data: "07/05/2025 23:59", bg: "bg-info-light" },
    { tipo: "↓", label: "Pedidos importados", det: "R$ 4.500,00 em 31 pedidos — Pix: R$2.700 | Crédito: R$1.800", data: "05/05/2025 23:59", bg: "bg-info-light" },
    { tipo: "✓", label: "Conexão verificada", det: "Token validado com sucesso · ID loja: #12345", data: "01/05/2025 09:10", bg: "bg-success-light" },
];

const STATUS_COLORS: Record<string, string> = {
    com_ficha: "bg-success-light text-success",
    sem_ficha: "bg-warning-light text-warning",
    inativo: "bg-surface-2 text-text-3",
};

export default function IntegracaoPage() {
    const [activeTab, setActiveTab] = useState<Tab>("conexao");
    const [conectado, setConectado] = useState(false);
    const [testando, setTestando] = useState(false);

    const testar = () => {
        setTestando(true);
        setTimeout(() => { setConectado(true); setTestando(false); }, 2000);
    };

    return (
        <div>
            <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden mb-5">
                {/* Tabs */}
                <div className="flex border-b border-border bg-surface">
                    {TABS.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-[11px] text-[12.5px] font-medium transition-all border-b-2 -mb-px cursor-pointer ${activeTab === tab.id ? "text-accent border-accent" : "text-text-2 border-transparent hover:text-text"
                                }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Conexão */}
                {activeTab === "conexao" && (
                    <div className="p-7">
                        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
                            <div>
                                <div className="text-[15px] font-semibold mb-1.5">Token de Acesso</div>
                                <div className="text-[12.5px] text-text-2 mb-5 leading-relaxed">
                                    Gere o token em <strong>Cardápio Web → Configurações → Integrações → API de Integração</strong> e cole abaixo.
                                </div>
                                <div className="flex flex-col gap-1.5 mb-3.5">
                                    <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Token da API</label>
                                    <input type="password" placeholder="cw_live_xxxxxxxxxxxxxxxx"
                                        className="font-mono text-[12px] px-[11px] py-2 border border-border-strong rounded-sm bg-surface outline-none focus:border-accent transition-all" />
                                </div>
                                <div className="flex flex-col gap-1.5 mb-5">
                                    <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">ID do Estabelecimento</label>
                                    <input type="text" placeholder="Ex: 12345"
                                        className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all" />
                                </div>
                                <div className="flex gap-2.5 items-center flex-wrap">
                                    <button onClick={testar} className="inline-flex items-center gap-1.5 px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all">
                                        Testar Conexão
                                    </button>
                                    {conectado && (
                                        <button className="inline-flex items-center gap-1.5 px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium border border-border-strong text-text-2 hover:bg-surface hover:text-text transition-all">
                                            Salvar e Ativar
                                        </button>
                                    )}
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full text-[12px] font-semibold ${testando ? "bg-warning-light text-warning" : conectado ? "bg-success-light text-success" : "bg-danger-light text-danger"
                                        }`}>
                                        <span className={`w-[7px] h-[7px] rounded-full bg-current ${testando ? "animate-pulse" : ""}`} />
                                        {testando ? "Verificando…" : conectado ? "Conectado" : "Não conectado"}
                                    </span>
                                </div>
                                {testando && (
                                    <div className="mt-3">
                                        <div className="text-[12px] text-text-3 mb-1">Verificando conexão…</div>
                                        <div className="h-[3px] bg-border rounded-full overflow-hidden">
                                            <div className="h-full bg-accent rounded-full animate-[loading_1.5s_ease_infinite]" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="bg-surface-2 rounded-card p-5 border border-border">
                                <div className="text-[12.5px] font-semibold mb-3.5">O que será sincronizado</div>
                                <div className="flex flex-col gap-3">
                                    {[
                                        { icon: "📋", title: "Catálogo completo", desc: "Produtos, categorias, preços, complementos, status ativo/inativo" },
                                        { icon: "🛵", title: "Pedidos do período", desc: "Faturamento diário por forma de pagamento → importado direto no Fluxo de Caixa" },
                                        { icon: "📊", title: "Volume por produto", desc: "Quantidade vendida de cada item → calcula CMV real do período" },
                                        { icon: "🏪", title: "Dados da loja", desc: "Formas de pagamento aceitas, horários, configurações de entrega" },
                                        { icon: "🔔", title: "Webhook em tempo real", desc: "Notificação automática a cada novo pedido recebido" },
                                    ].map((item) => (
                                        <div key={item.title} className="flex gap-2.5">
                                            <span className="text-[16px]">{item.icon}</span>
                                            <div>
                                                <div className="text-[12.5px] font-medium text-text">{item.title}</div>
                                                <div className="text-[11px] text-text-3 mt-0.5 leading-relaxed">{item.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Catálogo */}
                {activeTab === "catalogo" && (
                    <div>
                        <div className="px-6 py-[18px] flex items-center justify-between border-b border-border flex-wrap gap-2.5">
                            <div>
                                <div className="text-[13.5px] font-semibold text-text">Produtos do Cardápio Web</div>
                                <div className="text-[11.5px] text-text-3 mt-0.5">Última sync: 08/05/2025 14h32</div>
                            </div>
                            <div className="flex gap-3 items-center flex-wrap">
                                <div className="flex gap-3 text-[11.5px] text-text-3">
                                    {[
                                        { color: "bg-success", label: "Com ficha" },
                                        { color: "bg-warning", label: "Sem ficha" },
                                        { color: "bg-text-3", label: "Inativo" },
                                    ].map((l) => (
                                        <span key={l.label} className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${l.color}`} /> {l.label}
                                        </span>
                                    ))}
                                </div>
                                <button className="inline-flex items-center gap-1.5 px-[11px] py-[5px] rounded-sm text-[11.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all">
                                    ↓ Importar Catálogo
                                </button>
                            </div>
                        </div>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    {["Produto", "Categoria", "Preço", "Status", ""].map((h, i) => (
                                        <th key={i} className={`px-5 py-[9px] text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2 ${i === 2 ? "text-right" : "text-left"}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {CATALOGO_MOCK.map((p, i) => (
                                    <tr key={i} className="hover:bg-surface-2">
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border font-medium flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${p.status === "com_ficha" ? "bg-success" : p.status === "sem_ficha" ? "bg-warning-light border border-warning" : "bg-border"}`} />
                                            {p.nome}
                                        </td>
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border text-text-2">{p.categoria}</td>
                                        <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums">R$ {p.preco.toFixed(2).replace(".", ",")}</td>
                                        <td className="px-5 py-[10px] border-b border-border">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${STATUS_COLORS[p.status] || "bg-surface-2 text-text-2"}`}>
                                                {p.status === "com_ficha" ? "Com ficha" : p.status === "sem_ficha" ? "Sem ficha" : "Inativo"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-[10px] border-b border-border">
                                            {p.status === "sem_ficha" && (
                                                <button className="text-[11.5px] font-medium text-accent hover:underline">Criar ficha →</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pedidos */}
                {activeTab === "pedidos" && (
                    <div>
                        <div className="px-6 py-[18px] flex items-center justify-between border-b border-border flex-wrap gap-3">
                            <div>
                                <div className="text-[13.5px] font-semibold text-text">Importar Pedidos</div>
                                <div className="text-[12.5px] text-text-2 mt-0.5 max-w-[460px] leading-relaxed">
                                    Os pedidos são agrupados por dia e forma de pagamento e inseridos automaticamente no Fluxo de Caixa — sem digitação manual.
                                </div>
                            </div>
                            <div className="flex gap-2.5 items-end">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Período</label>
                                    <input type="month" className="w-[155px] px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all" />
                                </div>
                                <button className="inline-flex items-center gap-1.5 px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all whitespace-nowrap">
                                    ↓ Importar
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center py-16 text-text-3">
                            <div className="text-[28px] mb-2.5">🛵</div>
                            <div className="text-[14px] font-medium text-text-2 mb-1.5">Nenhum pedido importado</div>
                            <div className="text-[12px]">Selecione o período e clique em &ldquo;Importar&rdquo; para buscar os pedidos do Cardápio Web</div>
                        </div>
                    </div>
                )}

                {/* Log */}
                {activeTab === "log" && (
                    <div>
                        {LOG_MOCK.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 px-5 py-3 border-b border-border last:border-b-0 hover:bg-surface-2">
                                <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-[14px] shrink-0 ${item.bg}`}>
                                    {item.tipo}
                                </div>
                                <div className="flex-1">
                                    <div className="text-[13px] font-medium text-text">{item.label}</div>
                                    <div className="text-[11.5px] text-text-2 mt-0.5">{item.det}</div>
                                </div>
                                <div className="text-[11px] text-text-3 shrink-0">{item.data}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
