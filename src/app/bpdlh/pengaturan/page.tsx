"use client";

import { useState } from "react";

const sections = ["Informasi Akun", "Notifikasi", "Keamanan"] as const;

export default function BpdlhSettingsPage() {
  const [section, setSection] = useState<(typeof sections)[number]>(sections[0]);
  const [saved, setSaved] = useState(false);

  return (
    <div className="mx-auto grid max-w-[1200px] gap-4">
      <header>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-blue-700">Administrasi BPDLH</p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight text-[#102a61] sm:text-2xl">Pengaturan</h1>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">Kelola preferensi akun dan notifikasi panel keuangan.</p>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)]">
        <div role="tablist" aria-label="Kategori pengaturan" className="flex overflow-x-auto border-b border-slate-100 px-3 sm:px-5">
          {sections.map((item) => <button key={item} type="button" role="tab" aria-selected={section === item} onClick={() => { setSection(item); setSaved(false); }} className={`shrink-0 border-b-2 px-4 py-3.5 text-xs font-bold transition ${section === item ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-[#102a61]"}`}>{item}</button>)}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); setSaved(true); }} className="grid gap-4 p-4 sm:p-6">
          {section === "Informasi Akun" ? <>
            <label className="grid max-w-xl gap-2 text-xs font-bold text-[#102a61]">Nama tampilan<input defaultValue="Admin Keuangan" className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-normal outline-none focus:border-blue-400" /></label>
            <label className="grid max-w-xl gap-2 text-xs font-bold text-[#102a61]">Unit kerja<input defaultValue="BPDLH · Keuangan" className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-normal outline-none focus:border-blue-400" /></label>
            <p className="max-w-xl rounded-lg bg-slate-50 p-3 text-[10px] leading-relaxed text-slate-500">Pengaturan akun pada panel ini masih berupa tampilan demo dan belum tersimpan ke server.</p>
          </> : section === "Notifikasi" ? <>
            <label className="flex max-w-xl items-center justify-between gap-4 rounded-lg border border-slate-200 p-3 text-xs font-semibold text-[#102a61]">Notifikasi pengajuan baru<input type="checkbox" defaultChecked className="size-4 accent-blue-700" /></label>
            <label className="flex max-w-xl items-center justify-between gap-4 rounded-lg border border-slate-200 p-3 text-xs font-semibold text-[#102a61]">Notifikasi perubahan status<input type="checkbox" defaultChecked className="size-4 accent-blue-700" /></label>
          </> : <>
            <label className="grid max-w-xl gap-2 text-xs font-bold text-[#102a61]">Durasi sesi<select defaultValue="8 jam" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal"><option>1 jam</option><option>4 jam</option><option>8 jam</option></select></label>
            <p className="max-w-xl rounded-lg bg-amber-50 p-3 text-[10px] leading-relaxed text-amber-800">Pengaturan keamanan perlu dukungan backend sebelum digunakan untuk mengubah sesi akun.</p>
          </>}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <button type="submit" className="min-h-10 rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-800">Simpan Perubahan</button>
            {saved && <span role="status" className="text-xs font-semibold text-emerald-700">Pengaturan demo berhasil disimpan.</span>}
          </div>
        </form>
      </section>
    </div>
  );
}
