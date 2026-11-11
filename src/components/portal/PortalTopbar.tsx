"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getDemoSessionName } from "@/lib/demo-auth";
import { getPortalPageHeading } from "./portal-page-heading";
import { NotificationBell } from "./NotificationBell";

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "W";
}

export function PortalTopbar() {
  const pathname = usePathname();
  const [name, setName] = useState("Warga");

  useEffect(() => {
    const refreshName = () => setName(getDemoSessionName() ?? "Warga");
    refreshName();
    window.addEventListener("laporkota:session-changed", refreshName);
    return () => window.removeEventListener("laporkota:session-changed", refreshName);
  }, []);
  const heading = getPortalPageHeading(pathname);
  const rawFirstName = name.trim().split(/\s+/)[0] || "Warga";
  const firstName = `${rawFirstName[0].toUpperCase()}${rawFirstName.slice(1)}`;
  const isPortalHome = pathname === "/portal";

  return (
    <header className="sticky top-0 z-30 hidden min-h-[76px] items-center justify-between gap-4 border-b border-white/75 bg-linear-to-r from-[#dceeff]/35 via-[#f4f8ff]/40 to-[#e5f4ff]/35 px-7 py-2 shadow-[0_8px_24px_-22px_rgba(16,39,92,0.5)] backdrop-blur-xl xl:px-10 lg:flex">
      <div className="min-w-0">
        {isPortalHome && <>
          <h1 className="truncate text-lg font-extrabold leading-tight tracking-tight text-[#102a61]">Halo, {firstName}!</h1>
          <p className="mt-0.5 text-[11px] leading-tight text-[#31547f]">Ada bencana? Segera tindak lanjuti!</p>
        </>}
        {heading.eyebrow && <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-brand-dark">{heading.eyebrow}</p>}
        {heading.title && <h2 className="mt-0.5 truncate text-base font-extrabold leading-tight text-[#102a61]">{heading.title}</h2>}
        {heading.subtitle && <p className="mt-0.5 truncate text-xs text-[#31547f]">{heading.subtitle}</p>}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-5">
        <NotificationBell />
        <Link href="/portal/profil" className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/45 py-1.5 pl-2 pr-3 text-[#102a61] backdrop-blur-md transition hover:bg-white/70">
          <span className="grid size-10 place-items-center rounded-full bg-linear-to-br from-sky-400 to-blue-700 text-xs font-extrabold text-white shadow-sm">{getInitials(name)}</span>
          <span className="text-left leading-tight"><span className="block max-w-40 truncate text-sm font-bold">{name}</span></span>
        </Link>
      </div>
    </header>
  );
}