"use client";

import { useState } from "react";
import { ingredientes, ingredientes_indiretos, formatBRL } from "@/lib/mock-data";
import { Tooltip2, Badge } from "@/components/ui-helpers";

export default function IngredientesPage() {
    const [busca, setBusca] = useState("");
    const [lista, setLista] = useState(ingredientes);
    const [nome, setNome] = useState("");
    const [unidade, setUnidade] = useState("kg");
    const [preco, setPreco] = useState("");

    const filtrados = lista.filter((i) => i.nome.toLowerCase().includes(busca.toLowerCase()));

    const addIngrediente = () => {
        if (!nome || !preco) return;
        const novo = {
            id: Date.now().toString(),
            nome,
            unidade,
            preco_atual: parseFloat(preco),
            preco_anterior: parseFloat(preco),
        };
        setLista([...lista, novo]);
        setNome(""); setPreco("");
    };

    const totalIndir = ingredientes_indiretos.reduce((a, i) => a + i.preco * i.qtde_mes, 0);
    const projecaoVendas = 600; // unidades no mês
    const totalIndirUn = projecaoVendas ? totalIndir / projecaoVendas : 0;

    return (
        <div>
            <div className="flex items-start gap-[9px] bg-info-light border border-info/30 rounded-sm px-[14px] py-[10px] text-[12.5px] text-[#075985] mb-4">
                <span className="text-[14px] mt-px">💡</span>
                <div>
                    <div className="font-semibold mb-0.5">Dica de uso</div>
                    Cadastre aqui tudo que você compra para produzir. Mantenha os preços atualizados sempre que receber uma nota nova — isso garante que os preços dos produtos fiquem corretos automaticamente.
                </div>
            </div>

            {/* Ingredientes Diretos */}
            <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden mb-[18px]">
                <div className="p-[16px_20px_12px] flex items-center justify-between border-b border-border">
                    <div>
                        <div className="text-[13.5px] font-semibold text-text">Ingredientes Diretos</div>
                        <div className="text-[11.5px] text-text-3 mt-0.5">Itens com custo identificável por produto (mussarela, presunto, massa…)</div>
                    </div>
                    <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3 text-[13px] pointer-events-none">⌕</span>
                        <input
                            type="text"
                            placeholder="Buscar…"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="pl-8 w-[200px] px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                        />
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
                            className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all">
                            <option value="kg">kg</option>
                            <option value="unidade">unidade</option>
                            <option value="litro">litro</option>
                            <option value="pacote">pacote</option>
                            <option value="cx">caixa</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-text-3 flex items-center gap-1">
                            Preço Atual (R$)
                            <Tooltip2 text="Preço de compra por unidade de medida. Ex: se o kg de mussarela custa R$32, coloque 32." />
                        </label>
                        <input type="number" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="0,00" step="0.01" min="0"
                            className="px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" />
                    </div>
                    <div className="flex items-end">
                        <button onClick={addIngrediente}
                            className="inline-flex items-center gap-1.5 px-[15px] py-2 rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all whitespace-nowrap">
                            + Adicionar
                        </button>
                    </div>
                </div>

                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            {["Ingrediente", "Unidade", "Preço Atual", "Último Preço", "Variação", "Ações"].map((h, i) => (
                                <th key={h} className={`px-5 py-[9px] text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3 border-b border-border bg-surface-2 ${i > 1 ? "text-right" : "text-left"}`}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtrados.map((ingr) => {
                            const diff = ingr.preco_atual - ingr.preco_anterior;
                            const pct = ingr.preco_anterior ? (diff / ingr.preco_anterior) * 100 : 0;
                            return (
                                <tr key={ingr.id} className="hover:bg-surface-2">
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border font-medium">{ingr.nome}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-text-2">{ingr.unidade}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums font-semibold">{formatBRL(ingr.preco_atual)}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-right tabular-nums text-text-2">{formatBRL(ingr.preco_anterior)}</td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-right">
                                        {diff === 0 ? <span className="text-text-3">—</span> : (
                                            <span className={`text-[10px] flex items-center justify-end gap-1 ${diff > 0 ? "text-danger" : "text-success"}`}>
                                                {diff > 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-[10px] text-[13px] border-b border-border text-right">
                                        <button className="text-[11.5px] px-2 py-1 rounded text-text-3 hover:text-danger hover:bg-danger-light transition-all">Excluir</button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filtrados.length === 0 && (
                            <tr><td colSpan={6} className="px-5 py-10 text-center text-text-3 text-[13px]">Nenhum ingrediente encontrado</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Ingredientes Indiretos */}
            <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden mb-[18px]">
                <div className="p-[16px_20px_12px] flex items-center justify-between border-b border-border">
                    <div>
                        <div className="text-[13.5px] font-semibold text-text">Ingredientes Indiretos</div>
                        <div className="text-[11.5px] text-text-3 mt-0.5">Embalagens e descartáveis — difíceis de medir por produto, então rateados pelo total produzido no mês</div>
                    </div>
                    <button className="inline-flex items-center gap-1.5 px-[11px] py-[5px] rounded-sm text-[11.5px] font-medium border border-border-strong bg-transparent text-text-2 hover:bg-surface hover:text-text transition-all">
                        + Adicionar
                    </button>
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
                        {ingredientes_indiretos.map((indir) => {
                            const custoMensal = indir.preco * indir.qtde_mes;
                            const custoUn = projecaoVendas ? custoMensal / projecaoVendas : 0;
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
                    </tbody>
                    <tfoot>
                        <tr className="bg-surface-2 font-semibold">
                            <td colSpan={4} className="px-5 py-[10px] text-right text-text-2 text-[13px]">Total Mensal:</td>
                            <td className="px-5 py-[10px] text-right tabular-nums font-semibold text-[13px]">{formatBRL(totalIndir)}</td>
                            <td className="px-5 py-[10px] text-right tabular-nums text-text-2 text-[13px]">{formatBRL(totalIndirUn)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
