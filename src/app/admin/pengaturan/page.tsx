"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AdminPageHeading } from "@/components/admin/shared/AdminPageHeading";
import { DEFAULT_LANDING_PAGE_CONTENT, getLandingPageContent, resetLandingPageContent, saveLandingPageContent, type LandingPageContent } from "@/lib/landing-page-content";

const tabs = ["Informasi", "Kelola Landing Page", "Tampilan", "Keamanan", "Notifikasi"] as const;
const textFieldClass = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400";

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const [saved, setSaved] = useState(false);
  const [landingContent, setLandingContent] = useState<LandingPageContent>(DEFAULT_LANDING_PAGE_CONTENT);

  useEffect(() => {
    setLandingContent(getLandingPageContent());
  }, []);

  function updateLandingContent(field: keyof LandingPageContent, value: string) {
    setLandingContent((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tab === "Kelola Landing Page") saveLandingPageContent(landingContent);
    setSaved(true);
  }

  function restoreLandingDefaults() {
    resetLandingPageContent();
    setLandingContent(DEFAULT_LANDING_PAGE_CONTENT);
    setSaved(true);
  }

  return (
    <div className="grid gap-6">
      <AdminPageHeading eyebrow="Administrasi" title="Pengaturan Sistem" description="Mengatur informasi aplikasi, preferensi tampilan, keamanan, dan notifikasi." />
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)]">
        <div role="tablist" aria-label="Pengaturan" className="flex overflow-x-auto border-b border-slate-100 px-4 sm:px-6">{tabs.map((item) => <button key={item} role="tab" aria-selected={tab === item} onClick={() => { setTab(item); setSaved(false); }} className={`shrink-0 border-b-2 px-4 py-4 text-sm font-bold transition ${tab === item ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-[#102a61]"}`}>{item}</button>)}</div>
        <form onSubmit={saveSettings} className="grid gap-5 p-5 sm:p-7">
          {tab === "Informasi" ? <>
            <label className="grid max-w-2xl gap-2 text-sm font-bold text-[#102a61]">Nama Aplikasi<input defaultValue="TEDUHI" className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-400" /></label>
            <label className="grid max-w-2xl gap-2 text-sm font-bold text-[#102a61]">Email Kontak<input type="email" defaultValue="support@teduhi.id" className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-400" /></label>
          </> : tab === "Kelola Landing Page" ? <>
            <div className="max-w-3xl">
              <h2 className="text-base font-extrabold text-[#102a61]">Banner utama</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Ubah teks yang tampil pada bagian Beranda. Gambar banner tetap dikelola dari file website.</p>
            </div>
            <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-[#102a61]">Label banner<input maxLength={70} value={landingContent.heroBadge} onChange={(event) => updateLandingContent("heroBadge", event.target.value)} className={textFieldClass} /></label>
              <label className="grid gap-2 text-sm font-bold text-[#102a61]">Subjudul banner<input maxLength={140} value={landingContent.heroSubtitle} onChange={(event) => updateLandingContent("heroSubtitle", event.target.value)} className={textFieldClass} /></label>
              <label className="grid gap-2 text-sm font-bold text-[#102a61]">Judul banner — baris 1<input maxLength={90} value={landingContent.heroLineOne} onChange={(event) => updateLandingContent("heroLineOne", event.target.value)} className={textFieldClass} /></label>
              <label className="grid gap-2 text-sm font-bold text-[#102a61]">Judul banner — baris 2<input maxLength={90} value={landingContent.heroLineTwo} onChange={(event) => updateLandingContent("heroLineTwo", event.target.value)} className={textFieldClass} /></label>
              <label className="grid gap-2 text-sm font-bold text-[#102a61] sm:col-span-2">Judul banner — teks penekanan<input maxLength={40} value={landingContent.heroEmphasis} onChange={(event) => updateLandingContent("heroEmphasis", event.target.value)} className={textFieldClass} /></label>
            </div>
            <div className="mt-2 max-w-3xl border-t border-slate-100 pt-5">
              <h2 className="text-base font-extrabold text-[#102a61]">Bagian Profil TEDUHI</h2>
            </div>
            <div className="grid max-w-3xl gap-4">
              <label className="grid gap-2 text-sm font-bold text-[#102a61]">Judul Profil<input maxLength={160} value={landingContent.profileHeading} onChange={(event) => updateLandingContent("profileHeading", event.target.value)} className={textFieldClass} /></label>
              <label className="grid gap-2 text-sm font-bold text-[#102a61]">Deskripsi Profil<textarea maxLength={1000} rows={5} value={landingContent.profileDescription} onChange={(event) => updateLandingContent("profileDescription", event.target.value)} className={textFieldClass} /></label>
            </div>
            <div className="mt-2 max-w-3xl border-t border-slate-100 pt-5">
              <h2 className="text-base font-extrabold text-[#102a61]">Ajakan di bagian bawah</h2>
            </div>
            <div className="grid max-w-3xl gap-4">
              <label className="grid gap-2 text-sm font-bold text-[#102a61]">Judul ajakan<input maxLength={160} value={landingContent.ctaHeading} onChange={(event) => updateLandingContent("ctaHeading", event.target.value)} className={textFieldClass} /></label>
              <label className="grid gap-2 text-sm font-bold text-[#102a61]">Deskripsi ajakan<textarea maxLength={300} rows={3} value={landingContent.ctaDescription} onChange={(event) => updateLandingContent("ctaDescription", event.target.value)} className={textFieldClass} /></label>
            </div>
            <p className="max-w-3xl rounded-xl bg-blue-50 p-4 text-xs leading-relaxed text-blue-800">Perubahan disimpan di penyimpanan browser ini dan langsung tampil di landing page pada browser yang sama. Pengelolaan bersama lintas perangkat memerlukan penyimpanan backend.</p>
          </> : tab === "Tampilan" ? <>
            <label className="grid max-w-2xl gap-2 text-sm font-bold text-[#102a61]">Tema aplikasi<select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal"><option>Terang</option><option>Sistem</option></select></label>
          </> : tab === "Keamanan" ? <>
            <label className="grid max-w-2xl gap-2 text-sm font-bold text-[#102a61]">Durasi sesi admin<select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal"><option>8 jam</option><option>4 jam</option><option>1 jam</option></select></label>
            <p className="rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">Konfigurasi keamanan memerlukan backend autentikasi sebelum digunakan di lingkungan produksi.</p>
          </> : <>
            <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-[#102a61]">Notifikasi laporan baru<input type="checkbox" defaultChecked className="size-4 accent-blue-700" /></label>
            <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-[#102a61]">Notifikasi laporan tertunda<input type="checkbox" defaultChecked className="size-4 accent-blue-700" /></label>
          </>}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5"><button className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800">{tab === "Kelola Landing Page" ? "Simpan Landing Page" : "Simpan Perubahan"}</button>{tab === "Kelola Landing Page" && <button type="button" onClick={restoreLandingDefaults} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Kembalikan Teks Awal</button>}{saved && <span role="status" className="text-sm font-semibold text-emerald-700">{tab === "Kelola Landing Page" ? "Konten landing page berhasil disimpan." : "Pengaturan demo berhasil disimpan."}</span>}</div>
        </form>
        {tab !== "Kelola Landing Page" && <p className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">Pengaturan belum tersimpan ke server.</p>}
      </section>
    </div>
  );
}