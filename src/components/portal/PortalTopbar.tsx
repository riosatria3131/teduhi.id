"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDemoSessionName } from "@/lib/demo-auth";
import { NotificationBell } from "./NotificationBell";

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
    <header className="sticky top-0 z-50 hidden h-[82px] items-center justify-end border-b border-slate-100 bg-white/90 px-7 backdrop-blur-xl xl:px-10 lg:flex">
      <div className="ml-auto flex items-center gap-5">
        <NotificationBell />
        <Link href="/portal/profil" className="flex items-center gap-3 rounded-2xl py-1.5 pl-2 pr-3 transition hover:bg-[#f4f7fc]">
          <span className="grid size-10 place-items-center rounded-full bg-linear-to-br from-sky-400 to-blue-700 text-xs font-extrabold text-white shadow-sm">{getInitials(name)}</span>
          <span className="text-left leading-tight"><span className="block max-w-40 truncate text-sm font-bold text-[#102a61]">{name}</span></span>
        </Link>
      </div>
    </header>
  );
}