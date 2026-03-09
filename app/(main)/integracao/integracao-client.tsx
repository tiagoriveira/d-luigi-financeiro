"use client";

import { useState, useEffect } from "react";
import { Copy, RefreshCw } from "lucide-react";

type Tab = "conexao" | "catalogo" | "pedidos" | "log";

const TABS: { id: Tab; label: string }[] = [
    { id: "conexao", label: "Conexão" },
    { id: "catalogo", label: "Catálogo" },
    { id: "pedidos", label: "Pedidos" },
    { id: "log", label: "Log" },
];

interface IntegracaoConfig {
    token_api: string;
    sincroniza_pedidos_ativo: boolean;
    ultimo_sync_catalogo: string | null;
    ultimo_sync_pedidos: string | null;
}

interface LogEntry {
    id: string;
    data_hora: string;
    acao: string;
    status: string;
    mensagem: string;
}

interface ProdutoImportado {
    nome: string;
    categoria: string;
    preco_sugerido: number | null;
    sincronizado: boolean | null;
}

interface Props {
    estabelecimentoId: string;
    configCw: IntegracaoConfig | null;
    produtosImportados: ProdutoImportado[];
    logs: LogEntry[];
}

export default function IntegracaoClient({ estabelecimentoId, configCw, produtosImportados, logs }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("conexao");
    const [token, setToken] = useState(configCw?.token_api || "");
    const [status, setStatus] = useState<"disconnected" | "connected" | "testing">(configCw?.token_api ? "connected" : "disconnected");

    const [loadingCatalogo, setLoadingCatalogo] = useState(false);
    const [loadingPedidos, setLoadingPedidos] = useState(false);

    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");

    // Opcional: webhook URL em tela formatada
    const [webhookUrl, setWebhookUrl] = useState("");
    useEffect(() => {
        setWebhookUrl(`${window.location.origin}/api/webhooks/cardapio-web?estabelecimentoId=${estabelecimentoId}`);
    }, [estabelecimentoId]);

    const handleSaveConnection = async () => {
        setStatus("testing");
        try {
            const res = await fetch("/api/integracao/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estabelecimentoId, token }),
            });
            if (res.ok) {
                setStatus("connected");
                alert("Token salvo com sucesso!");
            } else {
                throw new Error("Erro ao salvar token");
            }
        } catch (error) {
            setStatus("disconnected");
            alert("Erro ao validar ou salvar credenciais.");
        }
    };

    const importarCatalogo = async () => {
        if (!token) return alert("Por favor, configure o Token na aba Conexão primeiro.");
        setLoadingCatalogo(true);
        try {
            const res = await fetch("/api/integracao/catalogo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estabelecimentoId, token }),
            });
            const data = await res.json();
            if (data.success) {
                alert(`Catálogo sincronizado com sucesso!\n${data.message}`);
                window.location.reload();
            } else {
                alert(`Erro: ${data.error}`);
            }
        } catch (error) {
            alert("Erro inesperado ao tentar sincronizar o catálogo.");
            console.error(error);
        } finally {
            setLoadingCatalogo(false);
        }
    };

    const importarPedidos = async () => {
        if (!token) return alert("Por favor, configure o Token na aba Conexão primeiro.");
        if (!dataInicio || !dataFim) return alert("Selecione a data de início e fim.");
        setLoadingPedidos(true);
        try {
            const res = await fetch("/api/integracao/pedidos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estabelecimentoId, token, dataInicio, dataFim }),
            });
            const data = await res.json();
            if (data.success) {
                alert(`Pedidos importados com sucesso!\n${data.message}`);
                window.location.reload();
            } else {
                alert(`Erro: ${data.error}`);
            }
        } catch (error) {
            alert("Erro inesperado ao tentar importar pedidos.");
            console.error(error);
        } finally {
            setLoadingPedidos(false);
        }
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
                <div className="flex">
                    <div className="w-[220px] shrink-0 border-r border-border bg-surface-2 p-4 flex flex-col gap-2">
                        <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-3 px-2 mb-1">Disponíveis</div>
                        {[
                            { name: "Cardápio Web", active: true, connected: status === "connected" },
                            { name: "iFood", active: false, connected: false }
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

                    <div className="flex-1 min-w-0">
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
                                        <div className="flex flex-col gap-1.5 mb-5">
                                            <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Token da API</label>
                                            <input
                                                type="password"
                                                value={token}
                                                onChange={(e) => setToken(e.target.value)}
                                                placeholder="Bearer token..."
                                                className="font-mono text-[12px] px-[11px] py-2 border border-border-strong rounded-sm bg-surface outline-none focus:border-accent transition-all"
                                            />
                                        </div>
                                        <div className="flex gap-2.5 items-center flex-wrap">
                                            <button
                                                onClick={handleSaveConnection}
                                                disabled={status === "testing" || !token}
                                                className="inline-flex items-center gap-1.5 px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all disabled:opacity-50"
                                            >
                                                Salvar Conexão
                                            </button>
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[11px] font-semibold ${status === "testing" ? "bg-warning-light text-warning" : status === "connected" ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}>
                                                <span className={`w-[6px] h-[6px] rounded-full bg-current ${status === "testing" ? "animate-pulse" : ""}`} />
                                                {status === "testing" ? "Verificando…" : status === "connected" ? "Conectado" : "Não conectado"}
                                            </span>
                                        </div>

                                        {status === "connected" && (
                                            <>
                                                <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-md">
                                                    <div className="flex items-center gap-2 text-accent font-semibold text-[13px] mb-2">
                                                        <span>🔗</span> URL do Webhook
                                                    </div>
                                                    <div className="text-[12px] text-text-2 mb-3 leading-relaxed">
                                                        Configure esta URL no painel do Cardápio Web para receber atualizações de pedidos em tempo real.
                                                    </div>
                                                    <div className="flex items-center">
                                                        <input readOnly value={webhookUrl} className="flex-1 font-mono text-[11px] px-3 py-2 border border-border-strong rounded-l-sm bg-surface text-text-2 outline-none select-all" />
                                                        <button onClick={() => navigator.clipboard.writeText(webhookUrl)} className="px-4 py-2 bg-surface-2 border border-l-0 border-border-strong rounded-r-sm text-[11px] hover:bg-surface-3 flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" /> Copiar</button>
                                                    </div>
                                                </div>

                                                <div className="mt-5 pt-5 border-t border-border">
                                                    <div className="text-[13px] font-medium text-text mb-4">Ações Rápidas</div>
                                                    <div className="flex flex-col gap-2.5">
                                                        <div className="flex items-center justify-between p-3 rounded-sm border border-border bg-surface-2">
                                                            <div>
                                                                <div className="text-[12px] font-medium text-text">Catálogo de Produtos</div>
                                                                <div className="text-[11px] text-text-3 mt-0.5">Importa produtos, categorias e status</div>
                                                            </div>
                                                            <button onClick={importarCatalogo} disabled={loadingCatalogo} className="inline-flex items-center justify-center min-w-[110px] gap-1.5 px-3 py-[5px] rounded-sm text-[11px] font-medium bg-white border border-border-strong text-text hover:bg-surface-3 transition-all disabled:opacity-70 disabled:cursor-wait">
                                                                {loadingCatalogo ? <span className="w-3 h-3 border-2 border-text-3/30 border-t-text-3 rounded-full animate-spin" /> : <><RefreshCw className="w-3 h-3" /> Sincronizar</>}
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
                                                { icon: "📋", title: "Catálogo completo", desc: "Produtos, categorias, preços (não apaga os que não vierem na listagem)." },
                                                { icon: "🛵", title: "Pedidos do período", desc: "Agrupados por data e forma de pagamento no Fluxo de Caixa." },
                                                { icon: "🔔", title: "Webhook em tempo real", desc: "Notificação automática ao concluir pedido." },
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
                                        <div className="text-[13.5px] font-semibold text-text">Produtos Importados</div>
                                        <div className="text-[11.5px] text-text-3 mt-0.5">Última sync: {configCw?.ultimo_sync_catalogo ? new Date(configCw.ultimo_sync_catalogo).toLocaleString('pt-BR') : 'Nunca'}</div>
                                    </div>
                                    <div className="flex gap-3 items-center flex-wrap">
                                        <div className="flex gap-3 text-[11.5px] text-text-3">
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success"></span> Sincronizado</span>
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning"></span> Não veio no CW</span>
                                        </div>
                                        <button onClick={importarCatalogo} disabled={loadingCatalogo || status !== "connected"} className="inline-flex items-center justify-center min-w-[130px] gap-1.5 px-[11px] py-[5px] rounded-sm text-[11.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all disabled:opacity-70 disabled:cursor-wait">
                                            {loadingCatalogo ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "↓ Importar Catálogo"}
                                        </button>
                                    </div>
                                </div>
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            {["Produto", "Categoria", "Preço Sugerido", "Status Sync"].map((h, i) => (
                                                <th key={i} className={`px-5 py-[9px] text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2 ${i === 2 ? "text-right" : "text-left"}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {produtosImportados.length === 0 && (
                                            <tr><td colSpan={4} className="px-5 py-8 text-center text-[13px] text-text-3">Nenhum produto importado. Sincronize o catálogo.</td></tr>
                                        )}
                                        {produtosImportados.map((p, i) => (
                                            <tr key={i} className="hover:bg-surface-2">
                                                <td className="px-5 py-[10px] text-[13px] border-b border-border font-medium">
                                                    <span className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${p.sincronizado !== false ? 'bg-success' : 'bg-warning-light border border-warning'}`} />
                                                        {p.nome}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-[10px] text-[13px] border-b border-border text-text-2">{p.categoria || '—'}</td>
                                                <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums">
                                                    {p.preco_sugerido ? `R$ ${p.preco_sugerido.toFixed(2).replace(".", ",")}` : '—'}
                                                </td>
                                                <td className="px-5 py-[10px] border-b border-border text-[12px] text-text-2">
                                                    {p.sincronizado !== false ? "Sincronizado via CW" : "Criado manualmente / Ausente no CW"}
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
                                <div className="text-[15px] font-semibold mb-2">Importar Pedidos (Fluxo de Caixa)</div>
                                <div className="text-[12.5px] text-text-2 mb-6 max-w-[460px] leading-relaxed">
                                    Importe o histórico de pedidos de um período do Cardápio Web. Serão agrupados por data e forma de pagamento na tabela de Lançamentos (Despesas e Salários) como tipo FL (Faturamento).
                                </div>
                                <div className="flex gap-3 items-end">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Data início</label>
                                        <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="px-3 py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Data fim</label>
                                        <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="px-3 py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent" />
                                    </div>
                                    <button
                                        onClick={importarPedidos}
                                        disabled={loadingPedidos || status !== "connected"}
                                        className="inline-flex items-center justify-center min-w-[150px] gap-1.5 px-[15px] py-[9px] rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all disabled:opacity-70 disabled:cursor-wait"
                                    >
                                        {loadingPedidos ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "↓ Importar Pedidos"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Aba: Log */}
                        {activeTab === "log" && (
                            <div className="p-6">
                                <div className="text-[13px] font-semibold mb-3 text-text">Log de Eventos (Auditoria)</div>
                                <div className="font-mono text-[11.5px] overflow-y-auto max-h-[400px] text-text-3 bg-surface-2 border border-border rounded-sm p-4 space-y-1.5 min-h-[200px]">
                                    {logs.length === 0 && (
                                        <div className="text-center text-text-3 italic pt-6">Nenhum evento registrado ainda.</div>
                                    )}
                                    {logs.map((L) => (
                                        <div key={L.id} className="flex gap-2">
                                            <span className="text-text-2 w-[130px] shrink-0">[{new Date(L.data_hora).toLocaleString('pt-BR')}]</span>
                                            <span className={L.status === "erro" ? "text-danger" : "text-success"}>[{L.status.toUpperCase()}]</span>
                                            <span className="font-semibold text-text-2">{L.acao}:</span>
                                            <span>{L.mensagem}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
