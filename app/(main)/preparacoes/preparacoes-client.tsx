"use client";

function formatBRL(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface IngredienteRef { nome: string; unidade: string; preco_atual: number; }
// Supabase retorna relação 1:N como array mesmo em joins singulares
interface PrepIng { id: string; ingrediente_id: string | null; nome_avulso: string | null; preco_avulso: number | null; quantidade: number; ingredientes: IngredienteRef[] | null; }
interface Preparacao { id: string; nome: string; rendimento: string | null; preparacao_ingredientes: PrepIng[]; }

interface Props {
    estabelecimentoId: string;
    preparacoes: Preparacao[];
}

export default function PreparacoesClient({ preparacoes }: Props) {
    return (
        <div>
            <div className="flex items-start gap-[9px] bg-info-light border border-info/30 rounded-sm px-[14px] py-[10px] text-[12.5px] text-[#075985] mb-4">
                <span className="text-[14px] mt-px">🍕</span>
                <div>
                    <div className="font-semibold mb-0.5">O que são Preparações?</div>
                    Itens que você faz na cozinha antes de montar os produtos finais: massa de pizza, molho, strogonoff. Têm custo próprio que entra nas fichas dos produtos.
                </div>
            </div>

            <div className="flex justify-end mb-4">
                <button className="inline-flex items-center gap-1.5 px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium bg-accent text-white hover:bg-[#245A3C] transition-all whitespace-nowrap">
                    + Nova Preparação
                </button>
            </div>

            <div className="grid gap-[14px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                {preparacoes.length === 0 && (
                    <div className="col-span-full text-center py-12 text-text-3 text-[13px]">
                        Nenhuma preparação cadastrada. Clique em <strong>+ Nova Preparação</strong> para começar.
                    </div>
                )}
                {preparacoes.map((prep) => {
                    const custoTotal = prep.preparacao_ingredientes.reduce((acc, pi) => {
                        const ingr = pi.ingredientes?.[0];
                        const preco = ingr?.preco_atual ?? pi.preco_avulso ?? 0;
                        return acc + preco * pi.quantidade;
                    }, 0);

                    return (
                        <div key={prep.id} className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
                            <div className="px-4 pt-[14px] pb-[10px] flex items-center justify-between border-b border-border"
                                style={{ background: "linear-gradient(135deg, #F0F4FF, #E8EDF8)" }}>
                                <div>
                                    <div className="font-serif text-[16px] font-medium text-text">{prep.nome}</div>
                                    <div className="text-[10.5px] text-text-3 mt-0.5">Rendimento: {prep.rendimento ?? "—"}</div>
                                </div>
                                <button className="text-[11px] font-medium text-text-2 px-2 py-1 rounded hover:bg-white/50 transition-all">Editar</button>
                            </div>
                            <div className="px-4 py-[10px] pb-[14px]">
                                {prep.preparacao_ingredientes.map((pi) => {
                                    const ingr = pi.ingredientes?.[0];
                                    const nome = ingr?.nome ?? pi.nome_avulso ?? "Ingrediente desconhecido";
                                    const unidade = ingr?.unidade ?? "";
                                    const preco = ingr?.preco_atual ?? pi.preco_avulso ?? 0;
                                    return (
                                        <div key={pi.id} className="flex justify-between text-[11.5px] py-[3px] text-text-2">
                                            <span>{nome}</span>
                                            <span className="text-text-3">{pi.quantidade} {unidade}</span>
                                            <span className="font-medium text-text tabular-nums">{formatBRL(preco * pi.quantidade)}</span>
                                        </div>
                                    );
                                })}
                                {prep.preparacao_ingredientes.length === 0 && (
                                    <div className="text-[11.5px] text-text-3 italic py-2">Sem ingredientes cadastrados.</div>
                                )}
                            </div>
                            <div className="px-4 py-[10px] bg-surface-2 border-t border-border flex justify-between items-center">
                                <div>
                                    <div className="text-[9.5px] text-text-3 font-semibold uppercase tracking-[0.06em]">Custo Total</div>
                                    <div className="font-serif text-[17px] font-medium text-text">{formatBRL(custoTotal)}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Card de adicionar */}
                <div className="bg-surface rounded-card border-2 border-dashed border-border hover:border-accent cursor-pointer transition-all flex items-center justify-center min-h-[180px] group">
                    <div className="text-center text-text-3 group-hover:text-accent transition-colors">
                        <div className="text-3xl mb-2">+</div>
                        <div className="text-[13px] font-medium">Nova Preparação</div>
                        <div className="text-[11px] mt-1">Adicionar base ou subreceita</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
