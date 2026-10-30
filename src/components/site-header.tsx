"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearDemoSession, getDemoDashboardPath, getDemoSession, type DemoSession } from "@/lib/demo-auth";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { CloseIcon, LogoMark, MenuIcon } from "./icons";

const NAV: { id?: string; label: string; href: string }[] = [
  { id: "beranda", label: "Beranda", href: "#beranda" },
  { id: "profil", label: "Profil", href: "#profil" },
  { id: "cara-kerja", label: "Cara Kerja", href: "#cara-kerja" },
  { id: "faq", label: "FAQ", href: "#faq" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("beranda");
  const [session, setSession] = useState<DemoSession | null>(null);

  function refreshSession() {
    setSession(getDemoSession());
  }

  useEffect(() => {
    const els = NAV.map((n) => n.id ? document.getElementById(n.id) : null).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));

    void Promise.resolve().then(refreshSession);
    window.addEventListener("laporkota:session-changed", refreshSession);
    window.addEventListener("storage", refreshSession);
    let unsubscribe: () => void = () => {};
    try {
      const { data } = getSupabaseClient().auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") {
          clearDemoSession();
          return;
        }
        refreshSession();
      });
      unsubscribe = () => data.subscription.unsubscribe();
      void getSupabaseClient().auth.getSession().then(({ data: authData }) => {
        if (!authData.session) clearDemoSession();
        else refreshSession();
      }).catch(() => undefined);
    } catch {
      // Keep public landing pages usable when Supabase is not configured.
    }

    return () => {
      io.disconnect();
      window.removeEventListener("laporkota:session-changed", refreshSession);
      window.removeEventListener("storage", refreshSession);
      unsubscribe();
    };
  }, []);

  const dashboardPath = getDemoDashboardPath(session?.role);
  const avatar = session?.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "W";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto grid h-[72px] w-full max-w-[1440px] grid-cols-[1fr_auto] items-center gap-5 px-5 sm:px-8 lg:px-12 2xl:px-16 md:grid-cols-[1fr_auto_1fr]">
        <a href="#beranda" className="flex items-center gap-2.5 justify-self-start">
          <LogoMark size={42} />
          <span className="leading-tight">
            <span className="flex items-center gap-1 text-xl font-extrabold tracking-tight text-[#102a61]">
              Teduhi<span aria-hidden="true" className="ml-0.5 size-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-orange-500" />
            </span>
            <span className="block whitespace-nowrap text-[10px] font-semibold sm:text-[11px]">
              <span className="text-[#28577f]">Temukan, </span>
              <span className="text-orange-600">Edukasi </span>
              <span className="text-muted">dan </span>
              <span className="text-emerald-700">Hadapi</span>
            </span>
          </span>
        </a>

        <nav aria-label="Navigasi utama" className="hidden md:block">
          <ul className="flex items-center gap-1 rounded-full border border-line bg-[#f3f5f9] p-1.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={item.id && active === item.id ? "true" : undefined}
                  className="block rounded-full px-4 py-2 text-sm font-semibold text-muted transition-colors hover:text-ink aria-[current=true]:bg-white aria-[current=true]:text-ink aria-[current=true]:shadow-[0_1px_3px_rgba(16,39,92,0.12)]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 justify-self-end md:flex">
          {session ? (
            <Link href={dashboardPath} aria-label={`Dashboard ${session.name}`} title={session.name} className="grid size-11 place-items-center overflow-hidden rounded-full border-2 border-white bg-linear-to-br from-sky-400 to-blue-700 text-sm font-extrabold text-white shadow-[0_2px_8px_rgba(16,39,92,0.24)] ring-1 ring-line transition hover:scale-105">
              {avatar}
            </Link>
          ) : <>
            <Link href="/masuk" className="rounded-full px-4 py-2 text-sm font-bold text-ink hover:text-brand">
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
            >
              Daftar
            </Link>
          </>}
        </div>

        <button
          type="button"
          className="relative grid size-10 place-items-center justify-self-end rounded-lg border border-line transition-colors duration-300 hover:bg-brand-soft md:hidden motion-reduce:transition-none"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <MenuIcon className={`absolute transition-all duration-300 ease-out motion-reduce:transition-none ${open ? "rotate-90 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
          <CloseIcon className={`absolute transition-all duration-300 ease-out motion-reduce:transition-none ${open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-75 opacity-0"}`} />
        </button>
      </div>

      <nav
        id="menu-mobile"
        aria-label="Navigasi utama"
        aria-hidden={!open}
        inert={!open}
        className={`mx-1.5 mt-1 overflow-hidden rounded-2xl border border-line bg-white shadow-lg transition-[max-height,opacity,transform,margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden motion-reduce:transition-none ${open ? "max-h-96 translate-y-0 opacity-100" : "pointer-events-none mt-0 max-h-0 -translate-y-2 border-transparent opacity-0 shadow-none"}`}
      >
          <ul className="mx-auto flex max-w-[82rem] flex-col px-5 py-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-3 font-semibold transition-[background-color,transform,opacity] duration-300 hover:bg-brand-soft motion-reduce:transition-none ${open ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="mt-2 border-t border-line pt-4">
              {session ? (
                <Link href={dashboardPath} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 font-bold text-ink hover:bg-brand-soft">
                  <span className="grid size-10 place-items-center rounded-full bg-linear-to-br from-sky-400 to-blue-700 text-sm font-extrabold text-white">{avatar}</span>
                  <span>Dashboard {session.name}</span>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/masuk" className="rounded-full border border-line px-4 py-3 text-center font-bold">
                    Masuk
                  </Link>
                  <Link href="/daftar" className="rounded-full bg-ink px-4 py-3 text-center font-bold text-white transition-colors hover:bg-brand-dark">
                    Daftar
                  </Link>
                </div>
              )}
            </li>
          </ul>
      </nav>
    </header>
  );
}
