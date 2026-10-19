"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BellIcon, SearchIcon } from "@/components/icons";
import { getDemoSessionName } from "@/lib/demo-auth";

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "W";
}

export function PortalTopbar() {
  const [name, setName] = useState("Warga");

  useEffect(() => {
    const refreshName = () => setName(getDemoSessionName() ?? "Warga");
    refreshName();
    window.addEventListener("laporkota:session-changed", refreshName);
    return () => window.removeEventListener("laporkota:session-changed", refreshName);
  }, []);

  return (
    <header className="sticky top-0 z-20 hidden h-[82px] items-center justify-between border-b border-slate-100 bg-white/90 px-7 backdrop-blur-xl xl:px-10 lg:flex">
      <div className="mr-8 min-w-[150px]">
        <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-blue-600">Ruang warga</p>
        <p className="mt-0.5 text-sm font-bold text-[#102a61]">Portal TEDUHI</p>
      </div>
      <form action="/portal/riwayat" role="search" className="relative w-full max-w-xl">
        <SearchIcon width={18} height={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input name="q" type="search" aria-label="Cari laporan" placeholder="Cari laporan berdasarkan judul atau ID…" className="w-full rounded-2xl border border-slate-200 bg-[#f7f9fc] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:bg-white" />
      </form>
      <div className="ml-8 flex items-center gap-5">
        <Link href="/portal/notifikasi" aria-label="Buka notifikasi" className="relative grid size-11 place-items-center rounded-2xl text-slate-500 transition hover:bg-[#f4f7fc] hover:text-brand-dark">
          <BellIcon width={20} height={20} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </Link>
        <Link href="/portal/profil" className="flex items-center gap-3 rounded-2xl py-1.5 pl-2 pr-3 transition hover:bg-[#f4f7fc]">
          <span className="grid size-10 place-items-center rounded-full bg-linear-to-br from-sky-400 to-blue-700 text-xs font-extrabold text-white shadow-sm">{getInitials(name)}</span>
          <span className="text-left leading-tight"><span className="block max-w-40 truncate text-sm font-bold text-[#102a61]">{name}</span><span className="block text-[11px] text-slate-500">Akun demo</span></span>
        </Link>
      </div>
    </header>
  );
}