import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/icons";
import { AuthPanel, Brand } from "@/components/auth-panel";

/**
 * Layout bersama untuk /masuk dan /daftar.
 * Panel kiri, tombol kembali, dan footer tetap di tempat saat berpindah
 * halaman. Hanya isi `children` (judul + form) yang berganti.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <AuthPanel />

      <section className="flex items-start justify-center px-5 py-10 sm:px-10 lg:py-16">
        <div className="w-full max-w-[28rem]">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>

          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink">
            <ArrowLeftIcon width={18} height={18} />
            Kembali ke beranda
          </Link>

          {children}

          <p className="mt-10 border-t border-line pt-6 text-center text-xs text-muted">
            TEDUHI · Suara warga, kota lebih baik
          </p>
        </div>
      </section>
    </main>
  );
}
