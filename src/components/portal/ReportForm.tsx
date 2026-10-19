"use client";

import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, CrosshairIcon, PinIcon, UploadIcon } from "@/components/icons";
import { CATEGORIES, DISTRICTS } from "@/lib/data";
import { saveLocalReport } from "@/lib/portal-store";

const fieldClass = "w-full rounded-xl border border-line bg-white px-3.5 py-3 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-brand";
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export function ReportForm() {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [locationNotice, setLocationNotice] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [pending, setPending] = useState(false);
  const [ticket, setTicket] = useState("");

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  function onPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!(["image/jpeg", "image/png"].includes(file.type))) {
      event.target.value = "";
      setNotice("Foto harus berformat JPG atau PNG.");
      setPhoto(null);
      setPhotoPreview("");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      event.target.value = "";
      setNotice("Ukuran foto maksimal 5 MB.");
      setPhoto(null);
      setPhotoPreview("");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setNotice("");
  }

  function useLocation() {
    if (!navigator.geolocation) {
      setLocationNotice("Peramban tidak mendukung lokasi. Silakan isi alamat secara manual.");
      return;
    }
    setLocationNotice("Meminta izin lokasi perangkat…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const lat = document.getElementById("portal-latitude") as HTMLInputElement | null;
        const lng = document.getElementById("portal-longitude") as HTMLInputElement | null;
        if (lat) lat.value = coords.latitude.toFixed(6);
        if (lng) lng.value = coords.longitude.toFixed(6);
        setLocationNotice("Koordinat terisi. Lengkapi alamat sebagai patokan lokasi.");
      },
      () => setLocationNotice("Lokasi tidak tersedia. Izinkan akses lokasi atau isi alamat manual."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (!photo) {
      setNotice("Pilih foto bukti sebelum menyimpan laporan.");
      return;
    }

    const data = new FormData(form);
    const latitude = String(data.get("latitude") ?? "").trim();
    const longitude = String(data.get("longitude") ?? "").trim();
    if (latitude && (!Number.isFinite(Number(latitude)) || Math.abs(Number(latitude)) > 90)) {
      setNotice("Latitude harus berupa angka antara -90 dan 90.");
      return;
    }
    if (longitude && (!Number.isFinite(Number(longitude)) || Math.abs(Number(longitude)) > 180)) {
      setNotice("Longitude harus berupa angka antara -180 dan 180.");
      return;
    }

    setPending(true);
    setNotice("");
    try {
      const report = await saveLocalReport({
        title: String(data.get("title") ?? ""),
        category: String(data.get("category") ?? ""),
        description: String(data.get("description") ?? ""),
        district: String(data.get("district") ?? ""),
        address: String(data.get("address") ?? ""),
        latitude,
        longitude,
        photo,
      });
      setTicket(report.id);
      form.reset();
      setPhoto(null);
      setPhotoPreview("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Laporan demo gagal disimpan di browser ini.");
    } finally {
      setPending(false);
    }
  }

  if (ticket) {
    return (
      <section role="status" className="rounded-2xl border border-line bg-white p-6 text-center shadow-[0_8px_28px_-24px_rgba(16,39,92,0.45)] sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckIcon width={28} height={28} /></span>
        <h2 className="mt-4 text-2xl font-extrabold text-ink">Laporan demo tersimpan</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted">Data dan foto disimpan di browser ini untuk demonstrasi. Laporan belum dikirim ke pemerintah dan belum diterima petugas.</p>
        <p className="mt-4 inline-flex rounded-xl bg-paper px-4 py-3 font-mono text-lg font-bold text-brand-dark">{ticket}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => router.push(`/portal/riwayat/${encodeURIComponent(ticket)}`)} className="min-h-11 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark">Lihat detail demo</button>
          <button type="button" onClick={() => setTicket("")} className="min-h-11 rounded-xl border border-line px-5 py-2.5 text-sm font-bold text-ink hover:bg-paper">Buat laporan lain</button>
          <Link href="/portal/riwayat" className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold text-brand-dark hover:bg-brand-soft">Buka riwayat</Link>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-2xl border border-line bg-white p-5 shadow-[0_8px_28px_-24px_rgba(16,39,92,0.45)] sm:p-7">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid content-start gap-2 text-sm font-bold text-ink">Judul laporan <span className="text-danger">*</span>
          <input name="title" required minLength={5} maxLength={120} className={fieldClass} placeholder="Contoh: Jalan berlubang dekat sekolah" />
        </label>
        <label className="grid content-start gap-2 text-sm font-bold text-ink">Kategori kerusakan <span className="text-danger">*</span>
          <select name="category" required defaultValue="" className={fieldClass}><option value="" disabled>Pilih kategori</option>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink md:col-span-2">Foto bukti <span className="text-danger">*</span>
          <span className="flex min-h-20 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-brand/40 bg-paper/60 px-4 py-4 font-normal text-muted hover:border-brand">
            {photoPreview ? <img src={photoPreview} alt="Pratinjau foto yang dipilih" className="size-14 shrink-0 rounded-lg object-cover" /> : <UploadIcon width={22} height={22} className="shrink-0 text-brand" />}
            <span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink">{photo?.name ?? "Pilih foto dari perangkat"}</span><span className="block text-xs">JPG atau PNG, maksimal 5 MB</span></span>
            <input name="photo" type="file" accept="image/jpeg,image/png" required={!photo} className="sr-only" onChange={onPhotoChange} />
          </span>
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink md:col-span-2">Deskripsi kerusakan <span className="text-danger">*</span>
          <textarea name="description" required minLength={10} rows={4} className={fieldClass} placeholder="Jelaskan kondisi, ukuran, atau dampak kerusakan…" />
        </label>
      </div>

      <div className="rounded-2xl bg-paper/70 p-4 sm:p-5">
        <div className="flex items-center gap-2"><PinIcon width={19} height={19} className="text-brand" /><h2 className="font-extrabold text-ink">Lokasi kerusakan</h2></div>
        <p className="mt-1 text-xs text-muted">Pilih kecamatan dan tulis alamat atau patokan terdekat.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-ink">Kecamatan <span className="text-danger">*</span>
            <select name="district" required defaultValue="" className={fieldClass}><option value="" disabled>Pilih kecamatan</option>{DISTRICTS.map((district) => <option key={district}>{district}</option>)}</select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">Alamat detail <span className="text-danger">*</span>
            <input name="address" required minLength={5} className={fieldClass} placeholder="Nama jalan, nomor, atau patokan" />
          </label>
          <div className="md:col-span-2">
            <button type="button" onClick={useLocation} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-brand/30 bg-white px-4 py-2.5 text-sm font-bold text-brand-dark hover:bg-brand-soft"><CrosshairIcon width={18} height={18} /> Gunakan lokasi perangkat</button>
            <p aria-live="polite" className="mt-2 min-h-5 text-xs text-muted">{locationNotice}</p>
          </div>
          <label className="grid gap-2 text-sm font-bold text-ink">Latitude <span className="text-xs font-normal text-muted">(opsional)</span><input id="portal-latitude" name="latitude" inputMode="decimal" className={fieldClass} placeholder="-6.5950" /></label>
          <label className="grid gap-2 text-sm font-bold text-ink">Longitude <span className="text-xs font-normal text-muted">(opsional)</span><input id="portal-longitude" name="longitude" inputMode="decimal" className={fieldClass} placeholder="106.8166" /></label>
        </div>
      </div>
      <div aria-live="polite" role={notice ? "alert" : undefined} className={notice ? "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900" : "hidden"}>{notice}</div>
      <button type="submit" disabled={pending} className="min-h-12 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-wait disabled:opacity-70">{pending ? "Menyimpan demo…" : "Periksa dan simpan demo"}</button>
      <p className="text-center text-xs leading-relaxed text-muted">Data disimpan pada browser ini saja sebagai demo lokal. Tidak ada laporan yang dikirim ke server atau instansi.</p>
    </form>
  );
}