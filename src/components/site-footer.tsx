"use client";

import Link from "next/link";
import { LogoMark, WhatsAppIcon } from "./icons";
import { useLandingPageContent } from "@/lib/landing-page-content";

export function SiteFooter() {
  const content = useLandingPageContent();
  const columns = [
    { title: "Panduan", links: [{ label: "Beranda", href: "/#beranda" }, { label: "Profil", href: "/#profil" }, { label: "Cara kerja", href: "/#cara-kerja" }, { label: "FAQ", href: "/#faq" }, { label: "Berita", href: "/berita" }] },
    { title: "Akses", links: [{ label: "Admin", href: "/masuk" }, { label: "User", href: "/daftar" }] },
    { title: "Bantuan & Legal", links: [{ label: `Bantuan (${content.supportEmail})`, href: `mailto:${content.supportEmail}` }, { label: "Syarat & Ketentuan", href: "/syarat-ketentuan#top" }] },
  ];
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-x-8 gap-y-12 px-5 py-14 sm:px-8 sm:gap-x-10 lg:px-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr] 2xl:px-16">
        <div className="col-span-2 flex flex-col items-start lg:col-span-1">
          <Link href="/#beranda" className="inline-flex items-center gap-3">
            <LogoMark size={40} />
            <span className="flex flex-col leading-tight">
            <span className="flex items-center gap-1 text-xl font-extrabold tracking-tight text-[#102a61]">
              Teduhi
              <span aria-hidden="true" className="ml-0.5 size-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-orange-500" />
            </span>
            <span className="mt-1 block whitespace-nowrap text-[11px] font-semibold">
              <span className="text-[#28577f]">Temukan, </span>
              <span className="text-orange-600">Edukasi </span>
              <span className="text-muted">dan </span>
              <span className="text-emerald-700">Hadapi</span>
            </span>
            </span>
          </Link>
          <p className="mt-5 text-xs font-extrabold tracking-[0.16em] text-ink">
            {content.contactHeading}
          </p>
          <div className="mt-2 flex gap-2">
            <a
              href={content.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram TEDUHI"
              className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-white text-brand-dark transition-colors hover:border-brand hover:bg-brand-soft"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-[18px]">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </a>
            <a
              href={content.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube TEDUHI"
              className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-white text-brand-dark transition-colors hover:border-brand hover:bg-brand-soft"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-[18px]">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L16 12l-6.4 3.6Z" />
              </svg>
            </a>
            <a
              href={content.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp TEDUHI"
              className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-white text-brand-dark transition-colors hover:border-brand hover:bg-brand-soft"
            >
              <WhatsAppIcon width={18} height={18} />
            </a>
          </div>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-xs font-extrabold tracking-[0.14em] text-ink uppercase">{col.title}</h2>
            <ul className="mt-5 grid gap-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith("/") ? (
                    <Link href={l.href} className="text-[13px] leading-6 break-words text-muted hover:text-brand-dark">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className="text-[13px] leading-6 break-words text-muted hover:text-brand-dark">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1440px] px-5 py-5 text-xs text-muted sm:px-8 lg:px-12 2xl:px-16">
          © 2026 Teduhi. Seluruh hak dilindungi.
        </p>
      </div>
    </footer>
  );
}
