"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/icons";
import { AuthPanel, Brand } from "@/components/auth-panel";

/**
 * Layout bersama untuk /masuk dan /daftar.
 * Panel kiri, tombol kembali, dan footer tetap di tempat saat berpindah
 * halaman. Hanya isi `children` (judul + form) yang berganti.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/masuk";
  const isAuthPage = isLoginPage || pathname === "/daftar";

  return (
    <main
      className={
        isAuthPage
          ? `${isLoginPage ? "login-page" : "register-page"} flex min-h-dvh justify-center bg-[#e5e7eb] lg:h-dvh lg:overflow-hidden`
          : "grid min-h-screen lg:grid-cols-2"
      }
    >
      {!isAuthPage && <AuthPanel />}

      <section className={`flex w-full justify-center px-5 sm:px-10 ${isAuthPage ? "items-center py-5 sm:py-8" : "items-start py-10 lg:py-16"}`}>
          <div className={`w-full ${isAuthPage ? "max-w-lg" : "max-w-[28rem]"}`}>
          {isAuthPage ? (
            <div className="mb-8">
              <Brand />
            </div>
          ) : null}

          <div
            className={
              isAuthPage
                ? `${isLoginPage ? "login-card" : "register-card"} rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.45)] sm:rounded-3xl sm:p-10`
                : ""
            }
          >
            <Link
              href="/#beranda"
              className="inline-flex items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-ink"
            >
              <ArrowLeftIcon width={18} height={18} />
              Kembali ke beranda
            </Link>

            {children}
          </div>

        </div>
      </section>
    </main>
  );
}
