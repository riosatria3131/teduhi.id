"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { LogOutIcon } from "@/components/icons";
import { AdminPageHeading } from "@/components/admin/shared/AdminPageHeading";
import { DEFAULT_LANDING_PAGE_CONTENT, getLandingPageContent, getLandingPageNews, getLandingPageSettings, saveLandingPageContent, saveLandingPageSettings, type LandingNewsItem, type LandingPageContent } from "@/lib/landing-page-content";
import { useAdminNotificationPreference } from "@/lib/admin-notification-preference";
import { getAdminTheme, saveAdminTheme, type AdminTheme } from "@/lib/admin-theme";
import { LandingPageEditor } from "@/components/admin/settings/LandingPageEditor";

const tabs = ["Informasi", "Kelola Landing Page", "Kelola Berita", "Tampilan", "Notifikasi"] as const;
const textFieldClass = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400";
const emptyNewsForm = { title: "", sourceUrl: "", photo: "", description: "" };

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return fallback;
}

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const [saved, setSaved] = useState(false);
  const [landingContent, setLandingContent] = useState<LandingPageContent>(DEFAULT_LANDING_PAGE_CONTENT);
  const [newsForm, setNewsForm] = useState(emptyNewsForm);
  const [newsError, setNewsError] = useState("");
  const [landingSettingsError, setLandingSettingsError] = useState("");
  const [theme, setTheme] = useState<AdminTheme>("light");
  const [themeDraft, setThemeDraft] = useState<AdminTheme | null>(null);
  const [themeError, setThemeError] = useState("");
  const [notificationDraft, setNotificationDraft] = useState<boolean | null>(null);
  const { enabled: notificationsEnabled, error: notificationError, saving: savingPreference, save: saveNotificationPreference } = useAdminNotificationPreference();

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      const localContent = getLandingPageContent();
      setLandingContent(localContent);
      setTheme(getAdminTheme());
      void getLandingPageSettings().then((settings) => {
        if (active) setLandingContent((current) => ({ ...current, ...settings }));
      }).catch((error: unknown) => {
        if (active) setLandingSettingsError(`Konten landing page gagal dimuat dari Supabase: ${errorMessage(error, "Periksa koneksi dan migrasi database.")}`);
      });
      void getLandingPageNews().then(async (news) => {
        let currentNews = news;
        if (news.length === 0 && localContent.news.length > 0) {
          await saveLandingPageContent({ ...localContent, news: localContent.news });
          currentNews = await getLandingPageNews();
        }
        if (active) setLandingContent((current) => ({ ...current, news: currentNews }));
      }).catch((error: unknown) => {
        if (active) setNewsError(`Berita gagal dimuat dari Supabase: ${errorMessage(error, "Periksa koneksi database.")}`);
      });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  function addLandingNews() {
    let sourceUrl: URL;
    try {
      sourceUrl = new URL(newsForm.sourceUrl.trim());
    } catch {
      setNewsError("Masukkan tautan sumber berita yang valid.");
      return;
    }
    if (!["http:", "https:"].includes(sourceUrl.protocol)) {
      setNewsError("Tautan sumber harus diawali http:// atau https://.");
      return;
    }
    if (!newsForm.title.trim() || !newsForm.photo || !newsForm.description.trim()) {
      setNewsError("Lengkapi judul, foto, dan deskripsi berita.");
      return;
    }
    if (landingContent.news.length >= 5) {
      setNewsError("Maksimal 5 berita dapat ditampilkan di landing page.");
      return;
    }

    const newsItem: LandingNewsItem = {
      id: crypto.randomUUID(),
      title: newsForm.title.trim(),
      sourceUrl: sourceUrl.toString(),
      photo: newsForm.photo,
      description: newsForm.description.trim(),
      createdAt: new Date().toISOString(),
    };
    setLandingContent((current) => ({ ...current, news: [newsItem, ...current.news] }));
    setNewsForm(emptyNewsForm);
    setNewsError("");
    setSaved(false);
  }

  function removeLandingNews(id: string) {
    setLandingContent((current) => ({ ...current, news: current.news.filter((item) => item.id !== id) }));
    setSaved(false);
  }

  function handleNewsPhoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNewsError("Pilih file foto dengan format gambar.");
      return;
    }
    if (file.size > 500 * 1024) {
      setNewsError("Ukuran foto maksimal 500 KB agar dapat disimpan di database.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setNewsForm((current) => ({ ...current, photo: reader.result as string }));
        setNewsError("");
      }
    };
    reader.onerror = () => setNewsError("Foto gagal dibaca. Coba pilih file lain.");
    reader.readAsDataURL(file);
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tab === "Kelola Landing Page") {
      try {
        await saveLandingPageSettings(landingContent);
        setLandingSettingsError("");
        setSaved(true);
      } catch (error) {
        setLandingSettingsError(`Konten landing page gagal disimpan di browser ini: ${errorMessage(error, "Periksa ruang penyimpanan browser.")}`);
        setSaved(false);
      }
      return;
    }
    if (tab === "Kelola Berita") {
      try {
        await saveLandingPageContent(landingContent);
        setNewsError("");
      } catch (error) {
        setNewsError(`Berita gagal disimpan ke Supabase: ${errorMessage(error, "Periksa akses database.")}`);
        setSaved(false);
        return;
      }
    }
    if (tab === "Tampilan") {
      const nextTheme = themeDraft ?? theme;
      try {
        saveAdminTheme(nextTheme);
        setTheme(nextTheme);
        setThemeDraft(null);
        setThemeError("");
        setSaved(true);
      } catch {
        setThemeError("Tema gagal disimpan di browser ini.");
        setSaved(false);
      }
      return;
    }
    if (tab === "Notifikasi") {
      if (notificationsEnabled === null) return;
      const savedSuccessfully = await saveNotificationPreference(notificationDraft ?? notificationsEnabled);
      setSaved(savedSuccessfully);
      if (savedSuccessfully) setNotificationDraft(null);
      return;
    }
    setSaved(true);
  }

  return (
    <div className="grid gap-6">
      <AdminPageHeading eyebrow="Administrasi" title="Pengaturan Sistem" description="Mengatur informasi aplikasi, preferensi tampilan, dan notifikasi." />
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)]">
        <div role="tablist" aria-label="Pengaturan" className="flex overflow-x-auto border-b border-slate-100 px-4 sm:px-6">{tabs.map((item) => <button key={item} role="tab" aria-selected={tab === item} onClick={() => { setTab(item); setSaved(false); }} className={`shrink-0 border-b-2 px-4 py-4 text-sm font-bold transition ${tab === item ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-[#102a61]"}`}>{item}</button>)}</div>
        <form onSubmit={saveSettings} className="grid gap-5 p-5 sm:p-7">
          {tab === "Informasi" ? <>
            <label className="grid max-w-2xl gap-2 text-sm font-bold text-[#102a61]">Nama Aplikasi<input defaultValue="TEDUHI" className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-400" /></label>
            <label className="grid max-w-2xl gap-2 text-sm font-bold text-[#102a61]">Email Kontak<input type="email" defaultValue="support@teduhi.id" className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-400" /></label>
          </> : tab === "Kelola Landing Page" ? <>
            <LandingPageEditor content={landingContent} onChange={(content) => { setLandingContent(content); setLandingSettingsError(""); setSaved(false); }} />
            {landingSettingsError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{landingSettingsError}</p>}
          </> : tab === "Kelola Berita" ? <>
            <div className="max-w-3xl">
              <h2 className="text-base font-extrabold text-[#102a61]">Berita landing page</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Tambahkan berita dengan tautan sumber, foto, dan deskripsi. Maksimal 5 berita; foto maksimal 500 KB. Data berita tersimpan di Supabase.</p>
            </div>
            <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-[#102a61]">Judul berita<input maxLength={120} value={newsForm.title} onChange={(event) => setNewsForm((current) => ({ ...current, title: event.target.value }))} className={textFieldClass} placeholder="Judul berita" /></label>
              <label className="grid gap-2 text-sm font-bold text-[#102a61]">Link sumber berita<input type="url" value={newsForm.sourceUrl} onChange={(event) => setNewsForm((current) => ({ ...current, sourceUrl: event.target.value }))} className={textFieldClass} placeholder="https://contoh.id/berita" /></label>
              <label className="grid gap-2 text-sm font-bold text-[#102a61] sm:col-span-2">Foto berita<input type="file" accept="image/*" onChange={(event) => handleNewsPhoto(event.target.files?.[0])} className={`${textFieldClass} file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-700`} /></label>
              {newsForm.photo && <Image src={newsForm.photo} alt="Pratinjau foto berita" width={640} height={360} unoptimized className="h-40 w-full rounded-xl border border-slate-200 object-cover sm:col-span-2" />}
              <label className="grid gap-2 text-sm font-bold text-[#102a61] sm:col-span-2">Deskripsi berita<textarea maxLength={600} rows={4} value={newsForm.description} onChange={(event) => setNewsForm((current) => ({ ...current, description: event.target.value }))} className={textFieldClass} placeholder="Tulis ringkasan berita..." /></label>
              {newsError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 sm:col-span-2">{newsError}</p>}
              <button type="button" onClick={addLandingNews} disabled={landingContent.news.length >= 5} className="w-fit rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">Tambah Berita</button>
            </div>
            {landingContent.news.length > 0 && <div className="grid max-w-3xl gap-3">
              <h3 className="text-sm font-bold text-[#102a61]">Berita yang akan ditampilkan ({landingContent.news.length}/5)</h3>
              {landingContent.news.map((item) => <article key={item.id} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                <Image src={item.photo} alt="" width={96} height={72} unoptimized className="size-20 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1"><h4 className="truncate text-sm font-bold text-[#102a61]">{item.title}</h4><p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.description}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block truncate text-xs font-semibold text-blue-700 hover:underline">Buka sumber berita</a></div>
                <button type="button" onClick={() => removeLandingNews(item.id)} className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50">Hapus</button>
              </article>)}
            </div>}
          </> : tab === "Tampilan" ? <>
            <label className="grid max-w-2xl gap-2 text-sm font-bold text-[#102a61]">Tema aplikasi<select value={themeDraft ?? theme} onChange={(event) => { setThemeDraft(event.target.value as AdminTheme); setThemeError(""); setSaved(false); }} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal"><option value="light">Terang</option><option value="dark">Gelap</option><option value="system">Sistem</option></select></label>
            <p className="max-w-2xl text-xs text-slate-500">Tema panel admin berubah dengan animasi dan mengikuti preferensi perangkat jika memilih Sistem.</p>
            {themeError && <p role="alert" className="max-w-2xl rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{themeError}</p>}
          </> : <>
            <label className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 text-sm font-semibold text-[#102a61] ${(notificationDraft ?? notificationsEnabled) === false ? "border-blue-300 bg-blue-50/60" : "border-slate-200"}`}>
              <span><span className="block">Nonaktifkan notifikasi</span><span className="mt-1 block text-xs font-normal text-slate-500">Admin tidak akan menerima notifikasi dari panel admin.</span></span>
              <input type="radio" name="admin-notifications" checked={(notificationDraft ?? notificationsEnabled) === false} disabled={notificationsEnabled === null || savingPreference} onChange={() => { setNotificationDraft(false); setSaved(false); }} className="size-4 accent-blue-700" />
            </label>
            <label className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 text-sm font-semibold text-[#102a61] ${(notificationDraft ?? notificationsEnabled) === true ? "border-blue-300 bg-blue-50/60" : "border-slate-200"}`}>
              <span><span className="block">Aktifkan notifikasi</span><span className="mt-1 block text-xs font-normal text-slate-500">Admin akan menerima semua notifikasi dari panel admin.</span></span>
              <input type="radio" name="admin-notifications" checked={(notificationDraft ?? notificationsEnabled) === true} disabled={notificationsEnabled === null || savingPreference} onChange={() => { setNotificationDraft(true); setSaved(false); }} className="size-4 accent-blue-700" />
            </label>
            {notificationError && <p role="alert" className="max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Preferensi gagal dimuat atau disimpan dari Supabase. {notificationError}</p>}
          </>}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5"><button disabled={tab === "Notifikasi" && (notificationsEnabled === null || savingPreference)} className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{savingPreference ? "Menyimpan…" : tab === "Kelola Berita" ? "Simpan Berita" : tab === "Kelola Landing Page" ? "Simpan Konten" : "Simpan Perubahan"}</button>{saved && tab !== "Informasi" && <span role="status" className="text-sm font-semibold text-emerald-700">{tab === "Kelola Landing Page" ? "Konten landing page berhasil disimpan di browser ini." : tab === "Kelola Berita" ? "Berita landing page berhasil disimpan." : tab === "Notifikasi" ? "Preferensi notifikasi berhasil disimpan dan tersinkron." : tab === "Tampilan" ? "Tema berhasil disimpan dan animasi diterapkan." : "Pengaturan demo berhasil disimpan."}</span>}</div>
        </form>
        {tab !== "Kelola Berita" && tab !== "Kelola Landing Page" && tab !== "Notifikasi" && tab !== "Informasi" && <p className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">{tab === "Tampilan" ? "Preferensi tema tersimpan pada browser ini." : "Pengaturan ini belum tersimpan ke server."}</p>}
      </section>
      <section aria-labelledby="admin-logout-title" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-100 bg-white p-5 shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)] sm:p-6">
        <div>
          <h2 id="admin-logout-title" className="text-sm font-extrabold text-[#102a61]">Sesi Admin</h2>
          <p className="mt-1 text-xs text-slate-500">Keluar dari panel administrasi TEDUHI.</p>
        </div>
        <button type="button" onClick={() => window.dispatchEvent(new Event("teduhi:admin-logout"))} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50">
          <LogOutIcon width={17} height={17} />Keluar
        </button>
      </section>
    </div>
  );
}