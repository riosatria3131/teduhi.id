import Link from "next/link";
import { CameraIcon, CheckIcon, LogoMark, SparkleIcon } from "./icons";

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <LogoMark size={40} />
      <span className="leading-tight">
        <span className="block text-xl font-extrabold tracking-tight text-ink">TEDUHI</span>
        <span className="block text-[11px] text-muted">Suara Warga, Kota Lebih Baik</span>
      </span>
    </Link>
  );
}

/** Panel kiri halaman masuk dan daftar. Tetap sama di kedua halaman. */
export function AuthPanel() {
  return (
    <section className="relative hidden overflow-hidden bg-linear-to-br from-[#e3f1fb] via-[#f3f8fe] to-white lg:block">
      <div aria-hidden="true" className="absolute -right-32 -bottom-40 size-[34rem] rounded-full border border-brand/10" />
      <div aria-hidden="true" className="absolute -right-52 -bottom-56 size-[40rem] rounded-full border border-brand/10" />

      <div className="relative flex h-full flex-col justify-between px-14 py-12 xl:px-16">
        <Brand />

        <div className="max-w-xl py-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-brand-dark">
            <SparkleIcon width={16} height={16} />
            Aplikasi pelaporan fasilitas umum
          </p>
          <h1 className="mt-8 text-5xl leading-[1.02] font-extrabold tracking-[-0.04em] text-ink xl:text-[4.25rem]">
            Kota lebih baik, mulai dari satu laporan.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Laporkan kerusakan fasilitas umum, lalu pantau perbaikannya dari satu tempat.
          </p>

          <div className="mt-10 max-w-md rounded-3xl border border-line bg-white p-3 shadow-[0_20px_50px_-30px_rgba(16,39,92,0.4)]">
            <div className="flex items-center gap-3 rounded-2xl bg-night px-4 py-4 text-white">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mint/90 text-night">
                <CameraIcon width={20} height={20} />
              </span>
              <span className="leading-tight">
                <span className="block text-[11px] font-extrabold tracking-[0.14em] text-mint uppercase">Kirim laporan</span>
                <span className="mt-1 block font-bold">“Jalan berlubang di Jl. Merdeka.”</span>
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3 rounded-2xl bg-paper px-4 py-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ok-soft text-ok">
                <CheckIcon width={20} height={20} />
              </span>
              <span className="leading-tight">
                <span className="block font-bold text-ink">Laporan siap diperiksa</span>
                <span className="text-xs text-muted">Foto dan lokasi sudah diterima</span>
              </span>
            </div>
          </div>
        </div>

        <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-semibold text-ink">
          {["Cukup foto dan lokasi", "Pantau status sampai selesai"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <CheckIcon width={16} height={16} className="text-brand" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
