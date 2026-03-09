"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    ChefHat,
    FileText,
    Tag,
    DollarSign,
    Wallet,
    CalendarCheck,
    TrendingUp,
    Tags,
    Link as LinkIcon
} from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    const isRouteActive = (route: string) => {
        return pathname.startsWith(route);
    };

    return (
        <nav className="fixed top-0 left-0 bottom-0 w-[228px] min-h-screen bg-surface border-r border-border flex flex-col z-[100] pb-6">
            <div className="pt-[26px] px-[22px] pb-5 border-b border-border mb-2">
                <div className="font-serif text-[21px] font-normal tracking-[-0.3px] text-text leading-none">
                    Custo &amp; Caixa
                </div>
                <div className="text-[10.5px] text-text-3 tracking-[0.08em] uppercase mt-1 font-medium">
                    Gestão para Alimentação
                </div>
            </div>

            <div className="px-2.5 mb-0.5">
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-text-3 px-2.5 pt-2.5 pb-1.5">
                    Visão Geral
                </div>
                <Link
                    href="/dashboard"
                    className={`flex items-center gap-[9px] px-2.5 py-2 rounded-sm cursor-pointer text-[13px] transition-all duration-150 select-none ${isRouteActive("/dashboard")
                            ? "bg-accent-2 text-accent font-medium"
                            : "text-text-2 hover:bg-surface-2 hover:text-text font-normal"
                        }`}
                >
                    <LayoutDashboard className={`w-4 h-4 shrink-0 ${isRouteActive("/dashboard") ? "opacity-100" : "opacity-65"}`} strokeWidth={1.8} />
                    Dashboard
                </Link>
            </div>

            <div className="px-2.5 mb-0.5">
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-text-3 px-2.5 pt-2.5 pb-1.5">
                    Estrutura de Custos
                </div>
                <Link
                    href="/ingredientes"
                    className={`flex items-center gap-[9px] px-2.5 py-2 rounded-sm cursor-pointer text-[13px] transition-all duration-150 select-none ${isRouteActive("/ingredientes")
                            ? "bg-accent-2 text-accent font-medium"
                            : "text-text-2 hover:bg-surface-2 hover:text-text font-normal"
                        }`}
                >
                    <ShoppingCart className={`w-4 h-4 shrink-0 ${isRouteActive("/ingredientes") ? "opacity-100" : "opacity-65"}`} strokeWidth={1.8} />
                    Ingredientes
                </Link>
                <Link
                    href="/preparacoes"
                    className={`flex items-center gap-[9px] px-2.5 py-2 rounded-sm cursor-pointer text-[13px] transition-all duration-150 select-none ${isRouteActive("/preparacoes")
                            ? "bg-accent-2 text-accent font-medium"
                            : "text-text-2 hover:bg-surface-2 hover:text-text font-normal"
                        }`}
                >
                    <ChefHat className={`w-4 h-4 shrink-0 ${isRouteActive("/preparacoes") ? "opacity-100" : "opacity-65"}`} strokeWidth={1.8} />
                    Preparações
                </Link>
                <Link
                    href="/produtos"
                    className={`flex items-center gap-[9px] px-2.5 py-2 rounded-sm cursor-pointer text-[13px] transition-all duration-150 select-none ${isRouteActive("/produtos")
                            ? "bg-accent-2 text-accent font-medium"
                            : "text-text-2 hover:bg-surface-2 hover:text-text font-normal"
                        }`}
                >
                    <FileText className={`w-4 h-4 shrink-0 ${isRouteActive("/produtos") ? "opacity-100" : "opacity-65"}`} strokeWidth={1.8} />
                    Fichas de Custo
                </Link>
                <Link
                    href="/venda-direta"
                    className={`flex items-center gap-[9px] px-2.5 py-2 rounded-sm cursor-pointer text-[13px] transition-all duration-150 select-none ${isRouteActive("/venda-direta")
                            ? "bg-accent-2 text-accent font-medium"
                            : "text-text-2 hover:bg-surface-2 hover:text-text font-normal"
                        }`}
                >
                    <Tag className={`w-4 h-4 shrink-0 ${isRouteActive("/venda-direta") ? "opacity-100" : "opacity-65"}`} strokeWidth={1.8} />
                    Venda Direta
                </Link>
                <Link
                    href="/despesas"
                    className={`flex items-center gap-[9px] px-2.5 py-2 rounded-sm cursor-pointer text-[13px] transition-all duration-150 select-none ${isRouteActive("/despesas")
                            ? "bg-accent-2 text-accent font-medium"
                            : "text-text-2 hover:bg-surface-2 hover:text-text font-normal"
                        }`}
                >
                    <DollarSign className={`w-4 h-4 shrink-0 ${isRouteActive("/despesas") ? "opacity-100" : "opacity-65"}`} strokeWidth={1.8} />
                    Despesas &amp; Salários
                </Link>
            </div>

            <div className="px-2.5 mb-0.5">
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-text-3 px-2.5 pt-2.5 pb-1.5">
                    Financeiro
                </div>
                <Link
                    href="/caixa"
                    className={`flex items-center gap-[9px] px-2.5 py-2 rounded-sm cursor-pointer text-[13px] transition-all duration-150 select-none ${isRouteActive("/caixa")
                            ? "bg-accent-2 text-accent font-medium"
                            : "text-text-2 hover:bg-surface-2 hover:text-text font-normal"
                        }`}
                >
                    <Wallet className={`w-4 h-4 shrink-0 ${isRouteActive("/caixa") ? "opacity-100" : "opacity-65"}`} strokeWidth={1.8} />
                    Fluxo de Caixa
                </Link>
                <Link
                    href="/fechamento"
                    className={`flex items-center gap-[9px] px-2.5 py-2 rounded-sm cursor-pointer text-[13px] transition-all duration-150 select-none ${isRouteActive("/fechamento")
                            ? "bg-accent-2 text-accent font-medium"
                            : "text-text-2 hover:bg-surface-2 hover:text-text font-normal"
                        }`}
                >
                    <CalendarCheck className={`w-4 h-4 shrink-0 ${isRouteActive("/fechamento") ? "opacity-100" : "opacity-65"}`} strokeWidth={1.8} />
                    Fechamento do Mês
                </Link>
            </div>

            <div className="px-2.5 mb-0.5">
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-text-3 px-2.5 pt-2.5 pb-1.5">
                    Tráfego Pago
                </div>
                <Link
                    href="/meta-ads"
                    className={`flex items-center gap-[9px] px-2.5 py-2 rounded-sm cursor-pointer text-[13px] transition-all duration-150 select-none ${isRouteActive("/meta-ads")
                            ? "bg-accent-2 text-accent font-medium"
                            : "text-text-2 hover:bg-surface-2 hover:text-text font-normal"
                        }`}
                >
                    <TrendingUp className={`w-4 h-4 shrink-0 ${isRouteActive("/meta-ads") ? "opacity-100" : "opacity-65"}`} strokeWidth={1.8} />
                    Meta Ads
                </Link>
            </div>

            <div className="px-2.5 mb-0.5">
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-text-3 px-2.5 pt-2.5 pb-1.5">
                    Configurações
                </div>
                <Link
                    href="/categorias"
                    className={`flex items-center gap-[9px] px-2.5 py-2 rounded-sm cursor-pointer text-[13px] transition-all duration-150 select-none ${isRouteActive("/categorias")
                            ? "bg-accent-2 text-accent font-medium"
                            : "text-text-2 hover:bg-surface-2 hover:text-text font-normal"
                        }`}
                >
                    <Tags className={`w-4 h-4 shrink-0 ${isRouteActive("/categorias") ? "opacity-100" : "opacity-65"}`} strokeWidth={1.8} />
                    Categorias
                </Link>
            </div>

            <div className="px-2.5 mb-0.5">
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-text-3 px-2.5 pt-2.5 pb-1.5">
                    Integrações
                </div>
                <Link
                    href="/integracao"
                    className={`flex items-center gap-[9px] px-2.5 py-2 rounded-sm cursor-pointer text-[13px] transition-all duration-150 select-none ${isRouteActive("/integracao")
                            ? "bg-accent-2 text-accent font-medium"
                            : "text-text-2 hover:bg-surface-2 hover:text-text font-normal"
                        }`}
                >
                    <LinkIcon className={`w-4 h-4 shrink-0 ${isRouteActive("/integracao") ? "opacity-100" : "opacity-65"}`} strokeWidth={1.8} />
                    Cardápio Web
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold px-1.5 py-0.5 rounded-[10px] ml-auto bg-red-light text-red-color">
                        ✗ Off
                    </span>
                </Link>
            </div>

            <div className="mt-auto px-3">
                <div className="bg-bg rounded-sm px-[13px] py-[11px] flex items-center gap-[9px]">
                    <div className="w-[30px] h-[30px] bg-accent rounded-[7px] flex items-center justify-center text-[13px] text-white font-semibold shrink-0">
                        D
                    </div>
                    <div>
                        <div className="text-[12.5px] font-medium text-text leading-[1.2]">D'Luigi</div>
                        <div className="text-[10.5px] text-text-3">Pizzaria · Simples 6%</div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
