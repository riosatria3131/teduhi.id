import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan — TEDUHI",
  description: "Halaman yang Anda cari tidak tersedia.",
};

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#f7faff] px-5 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-[0_20px_60px_-35px_rgba(16,39,92,0.35)] sm:p-12">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-blue-700">TEDUHI · 404</p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#102a61]">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">Tautan mungkin sudah berubah atau alamat yang dimasukkan tidak tersedia. Kembali ke beranda untuk melanjutkan.</p>
        <Link href="/" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-[#102a61] px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800">Kembali ke beranda</Link>
      </section>
    </main>
  );
}
