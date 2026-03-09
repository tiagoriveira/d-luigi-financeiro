"use client";
import { useState } from "react";

export function Tooltip2({ text }: { text: string }) {
    const [show, setShow] = useState(false);
    return (
        <span className="relative inline-flex items-center cursor-help" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
            <span className="w-[13px] h-[13px] rounded-full bg-text-3 text-white text-[8px] font-bold inline-flex items-center justify-center">?</span>
            {show && (
                <span className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-text text-white text-[11px] px-[10px] py-[7px] rounded-[7px] shadow-lg z-[200] whitespace-normal max-w-[220px] leading-[1.4] font-normal pointer-events-none">
                    {text}
                </span>
            )}
        </span>
    );
}
