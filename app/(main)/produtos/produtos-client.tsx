"use client";

import { useState } from "react";

interface Produto {
    id: string;
    nome: string;
    categoria: string | null;
    tamanho: string | null;
    preco_atual: number;
}

interface Props {
    produtos: Produto[];
}

function formatBRL(valor: number) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProdutosClientWrapper({ produtos }: Props) {
    // Extrai categorias únicas dos produtos reais
    const categorias = ["Todos", ...Array.from(
        new Set(produtos.map((p) => p.categoria ?? "Sem categoria"))
    ).sort()];

    const [filtro, setFiltro] = useState("Todos");

    const filtrados = filtro === "Todos"
        ? produtos
        : produtos.filter((p) => (p.categoria ?? "Sem categoria") === filtro);

    if (produtos.length === 0) {
        return (
            <div>
                <div className="flex flex-col items-center justify-center py-20 text-text-2 gap-3">
                    <div className="text-5xl">🍽️</div>
                    <p className="text-[15px] font-medium">Nenhum produto encontrado</p>
                    <p className="text-[13px] text-text-3 text-center max-w-xs">
                        Sincronize o catálogo na aba <strong>Integrações → Cardápio Web</strong> para importar seus produtos.
                    </p>
                </div>

                {/* Card de adicionar */}
                <div className="grid gap-[14px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}>
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

    return (
        <div>
            {/* Filtros por categoria */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2.5">
                <div className="flex flex-wrap gap-0.5 bg-surface-2 rounded-sm p-0.5 border border-border">
                    {categorias.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFiltro(cat)}
                            className={`px-[14px] py-[5px] rounded-[6px] text-[12px] font-medium transition-all ${filtro === cat
                                    ? "bg-surface text-text shadow-sm"
                                    : "text-text-2 hover:text-text"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="text-[12px] text-text-3">
                    {filtrados.length} produto{filtrados.length !== 1 ? "s" : ""}
                </div>
            </div>

            {/* Grid de cards */}
            <div className="grid gap-[14px] mb-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}>
                {filtrados.map((produto) => (
                    <div
                        key={produto.id}
                        className="bg-surface rounded-card border border-border shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-px transition-all duration-200"
                    >
                        {/* Card Header */}
                        <div
                            className="px-4 pt-[14px] pb-[10px] border-b border-border"
                            style={{ background: "linear-gradient(135deg,#F9F8F5 0%,#F0EEE8 100%)" }}
                        >
                            <div className="font-serif text-[17px] font-medium text-text leading-[1.2]">
                                {produto.nome}
                            </div>
                            <div className="text-[10.5px] text-text-3 mt-0.5">
                                {produto.tamanho ? `${produto.tamanho} · ` : ""}{produto.categoria ?? "Sem categoria"}
                            </div>
                        </div>

                        {/* Aviso: sem ingredientes ainda */}
                        <div className="px-4 py-3">
                            <p className="text-[11.5px] text-text-3 italic">
                                Adicione ingredientes para calcular o custo direto e a margem.
                            </p>
                        </div>

                        {/* Footer com preço praticado */}
                        <div className="px-4 py-[10px] bg-surface-2 border-t border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-[9.5px] text-text-3 font-semibold uppercase tracking-[0.06em]">
                                        Preço Praticado
                                    </div>
                                    <div className="font-serif text-[20px] font-semibold text-text">
                                        {formatBRL(produto.preco_atual)}
                                    </div>
                                </div>
                                <div className="text-[11px] text-text-3 italic">
                                    Custo: —
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

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
