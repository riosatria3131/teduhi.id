"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BellIcon, PinIcon } from "@/components/icons";
import { getDemoSessionName } from "@/lib/demo-auth";

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
    <header className="flex items-center justify-between px-5 pb-3 pt-4 lg:hidden">
      <Link href="/portal" className="flex min-w-0 items-center gap-2.5" aria-label="Beranda TEDUHI">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-700/20"><PinIcon width={30} height={30} strokeWidth={2.5} /></span>
        <span className="min-w-0 leading-tight"><span className="block text-[22px] font-extrabold tracking-tight text-[#102a61]">TEDUHI</span><span className="mt-0.5 block text-[12px] text-slate-500">Portal Laporan Warga</span></span>
      </Link>
      <div className="flex shrink-0 items-center gap-3">
        <Link href="/portal/notifikasi" aria-label="Notifikasi" className="relative grid size-10 place-items-center rounded-full text-slate-600 hover:bg-white"><BellIcon width={23} height={23} /><span aria-label="Notifikasi baru" className="absolute right-1 top-1 size-2.5 rounded-full border-2 border-[#f6f9fd] bg-red-500" /></Link>
        <Link href="/portal/profil" aria-label="Profil warga" className="grid size-11 place-items-center rounded-full bg-linear-to-br from-sky-400 to-blue-700 text-sm font-extrabold text-white shadow-sm">{avatar}</Link>
      </div>
    </header>
  );
}