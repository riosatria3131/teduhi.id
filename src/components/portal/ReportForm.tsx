"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CameraIcon, CheckIcon, PinIcon, UploadIcon } from "@/components/icons";
import { CATEGORIES } from "@/lib/data";
import { saveLocalReport } from "@/lib/portal-store";

const fieldClass = "w-full rounded-xl border border-line bg-white px-3.5 py-3 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-brand";
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const REGION_API = "https://www.emsifa.com/api-wilayah-indonesia/api";

type RegionOption = { id: string; name: string };

async function fetchRegions(url: string, signal: AbortSignal): Promise<RegionOption[]> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Data wilayah gagal dimuat. Coba muat ulang halaman.");
  return await response.json() as RegionOption[];
}

function RegionDropdown({
  id,
  label,
  value,
  options,
  placeholder,
  loading = false,
  disabled = false,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: RegionOption[];
  placeholder: string;
  loading?: boolean;
  disabled?: boolean;
  onChange: (option: RegionOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = options.find((option) => option.id === value);
  const filteredOptions = options.filter((option) => option.name.toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID")));

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative grid gap-2 text-sm font-bold text-ink">
      <label htmlFor={id}>{label}</label>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-haspopup="listbox"
        disabled={disabled || loading}
        onClick={() => {
          setQuery("");
          setOpen((current) => !current);
        }}
        className={`${fieldClass} flex min-h-12 items-center justify-between gap-3 text-left disabled:cursor-not-allowed disabled:bg-slate-50`}
      >
        <span className={`truncate ${selected ? "text-ink" : "text-muted/70"}`}>
          {loading ? `Memuat ${label.toLowerCase()}…` : selected?.name ?? placeholder}
        </span>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={`size-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && <div className="absolute inset-x-0 top-full z-50 mt-1.5 flex max-h-[240px] flex-col overflow-hidden rounded-xl border border-line bg-white shadow-[0_12px_30px_-12px_rgba(16,39,92,0.35)]">
        <div className="shrink-0 border-b border-line bg-white p-2">
          <input
            ref={searchRef}
            type="search"
            role="searchbox"
            aria-label={`Cari ${label.toLowerCase()}`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                setOpen(false);
                setQuery("");
              }
            }}
            placeholder={`Cari ${label.toLowerCase()}…`}
            className="h-9 w-full rounded-lg border border-line px-3 text-sm font-normal text-ink outline-none placeholder:text-muted/70 focus:border-brand"
          />
        </div>
        <div id={`${id}-options`} role="listbox" aria-label={label} className="min-h-0 overflow-y-auto overscroll-contain p-1.5">
        {filteredOptions.map((option) => <button
          key={option.id}
          type="button"
          role="option"
          aria-selected={value === option.id}
          onClick={() => {
            onChange(option);
            setOpen(false);
            setQuery("");
          }}
          className={`flex min-h-10 w-full items-center rounded-lg px-3 text-left text-sm font-medium transition-colors ${value === option.id ? "bg-brand-soft text-brand-dark" : "text-ink hover:bg-paper"}`}
        >{option.name}</button>)}
        {filteredOptions.length === 0 && <p className="px-3 py-2 text-xs font-normal text-muted">{options.length ? "Tidak ada hasil yang cocok." : "Pilihan tidak tersedia."}</p>}
        </div>
      </div>}
    </div>
  );
}

export function ReportForm() {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [pending, setPending] = useState(false);
  const [ticket, setTicket] = useState("");
  const [category, setCategory] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryPickerRef = useRef<HTMLDivElement>(null);
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  const firstCategoryRef = useRef<HTMLButtonElement>(null);
  const [provinces, setProvinces] = useState<RegionOption[]>([]);
  const [regencies, setRegencies] = useState<RegionOption[]>([]);
  const [districts, setDistricts] = useState<RegionOption[]>([]);
  const [idProvinsi, setIdProvinsi] = useState("");
  const [idKabupaten, setIdKabupaten] = useState("");
  const [idKecamatan, setIdKecamatan] = useState("");
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [regionError, setRegionError] = useState("");
  const [regionRetry, setRegionRetry] = useState(0);
  const [address, setAddress] = useState("");

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchRegions(`${REGION_API}/provinces.json`, controller.signal)
      .then(setProvinces)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setRegionError(error instanceof Error ? error.message : "Data provinsi gagal dimuat.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingProvinces(false);
      });
    return () => controller.abort();
  }, [regionRetry]);

  useEffect(() => {
    if (!idProvinsi) return;
    const controller = new AbortController();
    void fetchRegions(`${REGION_API}/regencies/${idProvinsi}.json`, controller.signal)
      .then(setRegencies)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setRegionError(error instanceof Error ? error.message : "Data kabupaten/kota gagal dimuat.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingRegencies(false);
      });
    return () => controller.abort();
  }, [idProvinsi, regionRetry]);

  useEffect(() => {
    if (!idKabupaten) return;
    const controller = new AbortController();
    void fetchRegions(`${REGION_API}/districts/${idKabupaten}.json`, controller.signal)
      .then(setDistricts)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setRegionError(error instanceof Error ? error.message : "Data kecamatan gagal dimuat.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingDistricts(false);
      });
    return () => controller.abort();
  }, [idKabupaten, regionRetry]);

  useEffect(() => {
    if (!categoryOpen) return;
    firstCategoryRef.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCategoryOpen(false);
        categoryButtonRef.current?.focus();
      }
    }
    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !categoryPickerRef.current?.contains(event.target)) {
        setCategoryOpen(false);
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [categoryOpen]);

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

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const requiredAreaFields = [
      { id: "province", value: idProvinsi, label: "provinsi" },
      { id: "city", value: idKabupaten, label: "kabupaten/kota" },
      { id: "district", value: idKecamatan, label: "kecamatan" },
      { id: "address", value: address, label: "alamat detail" },
    ];
    const missingArea = requiredAreaFields.find((field) => !field.value.trim());
    if (missingArea) {
      setNotice(`Lengkapi ${missingArea.label} sebelum mengirim laporan.`);
      document.getElementById(missingArea.id)?.focus();
      return;
    }
    if (!form.reportValidity()) return;
    if (!category) {
      setNotice("Pilih kategori bencana.");
      categoryButtonRef.current?.focus();
      return;
    }
    if (!idProvinsi || !idKabupaten || !idKecamatan) {
      setNotice("Lengkapi provinsi, kabupaten/kota, dan kecamatan.");
      document.getElementById(!idProvinsi ? "province" : !idKabupaten ? "city" : "district")?.focus();
      return;
    }
    if (!photo) {
      setNotice("Pilih foto bukti sebelum menyimpan laporan.");
      return;
    }

    const data = new FormData(form);
    const reportTitle = `${category} di ${String(data.get("address") ?? "").trim()}`.slice(0, 120);
    const provinceName = provinces.find((item) => item.id === idProvinsi)?.name ?? "";
    const cityName = regencies.find((item) => item.id === idKabupaten)?.name ?? "";
    const districtName = districts.find((item) => item.id === idKecamatan)?.name ?? "";
    setPending(true);
    setNotice("");
    try {
      const report = await saveLocalReport({
        title: reportTitle,
        category: String(data.get("category") ?? ""),
        description: String(data.get("description") ?? ""),
        district: `${districtName}, ${cityName}, ${provinceName}`,
        address: String(data.get("address") ?? ""),
        latitude: "",
        longitude: "",
        photo,
      });
      setTicket(report.id);
      form.reset();
      setCategory("");
      setIdProvinsi("");
      setIdKabupaten("");
      setIdKecamatan("");
      setLoadingRegencies(false);
      setLoadingDistricts(false);
      setAddress("");
      setPhoto(null);
      setPhotoPreview("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Laporan gagal dikirim ke server.");
    } finally {
      setPending(false);
    }
  }

  if (ticket) {
    return (
      <section role="status" className="rounded-2xl border border-line bg-white p-6 text-center shadow-[0_8px_28px_-24px_rgba(16,39,92,0.45)] sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckIcon width={28} height={28} /></span>
        <h2 className="mt-4 text-2xl font-extrabold text-ink">Laporan berhasil dikirim</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted">Laporan dan foto bukti telah disimpan. Anda dapat memantau perkembangannya melalui riwayat laporan.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => router.push(`/portal/riwayat/${encodeURIComponent(ticket)}`)} className="min-h-11 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark">Lihat detail laporan</button>
          <button type="button" onClick={() => setTicket("")} className="min-h-11 rounded-xl border border-line px-5 py-2.5 text-sm font-bold text-ink hover:bg-paper">Buat laporan lain</button>
          <Link href="/portal/riwayat" className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold text-brand-dark hover:bg-brand-soft">Buka riwayat</Link>
        </div>
      </section>
    );
  }

  const provinceName = provinces.find((item) => item.id === idProvinsi)?.name ?? "";
  const cityName = regencies.find((item) => item.id === idKabupaten)?.name ?? "";
  const districtName = districts.find((item) => item.id === idKecamatan)?.name ?? "";
  const mapSearch = [address, districtName, cityName, provinceName].filter(Boolean).join(", ") || "Bogor, Jawa Barat";
  const encodedMapSearch = encodeURIComponent(mapSearch);

  return (
    <form onSubmit={onSubmit} className="grid min-w-0 grid-cols-1 gap-5 rounded-2xl border border-line bg-white p-5 shadow-[0_8px_28px_-24px_rgba(16,39,92,0.45)] sm:p-7">
      <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
        <div ref={categoryPickerRef} className="relative z-20 grid content-start gap-2 text-sm font-bold text-ink md:col-span-2">
          <span id="category-label">Kategori bencana <span className="text-danger">*</span></span>
          <input type="hidden" name="category" value={category} />
          <button
            ref={categoryButtonRef}
            type="button"
            aria-labelledby="category-label category-value"
            aria-haspopup="listbox"
            aria-controls="category-options"
            aria-expanded={categoryOpen}
            onClick={() => setCategoryOpen((open) => !open)}
            className={`${fieldClass} flex min-h-12 items-center justify-between text-left ${category ? "" : "text-muted/70"}`}
          >
            <span id="category-value">{category || "Pilih kategori"}</span>
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4 shrink-0 text-muted"><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {categoryOpen && (
            <div
              id="category-options"
              role="listbox"
              aria-label="Kategori bencana"
              className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[min(60dvh,26rem)] overflow-y-auto overscroll-contain rounded-2xl border border-line/70 bg-white p-2 shadow-[0_12px_32px_-12px_rgba(16,39,92,0.28)]"
            >
              {CATEGORIES.map((item, index) => (
                <button
                  key={item}
                  ref={index === Math.max(0, CATEGORIES.findIndex((item) => item === category)) ? firstCategoryRef : undefined}
                  type="button"
                  role="option"
                  aria-selected={category === item}
                  onClick={() => {
                    setCategory(item);
                    setCategoryOpen(false);
                    setNotice("");
                    categoryButtonRef.current?.focus();
                  }}
                  className={`flex min-h-16 w-full items-center justify-between border-b border-line/60 px-4 py-3 text-left text-base font-medium last:border-b-0 ${category === item ? "bg-brand-soft/70 text-brand" : "text-ink hover:bg-paper"}`}
                >
                  {item}
                  {category === item && <CheckIcon width={22} height={22} className="text-brand" />}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid gap-2 text-sm font-bold text-ink md:col-span-2"><p>Foto bukti <span className="text-danger">*</span></p>
          <label className="hidden min-h-16 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-brand/40 bg-paper/60 px-4 py-3 font-normal text-muted hover:border-brand md:flex">
            {photoPreview ? <img src={photoPreview} alt="Pratinjau foto yang dipilih" className="size-12 shrink-0 rounded-lg object-cover" /> : <UploadIcon width={22} height={22} className="shrink-0 text-brand" />}
            <span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink">{photo?.name ?? "Ambil foto bukti"}</span><span className="block text-xs">JPG atau PNG, maksimal 5 MB</span></span>
            <input type="file" accept="image/jpeg,image/png" capture="environment" className="sr-only" onChange={onPhotoChange} />
          </label>
          <div className="grid gap-4 rounded-xl border border-dashed border-brand/40 bg-paper/60 px-4 py-4 font-normal text-muted md:hidden">
            <span className="flex min-w-0 items-center gap-3">
              {photoPreview ? <img src={photoPreview} alt="Pratinjau foto yang dipilih" className="size-14 shrink-0 rounded-lg object-cover" /> : <UploadIcon width={22} height={22} className="shrink-0 text-brand" />}
              <span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink">{photo?.name ?? "Ambil foto bukti"}</span><span className="block text-xs">JPG atau PNG, maksimal 5 MB</span></span>
            </span>
            <span className="grid grid-cols-1 gap-2">
              <label className="flex min-h-11 min-w-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border border-brand/30 bg-white px-1.5 py-1 text-center text-[11px] leading-tight font-semibold text-brand-dark hover:bg-brand-soft">
                <CameraIcon width={17} height={17} /> Ambil foto
                <input type="file" accept="image/jpeg,image/png" capture="environment" className="sr-only" onChange={onPhotoChange} />
              </label>
            </span>
          </div>
        </div>
        <label className="grid gap-2 text-sm font-bold text-ink md:col-span-2">Deskripsi bencana <span className="font-normal text-muted">(opsional)</span>
          <textarea name="description" rows={4} className={fieldClass} placeholder="Beri keterangan" />
        </label>
      </div>

      <div className="min-w-0 rounded-2xl bg-paper/70 p-4 sm:p-5">
        <div className="flex items-center gap-2"><PinIcon width={19} height={19} className="text-brand" /><h2 className="font-extrabold text-ink">Lokasi kerusakan</h2></div>
        <p className="mt-1 text-xs text-muted">Pilih provinsi, kabupaten/kota, dan kecamatan. Isi alamat detail atau patokan secara terpisah.</p>
        <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
          <RegionDropdown
            id="province"
            label="Provinsi"
            value={idProvinsi}
            options={provinces}
            placeholder="Pilih provinsi"
            loading={loadingProvinces}
            onChange={(option) => {
              setRegionError("");
              setIdProvinsi(option.id);
              setIdKabupaten("");
              setIdKecamatan("");
              setLoadingRegencies(true);
              setLoadingDistricts(false);
              setRegencies([]);
              setDistricts([]);
            }}
          />
          <RegionDropdown
            id="city"
            label="Kabupaten/Kota"
            value={idKabupaten}
            options={regencies}
            placeholder={idProvinsi ? "Pilih kabupaten/kota" : "Pilih provinsi terlebih dahulu"}
            loading={loadingRegencies}
            disabled={!idProvinsi}
            onChange={(option) => {
              setRegionError("");
              setIdKabupaten(option.id);
              setIdKecamatan("");
              setLoadingDistricts(true);
              setDistricts([]);
            }}
          />
          <RegionDropdown
            id="district"
            label="Kecamatan"
            value={idKecamatan}
            options={districts}
            placeholder={idKabupaten ? "Pilih kecamatan" : "Pilih kabupaten/kota terlebih dahulu"}
            loading={loadingDistricts}
            disabled={!idKabupaten}
            onChange={(option) => setIdKecamatan(option.id)}
          />
          <label className="grid gap-2 text-sm font-bold text-ink">Alamat detail
            <input id="address" name="address" required minLength={5} value={address} onChange={(event) => setAddress(event.target.value)} className={fieldClass} placeholder="Nama jalan, nomor, atau patokan" />
          </label>
        </div>
        {regionError && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{regionError} <button type="button" onClick={() => { setRegionError(""); setLoadingProvinces(true); setLoadingRegencies(Boolean(idProvinsi)); setLoadingDistricts(Boolean(idKabupaten)); setRegionRetry((value) => value + 1); }} className="font-bold underline">Coba lagi</button></p>}
        <p className="mt-3 text-xs leading-relaxed text-muted">Daftar kabupaten/kota dan kecamatan akan dimuat setelah pilihan wilayah sebelumnya dipilih.</p>
      </div>
      <div aria-live="polite" role={notice ? "alert" : undefined} className={notice ? "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900" : "hidden"}>{notice}</div>
      <section aria-labelledby="map-preview-title" className="grid gap-3 rounded-2xl border border-line bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><h2 id="map-preview-title" className="font-extrabold text-ink">Lokasi di Google Maps</h2><p className="mt-1 text-xs text-muted">Peta menyesuaikan alamat dan wilayah yang Anda isi.</p></div>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodedMapSearch}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-brand-dark hover:underline">Buka Google Maps</a>
        </div>
        <iframe title={`Peta lokasi: ${mapSearch}`} src={`https://maps.google.com/maps?q=${encodedMapSearch}&output=embed`} className="h-64 w-full rounded-xl border-0 sm:h-80" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </section>
      <button type="submit" disabled={pending} className="min-h-12 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-wait disabled:opacity-70">{pending ? "Mengirim…" : "Kirim Laporan"}</button>
    </form>
  );
}