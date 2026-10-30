"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getDemoSessionName } from "@/lib/demo-auth";
import { NotificationBell } from "./NotificationBell";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "W";
}

export function PortalMobileHeader() {
  const [avatar, setAvatar] = useState("W");

  useEffect(() => {
    const refreshAvatar = () => setAvatar(initials(getDemoSessionName() ?? "Warga"));
    refreshAvatar();
    window.addEventListener("laporkota:session-changed", refreshAvatar);
    return () => window.removeEventListener("laporkota:session-changed", refreshAvatar);
  }, []);

  return (
    <>
    <header className="relative z-50 flex items-center justify-between px-5 pb-3 pt-4 lg:hidden">
      <Link href="/portal" className="flex min-w-0 items-center gap-2.5" aria-label="Beranda TEDUHI">
        <span className="relative grid size-10 shrink-0 place-items-center">
          <Image src="/logo.png?v=3" alt="Logo TEDUHI" fill sizes="40px" unoptimized className="object-contain" />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="flex items-center gap-1 text-[22px] font-extrabold tracking-tight text-[#102a61]">
            Teduhi
            <span aria-hidden="true" className="ml-0.5 size-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-orange-500" />
          </span>
          <span className="mt-0.5 block whitespace-nowrap text-[10px] font-semibold">
            <span className="text-[#28577f]">Temukan, </span>
            <span className="text-orange-600">Edukasi </span>
            <span className="text-slate-500">dan </span>
            <span className="text-emerald-700">Hadapi</span>
          </span>
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-3">
        <NotificationBell compact />
        <Link href="/portal/profil" aria-label="Profil warga" className="grid size-11 place-items-center rounded-full bg-linear-to-br from-sky-400 to-blue-700 text-sm font-extrabold text-white shadow-sm">{avatar}</Link>
      </div>
    </header>
    </>
  );
}