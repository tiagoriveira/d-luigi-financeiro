"use client";

import { useState } from "react";
import { categorias } from "@/lib/mock-data";

function TagSection({
    title, subtitle, tags, obligatorio, inputId, placeholder, onAdd, onRemove,
}: {
    title: string; subtitle: string; tags: string[]; obligatorio?: string[];
    inputId: string; placeholder: string; onAdd: (val: string) => void; onRemove: (tag: string) => void;
}) {
    const [novaTag, setNovaTag] = useState("");
    return (
        <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
            <div className="p-[16px_20px_12px] border-b border-border">
                <div className="text-[13.5px] font-semibold text-text">{title}</div>
                <div className="text-[11.5px] text-text-3 mt-0.5">{subtitle}</div>
            </div>
            <div className="p-[18px_20px]">
                {obligatorio && (
                    <div className="mb-3">
                        <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[0.06em] mb-2">Obrigatórias 🔒</div>
                        <div className="flex flex-wrap gap-1.5">
                            {obligatorio.map((t) => (
                                <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-2 border border-border rounded-full text-[12px] text-text-2">
                                    🔒 {t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {tags.length > 0 && (
                    <div>
                        {obligatorio && <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[0.06em] mb-2">Personalizadas</div>}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {tags.map((t) => (
                                <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-2 border border-border rounded-full text-[12px] text-text-2">
                                    {t}
                                    <button onClick={() => onRemove(t)} className="text-text-3 hover:text-danger text-[14px] leading-none transition-colors">×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-2 mt-2">
                    <input
                        id={inputId}
                        type="text"
                        value={novaTag}
                        onChange={(e) => setNovaTag(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && novaTag.trim()) { onAdd(novaTag.trim()); setNovaTag(""); } }}
                        placeholder={placeholder}
                        maxLength={20}
                        className="flex-1 px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                    />
                    <button
                        onClick={() => { if (novaTag.trim()) { onAdd(novaTag.trim()); setNovaTag(""); } }}
                        className="inline-flex items-center gap-1.5 px-[11px] py-[5px] rounded-sm text-[11.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all whitespace-nowrap"
                    >
                        + Adicionar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CategoriasPage() {
    const [tiposCustom, setTiposCustom] = useState(categorias.tipos_custom);
    const [contas, setContas] = useState(categorias.contas);
    const [despCat, setDespCat] = useState(categorias.despesa_cat);
    const [prodCat, setProdCat] = useState(categorias.produto_cat);

    const sections = [
        {
            title: "Tipos de Custo (Fluxo de Caixa)",
            subtitle: "Categorias para classificar movimentações",
            tags: tiposCustom,
            obligatorio: categorias.tipos_obrigatorios,
            inputId: "new-tipo",
            placeholder: "Nova categoria (ex: Manutenção)",
            onAdd: (v: string) => setTiposCustom([...tiposCustom, v]),
            onRemove: (v: string) => setTiposCustom(tiposCustom.filter((t) => t !== v)),
        },
        {
            title: "Contas Bancárias",
            subtitle: "Contas e formas de pagamento usadas",
            tags: contas,
            inputId: "new-conta",
            placeholder: "Nova conta (ex: Nubank PJ)",
            onAdd: (v: string) => setContas([...contas, v]),
            onRemove: (v: string) => setContas(contas.filter((t) => t !== v)),
        },
        {
            title: "Categorias de Despesa",
            subtitle: "Agrupamentos para o relatório do contador",
            tags: despCat,
            inputId: "new-desp-cat",
            placeholder: "Nova categoria (ex: Marketing)",
            onAdd: (v: string) => setDespCat([...despCat, v]),
            onRemove: (v: string) => setDespCat(despCat.filter((t) => t !== v)),
        },
        {
            title: "Categorias de Produto",
            subtitle: "Tipos de produto no cardápio",
            tags: prodCat,
            inputId: "new-prod-cat",
            placeholder: "Nova categoria (ex: Sobremesas)",
            onAdd: (v: string) => setProdCat([...prodCat, v]),
            onRemove: (v: string) => setProdCat(prodCat.filter((t) => t !== v)),
        },
    ];

    return (
        <div>
            <div className="flex items-start gap-[9px] bg-info-light border border-info/30 rounded-sm px-[14px] py-[10px] text-[12.5px] text-[#075985] mb-5">
                <span className="text-[14px] mt-px">🏷</span>
                <div>
                    <div className="font-semibold mb-0.5">Categorias personalizadas</div>
                    Adicione ou remova categorias de acordo com o seu negócio. As categorias marcadas com 🔒 são obrigatórias para o cálculo de custos.
                </div>
            </div>

            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {sections.map((s) => (
                    <TagSection key={s.inputId} {...s} />
                ))}
            </div>
        </div>
    );
}
