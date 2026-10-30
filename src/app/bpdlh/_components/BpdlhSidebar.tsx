"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BuildingsIcon, FileIcon, HomeIcon, LogOutIcon, LogoMark, SettingsIcon } from "@/components/icons";
import { signOutDemoAccount } from "@/lib/demo-auth";

const navigation = [
  { label: "Dashboard", icon: HomeIcon, href: "/bpdlh" },
  { label: "Kotak Masuk Pengajuan", icon: FileIcon, href: "/bpdlh/pengajuan" },
  { label: "Pos Anggaran", icon: BuildingsIcon, href: "/bpdlh/anggaran" },
  { label: "Pengaturan", icon: SettingsIcon, href: "/bpdlh/pengaturan" },
];

export function BpdlhSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    setLogoutPending(true);
    setLogoutError("");
    try {
      await signOutDemoAccount();
      router.replace("/masuk");
    } catch {
      setLogoutError("Gagal keluar dari akun. Periksa koneksi lalu coba lagi.");
      setLogoutPending(false);
    }
  }

  return (
    <aside className="border-b border-slate-200 bg-white px-4 py-3 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-b-0 lg:px-3 lg:py-4">
      <Link href="/bpdlh" className="flex items-center gap-3 border-b border-slate-100 px-1 pb-4">
        <LogoMark size={52} />
        <span className="leading-tight">
          <span className="flex items-center gap-1 text-xl font-extrabold tracking-tight text-[#102a61]">
            Teduhi
            <span aria-hidden="true" className="ml-0.5 size-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-orange-500" />
          </span>
          <span className="mt-0.5 block whitespace-nowrap text-[11px] font-semibold">
            <span className="text-[#28577f]">Temukan, </span>
            <span className="text-orange-600">Edukasi </span>
            <span className="text-slate-500">dan </span>
            <span className="text-emerald-700">Hadapi</span>
          </span>
        </span>
      </Link>
      <div className="mt-3 hidden rounded-lg bg-blue-50 px-3 py-2 text-[10px] font-bold text-blue-700 lg:block">Management Keuangan</div>
      <nav aria-label="Navigasi admin BPDLH" className="mt-3 flex gap-1 overflow-x-auto pb-1 lg:mt-5 lg:grid lg:overflow-visible">
        {navigation.map(({ label, icon: Icon, href }) => {
          const active = pathname === href || (href !== "/bpdlh" && pathname.startsWith(`${href}/`));
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold transition lg:w-full ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"}`}>
              <Icon width={15} height={15} /><span className="flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-3 border-t border-slate-100 pt-3 lg:mt-auto">
        <button type="button" onClick={() => { setLogoutError(""); setConfirmLogout(true); }} className="inline-flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-700">
          <LogOutIcon width={15} height={15} /> Keluar
        </button>
      </div>
      {confirmLogout && <div role="presentation" onClick={() => !logoutPending && setConfirmLogout(false)} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
        <section role="dialog" aria-modal="true" aria-labelledby="bpdlh-logout-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-rose-50 text-rose-700"><LogOutIcon width={22} height={22} /></span>
          <h2 id="bpdlh-logout-title" className="mt-4 text-lg font-extrabold text-[#102a61]">Konfirmasi Keluar</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">Apakah Anda yakin ingin keluar dari panel BPDLH?</p>
          {logoutError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{logoutError}</p>}
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" disabled={logoutPending} onClick={() => setConfirmLogout(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60">Batal</button>
            <button type="button" disabled={logoutPending} onClick={() => void handleLogout()} className="rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-800 disabled:opacity-60">{logoutPending ? "Memproses…" : "Ya, Keluar"}</button>
          </div>
        </section>
      </div>}
    </aside>
  );
}
