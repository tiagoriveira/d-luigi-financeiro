"use client";

import { usePathname } from "next/navigation";
import { Download, Plus } from "lucide-react";

export function Topbar() {
    const pathname = usePathname();

    const getPageTitle = () => {
        switch (pathname) {
            case "/dashboard": return "Dashboard";
            case "/ingredientes": return "Ingredientes";
            case "/preparacoes": return "Preparações";
            case "/produtos": return "Fichas de Custo";
            case "/venda-direta": return "Venda Direta";
            case "/despesas": return "Despesas & Salários";
            case "/caixa": return "Fluxo de Caixa";
            case "/fechamento": return "Fechamento do Mês";
            case "/meta-ads": return "Meta Ads";
            case "/categorias": return "Categorias";
            case "/integracao": return "Integrações";
            default: return "Dashboard";
        }
    };

    const getPageMeta = () => {
        const today = new Date();
        const month = today.toLocaleString("pt-BR", { month: "long" });
        const year = today.getFullYear();
        const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

        switch (pathname) {
            case "/dashboard": return `${capitalizedMonth} ${year} · Visão Geral`;
            case "/ingredientes": return `Listagem e Custos de Matéria-Prima`;
            case "/preparacoes": return `Bases e Subreceitas`;
            case "/produtos": return `Análise de Fichas e Precificação`;
            case "/venda-direta": return `Produtos de Revenda`;
            case "/despesas": return `Custos Fixos e Folha de Pagamento`;
            case "/caixa": return `Lançamentos do Mês Corrente`;
            case "/fechamento": return `Apuração de Resultados`;
            case "/meta-ads": return `Métricas de Tráfego Pago`;
            case "/categorias": return `Personalização de Etiquetas`;
            case "/integracao": return `Conexão com Sistemas Externos`;
            default: return `${capitalizedMonth} ${year}`;
        }
    };

    return (
        <div className="bg-[#F5F3EF]/90 backdrop-blur-[12px] border-b border-border px-7 py-3.5 flex items-center justify-between sticky top-0 z-50">
            <div>
                <div className="font-serif text-[22px] font-normal text-text">
                    {getPageTitle()}
                </div>
                <div className="text-[11.5px] text-text-3 mt-px">
                    {getPageMeta()}
                </div>
            </div>
            <div className="flex gap-[9px] items-center">
                <button className="inline-flex items-center gap-[6px] px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium cursor-pointer border border-border-strong bg-transparent text-text-2 hover:bg-surface hover:text-text transition-all duration-150 whitespace-nowrap">
                    <Download className="w-3.5 h-3.5" /> Exportar CSV
                </button>
                <button className="inline-flex items-center gap-[6px] px-[15px] py-[7px] rounded-sm text-[12.5px] font-medium cursor-pointer border-none bg-accent text-white hover:bg-[#245A3C] transition-all duration-150 whitespace-nowrap">
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
            </div>
        </div>
    );
}
