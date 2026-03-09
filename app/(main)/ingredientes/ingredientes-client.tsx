"use client";

import { useState, useTransition } from "react";

function formatBRL(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Ingrediente { id: string; nome: string; unidade: string; preco_atual: number; preco_anterior: number | null; }
interface IngredienteIndireto { id: string; nome: string; unidade: string; preco: number; qtde_mes: number; }

interface Props {
    estabelecimentoId: string;
    ingredientes: Ingrediente[];
    ingredientesIndiretos: IngredienteIndireto[];
    projecaoVendas: number;
}

export default function IngredientesClient({ estabelecimentoId, ingredientes, ingredientesIndiretos, projecaoVendas }: Props) {
    const [busca, setBusca] = useState("");
    const [nome, setNome] = useState("");
    const [unidade, setUnidade] = useState("kg");
    const [preco, setPreco] = useState("");
    const [isPending, startTransition] = useTransition();

    const filtrados = ingredientes.filter((i) => i.nome.toLowerCase().includes(busca.toLowerCase()));

    const totalIndir = ingredientesIndiretos.reduce((a, i) => a + i.preco * i.qtde_mes, 0);
    const totalIndirUn = projecaoVendas > 0 ? totalIndir / projecaoVendas : 0;

    const addIngrediente = async () => {
        if (!nome || !preco) return;
        startTransition(async () => {
            const res = await fetch("/api/ingredientes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estabelecimento_id: estabelecimentoId, nome, unidade, preco_atual: parseFloat(preco) }),
            });
            if (res.ok) {
                setNome(""); setPreco("");
                // Reload para buscar dados atualizados
                window.location.reload();
            }
        });
    };

    return (
        <div>
            <div className="flex items-start gap-[9px] bg-info-light border border-info/30 rounded-sm px-[14px] py-[10px] text-[12.5px] text-[#075985] mb-4">
                <span className="text-[14px] mt-px">💡</span>
                <div>
                    <div className="font-semibold mb-0.5">Dica de uso</div>
                    Cadastre aqui tudo que você compra para produzir. Mantenha os preços atualizados sempre que receber uma nota nova.
                </div>
            </div>

            {/* Ingredientes Diretos */}
            <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden mb-[18px]">
                <div className="p-[16px_20px_12px] flex items-center justify-between border-b border-border">
                    <div>
                        <div className="text-[13.5px] font-semibold text-text">Ingredientes Diretos</div>
                        <div className="text-[11.5px] text-text-3 mt-0.5">Itens com custo identificável por produto</div>
                    </div>
                    <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3 text-[13px] pointer-events-none">⌕</span>
                        <input type="text" placeholder="Buscar…" value={busca} onChange={(e) => setBusca(e.target.value)}
                            className="pl-8 w-[200px] px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" />
                    </div>
                </div>

                {/* Form */}
                <div className="grid gap-3 p-[18px_20px] border-b border-border items-end" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Nome do Ingrediente</label>
                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Mussarela"
                            className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Unidade</label>
                        <select value={unidade} onChange={(e) => setUnidade(e.target.value)}
                            className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all">
                            {["kg", "g", "litro", "ml", "unidade", "pacote", "caixa", "porcao"].map((u) => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3">Preço Atual (R$)</label>
                        <input type="number" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="0,00" step="0.01" min="0"
                            className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent transition-all" />
                    </div>
                    <div className="flex items-end">
                        <button onClick={addIngrediente} disabled={isPending}
                            className="inline-flex items-center gap-1.5 px-[15px] py-2 rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] disabled:opacity-50 transition-all whitespace-nowrap">
                            {isPending ? "Salvando…" : "+ Adicionar"}
                        </button>
                    </div>
                </div>

                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            {["Ingrediente", "Unidade", "Preço Atual", "Último Preço", "Variação"].map((h, i) => (
                                <th key={h} className={`px-5 py-[9px] text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2 ${i > 1 ? "text-right" : "text-left"}`}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtrados.map((ingr) => {
                            const prev = ingr.preco_anterior ?? ingr.preco_atual;
                            const diff = ingr.preco_atual - prev;
                            const pct = prev ? (diff / prev) * 100 : 0;
                            return (
                                <tr key={ingr.id} className="hover:bg-surface-2">
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border font-medium">{ingr.nome}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-text-2">{ingr.unidade}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums font-semibold">{formatBRL(ingr.preco_atual)}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums text-text-2">{formatBRL(prev)}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-right">
                                        {diff === 0 ? <span className="text-text-3">—</span> : (
                                            <span className={`text-[10px] flex items-center justify-end gap-1 ${diff > 0 ? "text-danger" : "text-accent"}`}>
                                                {diff > 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {filtrados.length === 0 && (
                            <tr><td colSpan={5} className="px-5 py-10 text-center text-text-3 text-[13px]">
                                {busca ? "Nenhum ingrediente encontrado." : "Nenhum ingrediente cadastrado ainda."}
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Indiretos */}
            <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden mb-[18px]">
                <div className="p-[16px_20px_12px] flex items-center justify-between border-b border-border">
                    <div>
                        <div className="text-[13.5px] font-semibold text-text">Ingredientes Indiretos</div>
                        <div className="text-[11.5px] text-text-3 mt-0.5">Embalagens e descartáveis — rateados pelo total produzido no mês</div>
                    </div>
                </div>
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            {["Item", "Unidade", "Preço/Un", "Qtde Média/Mês", "Custo Mensal", "Custo por Un Vendida"].map((h, i) => (
                                <th key={h} className={`px-5 py-[9px] text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2 ${i > 1 ? "text-right" : "text-left"}`}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {ingredientesIndiretos.map((indir) => {
                            const custoMensal = indir.preco * indir.qtde_mes;
                            const custoUn = projecaoVendas > 0 ? custoMensal / projecaoVendas : 0;
                            return (
                                <tr key={indir.id} className="hover:bg-surface-2">
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border font-medium">{indir.nome}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-text-2">{indir.unidade}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums">{formatBRL(indir.preco)}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums">{indir.qtde_mes}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums font-semibold">{formatBRL(custoMensal)}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums text-text-2">{formatBRL(custoUn)}</td>
                                </tr>
                            );
                        })}
                        {ingredientesIndiretos.length === 0 && (
                            <tr><td colSpan={6} className="px-5 py-8 text-center text-text-3 text-[13px]">Nenhum ingrediente indireto cadastrado.</td></tr>
                        )}
                    </tbody>
                    {ingredientesIndiretos.length > 0 && (
                        <tfoot>
                            <tr className="bg-surface-2 font-semibold">
                                <td colSpan={4} className="px-5 py-[10px] text-right text-text-2 text-[13px]">Total Mensal:</td>
                                <td className="px-5 py-[10px] text-right tabular-nums font-semibold text-[13px]">{formatBRL(totalIndir)}</td>
                                <td className="px-5 py-[10px] text-right tabular-nums text-text-2 text-[13px]">{formatBRL(totalIndirUn)}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}
