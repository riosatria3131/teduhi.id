import Link from "next/link";
import { ArrowRightIcon, UserIcon } from "./icons";

export function Cta() {
  return (
    <section className="mx-auto mt-4 mb-16 w-full max-w-6xl px-6">
      <div className="flex flex-col items-start justify-between gap-7 rounded-2xl bg-brand px-6 py-8 text-white sm:px-8 md:flex-row md:items-center md:px-10 md:py-9">
        <div>
          <h2 className="max-w-xl text-base font-extrabold tracking-tight text-balance">
            Melihat sesuatu yang rusak? Laporkan dalam dua menit.
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/85">Satu laporan Anda bisa menyelamatkan pengguna jalan lain.</p>
        </div>
        <Link href="/masuk" className="inline-flex shrink-0 items-center gap-3 rounded-lg bg-white px-5 py-2.5 text-xs font-semibold text-brand-dark hover:bg-brand-soft">
          <UserIcon width={18} height={18} />
          Masuk ke Akun
          <ArrowRightIcon width={18} height={18} />
        </Link>
      </div>
    </section>
  );
}
