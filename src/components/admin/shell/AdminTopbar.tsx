"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOutIcon, LogoMark } from "@/components/icons";
import { AdminNotificationBell } from "./AdminNotifications";

export function AdminTopbar() {
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const openDialog = () => setShowLogout(true);
    window.addEventListener("teduhi:admin-logout", openDialog);
    return () => window.removeEventListener("teduhi:admin-logout", openDialog);
  }, []);

  return <>
    <header className="sticky top-0 z-20 flex min-h-[68px] items-center justify-between gap-3 border-b border-slate-100 bg-white/95 px-4 backdrop-blur sm:px-6 lg:h-[72px] lg:px-8 xl:px-10">
      <Link href="/admin" aria-label="Dashboard TEDUHI" className="flex shrink-0 items-center gap-2 lg:hidden"><LogoMark size={30} /><span className="text-sm font-extrabold text-[#102a61]">TEDUHI</span></Link>
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
        <AdminNotificationBell />
        <div className="flex items-center gap-2 border-l border-slate-100 pl-2 sm:pl-4"><span className="grid size-8 place-items-center rounded-full bg-blue-100 text-[10px] font-extrabold text-blue-700">AD</span><span className="hidden sm:block"><span className="block text-xs font-bold text-[#102a61]">Admin</span><span className="block text-[10px] text-slate-500">Administrator</span></span></div>
      </div>
    </header>
    {showLogout && <div role="presentation" onClick={() => setShowLogout(false)} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="logout-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"><span className="mx-auto grid size-12 place-items-center rounded-full bg-blue-50 text-blue-700"><LogOutIcon width={22} height={22} /></span><h2 id="logout-title" className="mt-4 text-lg font-extrabold text-[#102a61]">Konfirmasi Keluar</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">Apakah Anda yakin ingin keluar dari panel administrasi?</p><div className="mt-6 flex justify-center gap-3"><button type="button" onClick={() => setShowLogout(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Batal</button><Link href="/masuk" onClick={() => setShowLogout(false)} className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800">Ya, Keluar</Link></div></section></div>}
  </>;
}