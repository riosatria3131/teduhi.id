"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon, LogoMark, MenuIcon } from "./icons";

const NAV = [
  { id: "beranda", label: "Beranda" },
  { id: "cara-kerja", label: "Cara Kerja" },
  { id: "faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("beranda");

  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto grid h-[72px] max-w-6xl grid-cols-[1fr_auto] items-center gap-5 px-6 md:grid-cols-[1fr_auto_1fr]">
        <a href="#beranda" className="flex items-center gap-2.5 justify-self-start">
          <LogoMark size={42} />
          <span className="leading-tight">
            <span className="block text-xl font-extrabold tracking-tight text-ink">TEDUHI</span>
            <span className="block text-[11px] text-muted">Suara Warga, Kota Lebih Baik</span>
          </span>
        </a>

        <nav aria-label="Navigasi utama" className="hidden md:block">
          <ul className="flex items-center gap-1 rounded-full border border-line bg-[#f3f5f9] p-1.5">
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "true" : undefined}
                  className="block rounded-full px-4 py-2 text-sm font-semibold text-muted transition-colors hover:text-ink aria-[current=true]:bg-white aria-[current=true]:text-ink aria-[current=true]:shadow-[0_1px_3px_rgba(16,39,92,0.12)]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 justify-self-end md:flex">
          <Link href="/masuk" className="rounded-full px-4 py-2 text-sm font-bold text-ink hover:text-brand">
            Masuk
          </Link>
          <Link
            href="/daftar"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
          >
            Daftar
          </Link>
        </div>

        <button
          type="button"
          className="grid size-10 place-items-center justify-self-end rounded-lg border border-line md:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <nav id="menu-mobile" aria-label="Navigasi utama" className="border-t border-line bg-white md:hidden">
          <ul className="mx-auto flex max-w-[82rem] flex-col px-5 py-3">
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 font-semibold hover:bg-brand-soft"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="mt-2 grid grid-cols-2 gap-3 border-t border-line pt-4">
              <Link href="/masuk" className="rounded-full border border-line px-4 py-3 text-center font-bold">
                Masuk
              </Link>
              <Link href="/daftar" className="rounded-full bg-ink px-4 py-3 text-center font-bold text-white">
                Daftar
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
