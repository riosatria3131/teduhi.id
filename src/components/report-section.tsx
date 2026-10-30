import type { ReactNode } from "react";
import { ArrowRightIcon, CheckIcon, ClipboardIcon, PinIcon, UploadIcon } from "./icons";

/**
 * Form sungguhan ada di `report-form.tsx`. Saat backend siap, pasang
 * `<ReportForm />` di sini atau di halaman terpisah.
 */

function MockField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-black text-emerald-900">{label}</p>
      <p className="rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink">{value}</p>
    </div>
  );
}

function FeatureCard({
  icon, title, text, className = "", contentClassName = "", children,
}: {
  icon: ReactNode; title: string; text: string; className?: string; contentClassName?: string; children: ReactNode;
}) {
  return (
    <article className={`overflow-hidden rounded-2xl bg-white p-6 text-ink sm:p-7 ${className}`}>
      <div className={`min-w-0 md:max-w-[15.5rem] lg:max-w-none ${contentClassName}`}>
        <span className="grid size-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">{icon}</span>
        <h3 className="mt-4 text-base font-extrabold tracking-tight text-emerald-900">{title}</h3>
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
      className="relative isolate overflow-hidden bg-[#dff5e8] text-ink"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(60% 80% at 0% 0%, #c9efd7 0%, transparent 62%), radial-gradient(55% 70% at 100% 100%, #d0f0df 0%, transparent 65%), linear-gradient(120deg, #e8f9ef 0%, #d8f3e3 50%, #e5f7ec 100%)",
        }}
      />

      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 2xl:px-16 md:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="inline-block rounded-full border border-emerald-800/10 bg-white/55 px-3 py-1 text-xs font-semibold text-emerald-700">
              Contoh tampilan fitur
            </p>
            <h2
              id="judul-contoh"
              className="mt-3 text-base leading-[1.35] font-extrabold tracking-tight text-emerald-900 text-balance sm:text-lg"
            >
              Isi satu form, laporan masuk ke antrean pemeriksaan.{" "}
              <span className="text-emerald-700">Pantau sampai selesai.</span>
            </h2>
          </div>
          <a href="#cara-kerja" className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-emerald-700 hover:underline">
            Lihat cara kerjanya
            <ArrowRightIcon width={16} height={16} />
          </a>
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <FeatureCard
            icon={<ClipboardIcon width={22} height={22} />}
            title="Laporan masuk lewat satu form."
            text="Isi judul, kategori, foto, deskripsi singkat, dan lokasi. Laporan langsung masuk antrean pemeriksaan."
            className="md:flex md:items-center md:gap-8"
            contentClassName="md:flex-[0_0_58%]"
          >
            <div aria-hidden="true" className="mt-6 min-w-0 flex-1 select-none md:mt-0">
              <div className="w-full rounded-xl border border-line bg-white p-4 md:-ml-6 md:w-[calc(100%+1.5rem)]">
                <div className="flex flex-col items-start gap-1 text-[11px] text-muted">
                  <span className="font-black text-emerald-900">Lokasi</span>
                  <span className="whitespace-nowrap">Kalimantan Tengah</span>
                </div>
                <div className="mt-3 grid gap-3">
                  <MockField label="Kategori bencana" value="Kebakaran hutan" />
                  <div className="flex items-center gap-2">
                    <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full border border-dashed border-emerald-500/40 bg-emerald-50 px-3 py-1 text-xs text-muted">
                      <UploadIcon width={12} height={12} className="shrink-0 text-emerald-700" />
                      <span className="truncate">Foto</span>
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ok-soft text-ok">
                    <CheckIcon width={16} height={16} />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[13px] font-bold">Laporan terkirim</span>
                    <span className="block text-[11px] text-muted">Menunggu verifikasi </span>
                  </span>
                </div>
              </div>
            </div>
          </FeatureCard>

          <FeatureCard
            icon={<PinIcon width={22} height={22} />}
            title="Lokasi saat ini."
            text="Pilih daerah dan tulis patokan, atau pakai lokasi anda saat ini."
          >
            <div aria-hidden="true" className="mt-5 grid select-none gap-3 rounded-xl bg-paper p-4">
              <MockField label="Provinsi" value="Kalimantan Tengah" />
              <MockField label="Alamat atau patokan" value="Jl. Merdeka, depan toko" />
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
