import Link from "next/link";
import { ArrowRightIcon } from "./icons";
import { HeroIllustration } from "./hero-illustration";

export function Hero() {
  return (
    <section id="beranda" className="bg-linear-to-b from-paper to-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:gap-12 md:py-20 lg:grid-cols-[1fr_1.05fr]">
        <div className="relative z-10">
          <p className="inline-block rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand-dark">
            Aplikasi Pelaporan Kerusakan Fasilitas Umum
          </p>
          <h1 className="mt-5 text-2xl leading-[1.15] font-extrabold tracking-tight text-ink sm:text-3xl lg:text-[2.75rem]">
            <span className="block whitespace-nowrap">Menemukan Fasilitas</span>
            <span className="block whitespace-nowrap">Umum yang Rusak?</span>
            <span className="block whitespace-nowrap">Laporkan Sekarang!</span>
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-muted">
            Mudah, cepat, dan transparan. Bersama kita wujudkan kota yang lebih baik.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              href="/daftar"
              className="rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-dark"
            >
              Daftar
            </Link>
            <a
              href="#cara-kerja"
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand-dark hover:text-brand"
            >
              Lihat cara kerjanya
              <ArrowRightIcon width={16} height={16} />
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <HeroIllustration className="h-auto w-full" />
          <p className="pointer-events-none absolute top-[3%] right-[2%] w-40 -rotate-[8deg] text-right font-(family-name:--font-hand) text-[1.15rem] leading-[1.05] font-semibold text-ink sm:w-44 sm:text-[1.35rem]">
            Laporanmu berarti untuk kota kita!
          </p>
        </div>
      </div>
    </section>
  );
}
