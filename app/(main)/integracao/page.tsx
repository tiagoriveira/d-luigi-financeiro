"use client";

import { useState, useEffect } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { syncCatalogoCardapioWeb } from "@/app/actions/cardapio-web";

type Tab = "conexao" | "catalogo" | "pedidos" | "log";

const TABS: { id: Tab; label: string }[] = [
    { id: "conexao", label: "Conexão" },
    { id: "catalogo", label: "Catálogo" },
    { id: "pedidos", label: "Pedidos" },
    { id: "log", label: "Log" },
];

const CATALOGO_MOCK = [
    { nome: "Margherita Grande", categoria: "Clássicas", preco: 52.9, status: "com_ficha" },
    { nome: "Calabresa Grande", categoria: "Clássicas", preco: 54.9, status: "com_ficha" },
    { nome: "Frango com Catupiry", categoria: "Especiais", preco: 58.9, status: "com_ficha" },
    { nome: "Coca-Cola 2L", categoria: "Bebidas", preco: 12.0, status: "sem_ficha" },
    { nome: "Água Mineral", categoria: "Bebidas", preco: 3.5, status: "sem_ficha" },
    { nome: "Pizza Batata com Bacon", categoria: "Especiais", preco: 61.9, status: "inativo" },
];

const STATUS_COLORS: Record<string, string> = {
    com_ficha: "bg-success-light text-success",
    sem_ficha: "bg-warning-light text-warning",
    inativo: "bg-surface-2 text-text-3",
};

export default function IntegracaoPage() {
    const [activeTab, setActiveTab] = useState<Tab>("conexao");
    const [status, setStatus] = useState<"disconnected" | "connected" | "testing">("disconnected");
    const [token, setToken] = useState("");
    const [lojaId, setLojaId] = useState("");
    const [loadingCatalogo, setLoadingCatalogo] = useState(false);
    const [loadingPedidos, setLoadingPedidos] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState("");

    useEffect(() => {
        setWebhookUrl(`${window.location.origin}/api/webhooks/cardapio-web`);
    }, []);

    const handleConnect = () => {
        setStatus("testing");
        setTimeout(() => { setStatus("connected"); }, 2000);
    };

    const importarCatalogo = async () => {
        setLoadingCatalogo(true);
        try {
            const res = await syncCatalogoCardapioWeb({ token, lojaId });
            if (res.success) {
                alert("Sucesso!\n" + res.message);
            } else {
                alert("Erro:\n" + res.error);
            }
        } catch (error) {
            alert("Erro inesperado ao tentar sincronizar o catálogo.");
            console.error(error);
        } finally {
            setLoadingCatalogo(false);
        }
    };

    const importarPedidos = () => {
        setLoadingPedidos(true);
        setTimeout(() => {
            setLoadingPedidos(false);
            alert("Pedidos importados com sucesso! (simulado)");
        }, 2000);
    };

    return (
        <div>
            <div className="px-8 py-6 border-b border-border flex items-center justify-between">
                <div>
                    <div className="text-[22px] font-serif text-text leading-none">Integrações</div>
                    <div className="text-[12.5px] text-text-3 mt-0.5">Conexão com Sistemas Externos</div>
                </div>
            </div>

            <div className="m-6 bg-surface rounded-card border border-border shadow-sm overflow-hidden">
                {/* Sidebar de integrações */}
                <div className="flex">
                    <div className="w-[220px] shrink-0 border-r border-border bg-surface-2 p-4 flex flex-col gap-2">
                        <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-3 px-2 mb-1">Disponíveis</div>
                        {[
                            { name: "Cardápio Web", active: true, connected: status === "connected" },
                            { name: "iFood", active: false, connected: false },
                            { name: "D-Luigi", active: false, connected: false },
                        ].map((item) => (
                            <button
                                key={item.name}
                                className={`flex items-center justify-between px-3 py-2 rounded-sm text-[12.5px] font-medium transition-all text-left ${item.active ? "bg-accent/10 text-accent" : "text-text-2 hover:bg-surface-3"}`}
                            >
                                {item.name}
                                {item.connected && (
                                    <span className="text-[9px] font-bold tracking-wider uppercase bg-success text-white px-1.5 py-0.5 rounded-full ml-1">ON</span>
                                )}
                                {!item.active && !item.connected && (
                                    <span className="text-[9px] font-bold text-text-3 ml-1">em breve</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Conteúdo Principal */}
                    <div className="flex-1 min-w-0">
                        {/* Abas */}
                        <div className="flex border-b border-border bg-surface">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-5 py-[11px] text-[12.5px] font-medium transition-all border-b-2 -mb-px cursor-pointer ${activeTab === tab.id ? "text-accent border-accent" : "text-text-2 border-transparent hover:text-text"}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Aba: Conexão */}
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
                                            <input
                                                type="password"
                                                value={token}
                                                onChange={(e) => setToken(e.target.value)}
                                                placeholder="Bearer token..."
                                                className="font-mono text-[12px] px-[11px] py-2 border border-border-strong rounded-sm bg-surface outline-none focus:border-accent transition-all"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5 mb-5">
                                            <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">ID do Estabelecimento</label>
                                            <input
                                                type="text"
                                                value={lojaId}
                                                onChange={(e) => setLojaId(e.target.value)}
                                                placeholder="Ex: 12345"
                                                className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all"
                                            />
                                        </div>
                                        <div className="flex gap-2.5 items-center flex-wrap">
                                            <button
                                                onClick={handleConnect}
                                                disabled={status === "testing"}
                                                className="inline-flex items-center gap-1.5 px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all disabled:opacity-50"
                                            >
                                                Testar Conexão
                                            </button>
                                            {status === "connected" && (
                                                <button className="inline-flex items-center gap-1.5 px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium border border-border-strong text-text-2 hover:bg-surface hover:text-text transition-all">
                                                    Salvar e Ativar
                                                </button>
                                            )}
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[11px] font-semibold ${status === "testing" ? "bg-warning-light text-warning" : status === "connected" ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}>
                                                <span className={`w-[6px] h-[6px] rounded-full bg-current ${status === "testing" ? "animate-pulse" : ""}`} />
                                                {status === "testing" ? "Verificando…" : status === "connected" ? "Conectado" : "Não conectado"}
                                            </span>
                                        </div>

                                        {status === "testing" && (
                                            <div className="mt-3">
                                                <div className="text-[12px] text-text-3 mb-1">Verificando conexão…</div>
                                                <div className="h-[3px] bg-border rounded-full overflow-hidden">
                                                    <div className="h-full bg-accent rounded-full animate-[loading_1.5s_ease_infinite]" />
                                                </div>
                                            </div>
                                        )}

                                        {status === "connected" && (
                                            <>
                                                <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-md">
                                                    <div className="flex items-center gap-2 text-accent font-semibold text-[13px] mb-2">
                                                        <span>🔗</span> URL do Webhook
                                                        <span className="ml-auto text-[10.5px] font-medium bg-accent/10 px-2 py-0.5 rounded-full uppercase tracking-[0.06em]">Cardápio Web</span>
                                                    </div>
                                                    <div className="text-[12px] text-text-2 mb-3 leading-relaxed">
                                                        Configure esta URL no painel do Cardápio Web para receber atualizações de pedidos em tempo real.
                                                    </div>
                                                    <div className="flex items-center">
                                                        <input
                                                            readOnly
                                                            value={webhookUrl}
                                                            className="flex-1 font-mono text-[11px] px-3 py-2 border border-border-strong rounded-l-sm bg-surface text-text-2 outline-none select-all"
                                                        />
                                                        <button
                                                            onClick={() => navigator.clipboard.writeText(webhookUrl)}
                                                            className="px-4 py-2 bg-surface-2 border border-l-0 border-border-strong rounded-r-sm text-[11px] font-semibold hover:bg-surface-3 transition-colors flex items-center gap-1.5 text-text-2 hover:text-text"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                            Copiar
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-5 pt-5 border-t border-border">
                                                    <div className="text-[13px] font-medium text-text mb-4">Sincronização Inicial</div>
                                                    <div className="flex flex-col gap-2.5">
                                                        <div className="flex items-center justify-between p-3 rounded-sm border border-border bg-surface-2">
                                                            <div>
                                                                <div className="text-[12px] font-medium text-text">Catálogo de Produtos</div>
                                                                <div className="text-[11px] text-text-3 mt-0.5">Importa produtos, categorias e status</div>
                                                            </div>
                                                            <button
                                                                onClick={importarCatalogo}
                                                                disabled={loadingCatalogo}
                                                                className="inline-flex items-center justify-center min-w-[110px] gap-1.5 px-3 py-[5px] rounded-sm text-[11px] font-medium bg-white border border-border-strong text-text hover:bg-surface-3 transition-all disabled:opacity-70 disabled:cursor-wait"
                                                            >
                                                                {loadingCatalogo ? (
                                                                    <span className="w-3 h-3 border-2 border-text-3/30 border-t-text-3 rounded-full animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <RefreshCw className="w-3 h-3" />
                                                                        Sincronizar
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 rounded-sm border border-border bg-surface-2">
                                                            <div>
                                                                <div className="text-[12px] font-medium text-text">Pedidos do Período</div>
                                                                <div className="text-[11px] text-text-3 mt-0.5">Importa faturamento e lançamentos de caixa</div>
                                                            </div>
                                                            <button
                                                                onClick={importarPedidos}
                                                                disabled={loadingPedidos}
                                                                className="inline-flex items-center justify-center min-w-[110px] gap-1.5 px-3 py-[5px] rounded-sm text-[11px] font-medium bg-white border border-border-strong text-text hover:bg-surface-3 transition-all disabled:opacity-70 disabled:cursor-wait"
                                                            >
                                                                {loadingPedidos ? (
                                                                    <span className="w-3 h-3 border-2 border-text-3/30 border-t-text-3 rounded-full animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <RefreshCw className="w-3 h-3" />
                                                                        Sincronizar
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
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

                        {/* Aba: Catálogo */}
                        {activeTab === "catalogo" && (
                            <div>
                                <div className="px-6 py-[18px] flex items-center justify-between border-b border-border flex-wrap gap-2.5">
                                    <div>
                                        <div className="text-[13.5px] font-semibold text-text">Produtos do Cardápio Web</div>
                                        <div className="text-[11.5px] text-text-3 mt-0.5">Última sync: —</div>
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
                                        <button
                                            onClick={importarCatalogo}
                                            disabled={loadingCatalogo}
                                            className="inline-flex items-center justify-center min-w-[130px] gap-1.5 px-[11px] py-[5px] rounded-sm text-[11.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all disabled:opacity-70 disabled:cursor-wait"
                                        >
                                            {loadingCatalogo ? (
                                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                "↓ Importar Catálogo"
                                            )}
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
                                                <td className="px-5 py-[10px] text-[13px] border-b border-border font-medium">
                                                    <span className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${p.status === "com_ficha" ? "bg-success" : p.status === "sem_ficha" ? "bg-warning-light border border-warning" : "bg-border"}`} />
                                                        {p.nome}
                                                    </span>
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

                        {/* Aba: Pedidos */}
                        {activeTab === "pedidos" && (
                            <div className="p-7">
                                <div className="text-[15px] font-semibold mb-2">Importar Pedidos</div>
                                <div className="text-[12.5px] text-text-2 mb-6 max-w-[460px] leading-relaxed">
                                    Importe o histórico de pedidos de um período. Os valores serão lançados automaticamente no Fluxo de Caixa como receita de delivery.
                                </div>
                                <div className="flex gap-3 items-end">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Data início</label>
                                        <input type="date" className="px-3 py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Data fim</label>
                                        <input type="date" className="px-3 py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent" />
                                    </div>
                                    <button
                                        onClick={importarPedidos}
                                        disabled={loadingPedidos}
                                        className="inline-flex items-center justify-center min-w-[150px] gap-1.5 px-[15px] py-[9px] rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all disabled:opacity-70 disabled:cursor-wait"
                                    >
                                        {loadingPedidos ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            "↓ Importar Pedidos"
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Aba: Log */}
                        {activeTab === "log" && (
                            <div className="p-6">
                                <div className="text-[13px] font-semibold mb-3 text-text">Log de Eventos</div>
                                <div className="font-mono text-[11.5px] text-text-3 bg-surface-2 border border-border rounded-sm p-4 space-y-1.5 min-h-[200px]">
                                    <div><span className="text-text-2">[09/03/2025 13:00]</span> Sistema iniciado. Aguardando conexão com Cardápio Web.</div>
                                    <div><span className="text-text-2">[09/03/2025 13:01]</span> Webhook configurado em /api/webhooks/cardapio-web</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
