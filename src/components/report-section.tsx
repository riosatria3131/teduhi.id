import type { ReactNode } from "react";
import { ArrowRightIcon, CheckIcon, ClipboardIcon, CrosshairIcon, PinIcon, UploadIcon } from "./icons";

/**
 * Bagian ini hanya contoh tampilan fitur pelaporan (mockup statis, bukan input).
 * Form sungguhan ada di `report-form.tsx`. Saat backend siap, pasang
 * `<ReportForm />` di sini atau di halaman terpisah.
 */

function MockField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold text-muted">{label}</p>
      <p className="rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink">{value}</p>
    </div>
  );
}

function FeatureCard({
  icon, title, text, className = "", children,
}: {
  icon: ReactNode; title: string; text: string; className?: string; children: ReactNode;
}) {
  return (
    <article className={`overflow-hidden rounded-2xl bg-white p-6 text-ink sm:p-7 ${className}`}>
      <div className="md:max-w-[15.5rem] lg:max-w-none">
        <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">{icon}</span>
        <h3 className="mt-4 text-base font-extrabold tracking-tight">{title}</h3>
        <p className="mt-2 text-[13px] leading-6 text-muted">{text}</p>
      </div>
      {children}
    </article>
  );
}

export function ReportSection() {
  return (
    <section
      id="lapor"
      aria-labelledby="judul-contoh"
      className="relative isolate overflow-hidden bg-night text-white"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(60% 80% at 0% 0%, #1b2a73 0%, transparent 62%), radial-gradient(55% 70% at 100% 100%, #0e4a52 0%, transparent 65%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-mint">
              Contoh tampilan fitur
            </p>
            <h2
              id="judul-contoh"
              className="mt-3 text-base leading-[1.35] font-extrabold tracking-tight text-balance sm:text-lg"
            >
              Isi satu form, laporan masuk ke antrean pemeriksaan.{" "}
              <span className="text-mint">Pantau sampai selesai.</span>
            </h2>
          </div>
          <a href="#cara-kerja" className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-mint hover:underline">
            Lihat cara kerjanya
            <ArrowRightIcon width={16} height={16} />
          </a>
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <FeatureCard
            icon={<ClipboardIcon width={22} height={22} />}
            title="Laporan masuk lewat satu form."
            text="Isi judul, kategori, foto, dan deskripsi singkat. Laporan langsung masuk antrean pemeriksaan."
            className="md:flex md:items-center md:gap-8"
          >
            <div aria-hidden="true" className="mt-6 flex-1 select-none md:mt-0">
              <div className="-rotate-1 rounded-xl border border-line bg-white p-4">
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span className="font-semibold">Laporan baru</span>
                  <span>Kec. Bogor Tengah</span>
                </div>
                <div className="mt-3 grid gap-3">
                  <MockField label="Judul kerusakan" value="Jalan berlubang di Jl. Merdeka" />
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-dark">
                      Jalan &amp; Trotoar
                    </span>
                    <span className="flex min-w-0 items-center gap-1.5 rounded-full border border-dashed border-brand/40 bg-paper px-3 py-1 text-xs text-muted">
                      <UploadIcon width={12} height={12} className="shrink-0 text-brand" />
                      <span className="truncate">jalan-berlubang.jpg</span>
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ok-soft text-ok">
                    <CheckIcon width={16} height={16} />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[13px] font-bold">Laporan terkirim</span>
                    <span className="block text-[11px] text-muted">Menunggu verifikasi · LK-2026-0124</span>
                  </span>
                </div>
              </div>
            </div>
          </FeatureCard>

          <FeatureCard
            icon={<PinIcon width={22} height={22} />}
            title="Lokasi tanpa peta."
            text="Pilih kecamatan dan tulis patokan, atau pakai lokasi Anda saat ini."
          >
            <div aria-hidden="true" className="mt-5 grid select-none gap-3 rounded-xl bg-paper p-4">
              <MockField label="Kecamatan" value="Bogor Tengah" />
              <MockField label="Alamat atau patokan" value="Jl. Merdeka, depan toko" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand bg-white px-3 py-1.5 text-xs font-semibold text-brand-dark">
                  <CrosshairIcon width={14} height={14} />
                  Gunakan lokasi saya
                </span>
                <span className="rounded-full bg-ok-soft px-2.5 py-1 text-[11px] font-semibold text-ok">
                  -6.5950, 106.8166
                </span>
              </div>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
