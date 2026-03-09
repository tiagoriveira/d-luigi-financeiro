"use client";

import { Tooltip2 } from "./tooltip";

export function Badge({ variant, children }: {
    variant: "green" | "yellow" | "red" | "blue" | "neutral" | "warm";
    children: React.ReactNode;
}) {
    const styles = {
        green: "bg-success-light text-success",
        yellow: "bg-warning-light text-warning",
        red: "bg-danger-light text-danger",
        blue: "bg-info-light text-info",
        neutral: "bg-surface-2 text-text-2 border border-border",
        warm: "bg-[#FDF0E6] text-accent-warm",
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.02em] ${styles[variant]}`}>
            {children}
        </span>
    );
}

export { Tooltip2 };
