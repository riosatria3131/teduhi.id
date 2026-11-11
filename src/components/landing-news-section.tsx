"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLandingPageContent } from "@/lib/landing-page-content";
import type { LandingNewsItem } from "@/lib/landing-page-content";

const UPLOAD_DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatUploadDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Tanggal tidak tersedia" : UPLOAD_DATE_FORMAT.format(date);
}

function formatUploadAge(value: string, now: Date | null) {
  const uploadedAt = new Date(value);
  if (Number.isNaN(uploadedAt.getTime())) return "Tanggal tidak tersedia";
  if (!now) return formatUploadDate(value);

  const elapsedDays = Math.floor((now.getTime() - uploadedAt.getTime()) / 86_400_000);
  if (elapsedDays < 0) return "Baru saja";
  if (elapsedDays === 0) return "Hari ini";
  if (elapsedDays < 30) return `${elapsedDays} hari yang lalu`;
  return `${Math.min(2, Math.floor(elapsedDays / 30))} bulan yang lalu`;
}

export function LandingNewsSection() {
  const { news } = useLandingPageContent();
  const [selectedNews, setSelectedNews] = useState<LandingNewsItem | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateNow = () => setNow(new Date());
    updateNow();
    const interval = window.setInterval(updateNow, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedNews) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedNews(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedNews]);

  function getSourceName(sourceUrl: string) {
    try {
      return new URL(sourceUrl).hostname.replace(/^www\./, "");
    } catch {
      return "Sumber berita";
    }
  }

  return (
    <section id="berita" aria-labelledby="landing-news-title" className="overflow-hidden bg-[linear-gradient(180deg,#f7fcfa_0%,#ffffff_100%)] py-12 sm:py-16">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 2xl:px-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 sm:mb-10">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-emerald-800 sm:text-xs">
              <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-emerald-500" />
              Kabar terkini{news.length > 0 ? ` · ${news.length} berita` : ""}
            </p>
            <h2 id="landing-news-title" className="mt-4 text-3xl font-extrabold tracking-tight text-[#102a61] sm:text-4xl lg:text-5xl">Berita</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base sm:leading-7">Berita dan informasi terbaru seputar bencana, lingkungan, serta upaya penanganan di Indonesia.</p>
          </div>
          <Link href="/#faq" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700">
            Informasi layanan <span aria-hidden="true">→</span>
          </Link>
        </div>
        {news.length > 0 ? <div className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-7">
          {news.map((item) => (
            <article key={item.id} className="group flex h-full flex-col overflow-hidden rounded-[1.65rem] border border-slate-200/80 bg-white shadow-[0_12px_34px_-24px_rgba(16,39,92,0.4)] transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_20px_44px_-24px_rgba(16,39,92,0.35)]">
              <div className="relative aspect-[16/9] overflow-hidden bg-paper">
                <Image src={item.photo} alt={item.title} fill unoptimized sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" />
                <span className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/95 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-emerald-800 shadow-sm">Berita</span>
                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Buka sumber: ${item.title}`} className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-slate-950/85 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-slate-950">
                  <span aria-hidden="true" className="text-emerald-400">↗</span> Artikel
                </a>
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                  <span>Berita</span>
                  <time className="font-medium normal-case tracking-normal text-slate-500" dateTime={item.createdAt}>{formatUploadAge(item.createdAt, now)}</time>
                </div>
                <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-slate-900 transition-colors group-hover:text-emerald-800">{item.title}</h3>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">{item.description}</p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <time className="text-xs text-slate-500" dateTime={item.createdAt}>Diunggah {formatUploadDate(item.createdAt)}</time>
                  <div className="flex shrink-0 items-center gap-3">
                    <button type="button" onClick={() => setSelectedNews(item)} aria-label={`Buka ringkasan: ${item.title}`} className="inline-flex min-h-9 items-center rounded-full bg-slate-100 px-4 text-xs font-bold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-800">
                      Ringkasan
                    </button>
                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Buka sumber berita: ${item.title}`} className="grid size-9 place-items-center text-lg font-semibold text-emerald-700 transition hover:text-emerald-800" title="Buka sumber berita">
                      ↗
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div> : <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/80 px-6 py-10 text-center shadow-sm">
          <p className="text-base font-bold text-[#102a61]">Belum ada berita yang ditambahkan.</p>
          <p className="mt-2 text-sm text-muted">Admin dapat menambahkan berita melalui Pengaturan → Kelola Landing Page.</p>
        </div>}
      </div>
      {selectedNews && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedNews(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="landing-news-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
              <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800">Berita · Artikel</span>
                <time className="text-xs text-slate-500" dateTime={selectedNews.createdAt}>
                  {formatUploadAge(selectedNews.createdAt, now)}
                </time>
              </div>
              <button type="button" onClick={() => setSelectedNews(null)} aria-label="Tutup ringkasan berita" className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-200/70 text-lg text-slate-500 transition hover:bg-slate-200">×</button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">Berita · Artikel</p>
              <h2 id="landing-news-dialog-title" className="mt-2 text-xl leading-snug font-extrabold tracking-tight text-slate-900 sm:text-2xl">{selectedNews.title}</h2>
              <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
                <Image src={selectedNews.photo} alt={selectedNews.title} fill unoptimized sizes="(max-width: 672px) 100vw, 600px" className="object-cover" />
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{selectedNews.description}</p>
              <p className="mt-4 text-xs leading-relaxed text-slate-400">Ringkasan ini disediakan oleh TEDUHI. Buka sumber berita untuk membaca artikel aslinya.</p>
            </div>
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
              <p className="min-w-0 truncate text-xs text-slate-500">Sumber berita asli: <span className="font-bold text-slate-700">{getSourceName(selectedNews.sourceUrl)}</span></p>
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={() => setSelectedNews(null)} className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50">Tutup</button>
                <a href={selectedNews.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white transition hover:bg-emerald-700">Kunjungi Sumber Berita <span aria-hidden="true">↗</span></a>
              </div>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}