"use client";

import { useState } from "react";

interface Props {
    estabelecimentoId: string;
    tiposLancamento: string[];
    contasBancarias: string[];
    categoriasDespesa: string[];
    categoriasProduto: string[];
    unidadesMedida: string[];
}

const OBRIGATORIOS = {
    tipo_lancamento: ["FL", "MP", "FX", "VA", "TX", "OP"],
    conta_bancaria: [] as string[],
    categoria_despesa: [] as string[],
    categoria_produto: [] as string[],
    unidade_medida: ["kg", "g", "litro", "ml", "unidade"],
};

function TagSection({ title, subtitle, tags, obrigatorios, inputId, placeholder, onAdd, onRemove }: {
    title: string; subtitle: string; tags: string[]; obrigatorios?: string[];
    inputId: string; placeholder: string; onAdd: (v: string) => void; onRemove: (v: string) => void;
}) {
    const [nova, setNova] = useState("");
    return (
        <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
            <div className="p-[16px_20px_12px] border-b border-border">
                <div className="text-[13.5px] font-semibold text-text">{title}</div>
                <div className="text-[11.5px] text-text-3 mt-0.5">{subtitle}</div>
            </div>
            <div className="p-[18px_20px]">
                {obrigatorios && obrigatorios.length > 0 && (
                    <div className="mb-3">
                        <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[0.06em] mb-2">Obrigatórias 🔒</div>
                        <div className="flex flex-wrap gap-1.5">
                            {obrigatorios.map((t) => (
                                <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-2 border border-border rounded-full text-[12px] text-text-2">🔒 {t}</span>
                            ))}
                        </div>
                    </div>
                )}
                {tags.length > 0 && (
                    <div className="mb-3">
                        {obrigatorios && obrigatorios.length > 0 && <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[0.06em] mb-2">Personalizadas</div>}
                        <div className="flex flex-wrap gap-1.5">
                            {tags.map((t) => (
                                <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-2 border border-border rounded-full text-[12px] text-text-2">
                                    {t}
                                    <button onClick={() => onRemove(t)} className="text-text-3 hover:text-danger text-[14px] leading-none transition-colors">×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {tags.length === 0 && (!obrigatorios || obrigatorios.length === 0) && (
                    <div className="text-[12px] text-text-3 mb-3">Nenhuma categoria adicionada.</div>
                )}
                <div className="flex gap-2 mt-2">
                    <input id={inputId} type="text" value={nova} onChange={(e) => setNova(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && nova.trim()) { onAdd(nova.trim()); setNova(""); } }}
                        placeholder={placeholder} maxLength={30}
                        className="flex-1 px-[11px] py-2 border border-border-strong rounded-sm text-[13px] text-text bg-surface outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" />
                    <button onClick={() => { if (nova.trim()) { onAdd(nova.trim()); setNova(""); } }}
                        className="inline-flex items-center gap-1.5 px-[11px] py-[5px] rounded-sm text-[11.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all whitespace-nowrap">
                        + Adicionar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CategoriasClient({ estabelecimentoId, tiposLancamento, contasBancarias, categoriasDespesa, categoriasProduto, unidadesMedida }: Props) {
    const [tipos, setTipos] = useState(tiposLancamento);
    const [contas, setContas] = useState(contasBancarias);
    const [desp, setDesp] = useState(categoriasDespesa);
    const [prod, setProd] = useState(categoriasProduto);
    const [unidades, setUnidades] = useState(unidadesMedida);

    const saveCategoria = async (grupo: string, valor: string) => {
        await fetch("/api/categorias", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estabelecimento_id: estabelecimentoId, grupo, valor }),
        });
    };

    return (
        <div>
            <div className="flex items-start gap-[9px] bg-info-light border border-info/30 rounded-sm px-[14px] py-[10px] text-[12.5px] text-[#075985] mb-5">
                <span className="text-[14px] mt-px">🏷</span>
                <div>
                    <div className="font-semibold mb-0.5">Categorias personalizadas</div>
                    Adicione ou remova categorias de acordo com o seu negócio. As marcadas com 🔒 são obrigatórias para o sistema.
                </div>
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <TagSection title="Tipos de Custo (Fluxo de Caixa)" subtitle="Categorias para classificar movimentações"
                    tags={tipos} obrigatorios={OBRIGATORIOS.tipo_lancamento} inputId="new-tipo" placeholder="Nova categoria..."
                    onAdd={(v) => { setTipos([...tipos, v]); saveCategoria("tipo_lancamento", v); }}
                    onRemove={(v) => setTipos(tipos.filter((t) => t !== v))} />
                <TagSection title="Contas Bancárias" subtitle="Contas e formas de pagamento usadas"
                    tags={contas} inputId="new-conta" placeholder="Ex: Nubank PJ"
                    onAdd={(v) => { setContas([...contas, v]); saveCategoria("conta_bancaria", v); }}
                    onRemove={(v) => setContas(contas.filter((t) => t !== v))} />
                <TagSection title="Categorias de Despesa" subtitle="Agrupamentos para o relatório do contador"
                    tags={desp} inputId="new-desp" placeholder="Ex: Marketing"
                    onAdd={(v) => { setDesp([...desp, v]); saveCategoria("categoria_despesa", v); }}
                    onRemove={(v) => setDesp(desp.filter((t) => t !== v))} />
                <TagSection title="Categorias de Produto" subtitle="Tipos de produto no cardápio"
                    tags={prod} inputId="new-prod" placeholder="Ex: Sobremesas"
                    onAdd={(v) => { setProd([...prod, v]); saveCategoria("categoria_produto", v); }}
                    onRemove={(v) => setProd(prod.filter((t) => t !== v))} />
                <TagSection title="Unidades de Medida" subtitle="Unidades usadas nos ingredientes"
                    tags={unidades} obrigatorios={OBRIGATORIOS.unidade_medida} inputId="new-unidade" placeholder="Ex: xícara"
                    onAdd={(v) => { setUnidades([...unidades, v]); saveCategoria("unidade_medida", v); }}
                    onRemove={(v) => setUnidades(unidades.filter((t) => t !== v))} />
            </div>
        </div>
    );
}
