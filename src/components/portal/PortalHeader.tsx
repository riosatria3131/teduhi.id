"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getDemoSessionName } from "@/lib/demo-auth";

export function PortalHeader({ title, subtitle, action, personalized = false, showEyebrow = true }: { title: string; subtitle: string; action?: ReactNode; personalized?: boolean; showEyebrow?: boolean }) {
    const [name, setName] = useState("Warga");

    useEffect(() => {
        if (!personalized) return;
        const refreshName = () => setName(getDemoSessionName() ?? "Warga");
        refreshName();
        window.addEventListener("laporkota:session-changed", refreshName);
        return () => window.removeEventListener("laporkota:session-changed", refreshName);
    }, [personalized]);
    const firstName = name.trim().split(/\s+/)[0];
    const greeting = firstName ? `${firstName[0].toUpperCase()}${firstName.slice(1)}` : "Warga";

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                {!personalized && showEyebrow && <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-dark">Portal Warga TEDUHI</p>}
                <h1 className={`${personalized ? "text-[26px] sm:text-3xl" : "mt-1.5 text-2xl sm:text-3xl"} font-extrabold tracking-tight text-[#102a61]`}>{personalized ? `${title}, ${greeting}!` : title}</h1>
                {subtitle && <p className={`${personalized ? "mt-0.5" : "mt-1.5"} max-w-2xl text-sm leading-relaxed text-slate-500`}>{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}