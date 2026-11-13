"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "@/components/icons";
import { signOutDemoAccount } from "@/lib/demo-auth";
import { useBpdlhNotificationPreferences } from "@/lib/bpdlh-notification-preference";

const sections = ["Informasi Akun", "Notifikasi"] as const;

export default function BpdlhSettingsPage() {
  const router = useRouter();
  const [section, setSection] = useState<(typeof sections)[number]>(sections[0]);
  const [saved, setSaved] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const { draft, loading: preferencesLoading, saving, saved: preferencesSaved, error: preferencesError, updateDraft, save: savePreferences } = useBpdlhNotificationPreferences();

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
        <form onSubmit={(event) => { event.preventDefault(); if (section === "Notifikasi") { void savePreferences(); } else { setSaved(true); } }} className="grid gap-4 p-4 sm:p-6">
          {section === "Informasi Akun" ? <>
            <label className="grid max-w-xl gap-2 text-xs font-bold text-[#102a61]">Nama tampilan<input defaultValue="Admin Keuangan" className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-normal outline-none focus:border-blue-400" /></label>
            <label className="grid max-w-xl gap-2 text-xs font-bold text-[#102a61]">Unit kerja<input defaultValue="BPDLH · Keuangan" className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-normal outline-none focus:border-blue-400" /></label>
            <p className="max-w-xl rounded-lg bg-slate-50 p-3 text-[10px] leading-relaxed text-slate-500">Pengaturan akun pada panel ini masih berupa tampilan demo dan belum tersimpan ke server.</p>
          </> : <>
            <label className="flex max-w-xl items-center justify-between gap-4 rounded-lg border border-slate-200 p-3 text-xs font-semibold text-[#102a61]">Notifikasi pengajuan baru<input type="checkbox" checked={draft.newSubmissionsEnabled} disabled={preferencesLoading || saving} onChange={(event) => updateDraft("newSubmissionsEnabled", event.target.checked)} className="size-4 accent-blue-700" /></label>
            <label className="flex max-w-xl items-center justify-between gap-4 rounded-lg border border-slate-200 p-3 text-xs font-semibold text-[#102a61]">Notifikasi perubahan status<input type="checkbox" checked={draft.statusChangesEnabled} disabled={preferencesLoading || saving} onChange={(event) => updateDraft("statusChangesEnabled", event.target.checked)} className="size-4 accent-blue-700" /></label>
            {preferencesLoading && <p role="status" className="max-w-xl text-xs text-slate-500">Memuat preferensi dari Supabase…</p>}
            {preferencesError && <p role="alert" className="max-w-xl rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{preferencesError}</p>}
          </>}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <button type="submit" disabled={section === "Notifikasi" && (preferencesLoading || saving)} className="min-h-10 rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Menyimpan…" : "Simpan Perubahan"}</button>
            {section === "Notifikasi" ? preferencesSaved && <span role="status" className="text-xs font-semibold text-emerald-700">Preferensi notifikasi tersimpan.</span> : saved && <span role="status" className="text-xs font-semibold text-emerald-700">Pengaturan demo berhasil disimpan.</span>}
          </div>
        </form>
      </section>
      <section aria-labelledby="bpdlh-logout-title" className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-100 bg-white p-4 shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)] sm:p-5">
        <div>
          <h2 id="bpdlh-logout-title" className="text-sm font-extrabold text-[#102a61]">Sesi Admin</h2>
          <p className="mt-1 text-xs text-slate-500">Keluar dari panel administrasi BPDLH.</p>
        </div>
        <button type="button" onClick={() => { setLogoutError(""); setConfirmLogout(true); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50">
          <LogOutIcon width={17} height={17} />Keluar
        </button>
      </section>
      {confirmLogout && <div role="presentation" onClick={() => !logoutPending && setConfirmLogout(false)} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
        <section role="dialog" aria-modal="true" aria-labelledby="bpdlh-confirm-logout-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-rose-50 text-rose-700"><LogOutIcon width={22} height={22} /></span>
          <h2 id="bpdlh-confirm-logout-title" className="mt-4 text-lg font-extrabold text-[#102a61]">Konfirmasi Keluar</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">Apakah Anda yakin ingin keluar dari panel BPDLH?</p>
          {logoutError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{logoutError}</p>}
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" disabled={logoutPending} onClick={() => setConfirmLogout(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60">Batal</button>
            <button type="button" disabled={logoutPending} onClick={() => void handleLogout()} className="rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-800 disabled:opacity-60">{logoutPending ? "Memproses…" : "Ya, Keluar"}</button>
          </div>
        </section>
      </div>}
    </div>
  );
}
