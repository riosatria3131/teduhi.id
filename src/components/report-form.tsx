"use client";

import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { submitReport } from "@/lib/api";
import { CATEGORIES, DISTRICTS } from "@/lib/data";
import { CheckIcon, ClipboardIcon, CrosshairIcon, PinIcon, SendIcon, UploadIcon } from "./icons";
import { SectionTitle } from "./section-title";

const MAX_PHOTO = 5 * 1024 * 1024;
const FIELD_ORDER = ["title", "category", "photo", "description", "district", "address", "latitude", "longitude"] as const;

type FieldName = (typeof FIELD_ORDER)[number];
type Errors = Partial<Record<FieldName, string>>;

const input =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] placeholder:text-muted/70 aria-[invalid=true]:border-danger";

function Field({
  id, label, required, error, hint, children,
}: {
  id: string; label: string; required?: boolean; error?: string; hint?: string; children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-bold text-ink">
        {label}
        {required && <span className="text-danger" aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}

function describe(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export function ReportForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState({ latitude: "", longitude: "" });
  const [geoMsg, setGeoMsg] = useState("");
  const [pending, setPending] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);

  function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
    setErrors((prev) => ({ ...prev, photo: undefined }));
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setGeoMsg("Peramban Anda tidak mendukung lokasi. Isi alamat secara manual.");
      return;
    }
    setGeoMsg("Mencari lokasi Anda…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        });
        setGeoMsg("Koordinat terisi dari lokasi Anda saat ini.");
      },
      () => setGeoMsg("Lokasi tidak bisa diakses. Izinkan akses lokasi atau isi alamat secara manual."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();

    const next: Errors = {};
    if (get("title").length < 5) next.title = "Judul minimal 5 karakter.";
    if (!get("category")) next.category = "Pilih salah satu kategori.";
    if (!photo) next.photo = "Foto bukti wajib diunggah.";
    else if (!["image/jpeg", "image/png"].includes(photo.type)) next.photo = "Format foto harus JPG atau PNG.";
    else if (photo.size > MAX_PHOTO) next.photo = "Ukuran foto maksimal 5 MB.";
    if (get("description").length < 10) next.description = "Deskripsi minimal 10 karakter.";
    if (!get("district")) next.district = "Pilih kecamatan.";
    if (get("address").length < 5) next.address = "Tulis alamat atau patokan lokasi.";
    const lat = get("latitude");
    const lng = get("longitude");
    if (lat && !(Math.abs(Number(lat)) <= 90)) next.latitude = "Latitude harus antara -90 dan 90.";
    if (lng && !(Math.abs(Number(lng)) <= 180)) next.longitude = "Longitude harus antara -180 dan 180.";

    setErrors(next);
    const firstInvalid = FIELD_ORDER.find((f) => next[f]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setPending(true);
    try {
      const res = await submitReport({
        title: get("title"),
        category: get("category"),
        description: get("description"),
        district: get("district"),
        address: get("address"),
        latitude: lat,
        longitude: lng,
        photo: photo as File,
      });
      setTicket(res.ticket);
    } finally {
      setPending(false);
    }
  }

  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(null);
    setPreview(null);
    setCoords({ latitude: "", longitude: "" });
    setGeoMsg("");
    setErrors({});
    setTicket(null);
  }

  if (ticket) {
    return (
      <div role="status" className="rounded-2xl border border-line bg-white p-8 text-center sm:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-ok-soft text-ok">
          <CheckIcon width={28} height={28} />
        </span>
        <h2 id="judul-lapor" className="mt-5 text-2xl font-extrabold text-ink">Laporan Terkirim</h2>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          Terima kasih. Pemerintah akan memeriksa laporan Anda. Simpan kode berikut untuk memantau statusnya.
        </p>
        <p className="mt-5 inline-block rounded-lg bg-paper px-5 py-3 text-2xl font-extrabold tracking-wider text-ink tabular-nums">
          {ticket}
        </p>
        <div className="mt-7">
          <button type="button" onClick={reset} className="rounded-lg border border-line px-5 py-3 font-semibold hover:bg-paper">
            Buat Laporan Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white">
      <div className="border-b border-line p-6">
        <SectionTitle
          id="judul-lapor"
          icon={ClipboardIcon}
          title="Buat Laporan Kerusakan"
          subtitle="Isi form di bawah ini, lalu tentukan lokasi kerusakan."
        />
      </div>

      <form onSubmit={onSubmit} noValidate className="grid lg:grid-cols-2">
        <div className="grid content-start gap-5 p-6 lg:border-r lg:border-line">
          <Field id="title" label="Judul Kerusakan" required error={errors.title}>
            <input
              id="title" name="title" type="text" placeholder="Contoh: Jalan berlubang, lampu mati, dll."
              className={input} aria-invalid={!!errors.title} aria-describedby={describe("title", errors.title)}
            />
          </Field>

          <Field id="category" label="Kategori" required error={errors.category}>
            <select
              id="category" name="category" defaultValue="" className={input}
              aria-invalid={!!errors.category} aria-describedby={describe("category", errors.category)}
            >
              <option value="">Pilih kategori</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <Field id="photo" label="Foto Bukti" required error={errors.photo}>
            <input
              id="photo" name="photo" type="file" accept="image/jpeg,image/png" onChange={onPhoto}
              className="peer sr-only" aria-invalid={!!errors.photo} aria-describedby={errors.photo ? "photo-error" : undefined}
            />
            <label
              htmlFor="photo"
              className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed border-brand/40 bg-paper px-4 py-3 text-sm hover:border-brand peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand peer-aria-[invalid=true]:border-danger"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Pratinjau foto bukti" className="size-12 rounded-md object-cover" />
              ) : (
                <UploadIcon width={20} height={20} className="shrink-0 text-brand" />
              )}
              <span className="leading-tight">
                <span className="block font-medium text-ink">{photo ? photo.name : "Klik untuk mengunggah foto"}</span>
                <span className="block text-xs text-muted">Format: JPG, PNG (Maks. 5MB)</span>
              </span>
            </label>
          </Field>

          <Field id="description" label="Deskripsi Singkat" required error={errors.description}>
            <textarea
              id="description" name="description" rows={3} placeholder="Jelaskan kerusakan secara singkat…"
              className={input} aria-invalid={!!errors.description} aria-describedby={describe("description", errors.description)}
            />
          </Field>
        </div>

        <div className="grid content-start gap-5 bg-paper/60 p-6">
          <div className="flex items-center gap-2 text-ink">
            <PinIcon width={18} height={18} className="text-brand" />
            <h3 className="font-bold">Lokasi Kerusakan</h3>
          </div>
          <p className="-mt-3 text-sm text-muted">Pilih kecamatan dan tulis patokan lokasi, atau gunakan lokasi Anda saat ini.</p>

          <Field id="district" label="Kecamatan" required error={errors.district}>
            <select
              id="district" name="district" defaultValue="" className={input}
              aria-invalid={!!errors.district} aria-describedby={describe("district", errors.district)}
            >
              <option value="">Pilih kecamatan</option>
              {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>

          <Field id="address" label="Alamat atau Patokan" required error={errors.address}>
            <input
              id="address" name="address" type="text" placeholder="Jl. Merdeka, depan toko"
              className={input} aria-invalid={!!errors.address} aria-describedby={describe("address", errors.address)}
            />
          </Field>

          <div>
            <button
              type="button" onClick={useMyLocation}
              className="inline-flex items-center gap-2 rounded-lg border border-brand bg-white px-4 py-2.5 text-sm font-semibold text-brand-dark hover:bg-brand-soft"
            >
              <CrosshairIcon width={18} height={18} />
              Gunakan Lokasi Saya
            </button>
            <p aria-live="polite" className="mt-2 min-h-5 text-sm text-muted">{geoMsg}</p>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-bold text-ink">
              Koordinat Lokasi <span className="font-normal text-muted">(opsional)</span>
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="latitude" label="Latitude" error={errors.latitude}>
                <input
                  id="latitude" name="latitude" inputMode="decimal" placeholder="-6.5950"
                  value={coords.latitude} onChange={(e) => setCoords((c) => ({ ...c, latitude: e.target.value }))}
                  className={input} aria-invalid={!!errors.latitude} aria-describedby={errors.latitude ? "latitude-error" : undefined}
                />
              </Field>
              <Field id="longitude" label="Longitude" error={errors.longitude}>
                <input
                  id="longitude" name="longitude" inputMode="decimal" placeholder="106.8166"
                  value={coords.longitude} onChange={(e) => setCoords((c) => ({ ...c, longitude: e.target.value }))}
                  className={input} aria-invalid={!!errors.longitude} aria-describedby={errors.longitude ? "longitude-error" : undefined}
                />
              </Field>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-white p-4">
            <p className="text-[13px] font-bold text-ink">Tips agar cepat ditangani</p>
            <ul className="mt-2 grid gap-1.5 text-sm text-muted">
              <li>Foto jelas, tunjukkan kerusakan beserta sekitarnya.</li>
              <li>Tulis patokan terdekat, misalnya nama toko atau sekolah.</li>
              <li>Satu laporan untuk satu kerusakan.</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-line p-6 lg:col-span-2">
          <button
            type="submit" disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-70"
          >
            <SendIcon width={18} height={18} />
            {pending ? "Mengirim…" : "Kirim Laporan"}
          </button>
        </div>
      </form>
    </div>
  );
}
