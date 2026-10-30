"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeGoogleSignIn, getDemoDashboardPath } from "@/lib/demo-auth";

export default function GoogleAuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function finishSignIn() {
      const callbackUrl = new URL(window.location.href);
      const providerError = callbackUrl.searchParams.get("error_description") ?? callbackUrl.searchParams.get("error");
      if (providerError) {
        if (active) setMessage("Google membatalkan atau menolak proses masuk. Silakan coba lagi.");
        return;
      }

      try {
        const result = await completeGoogleSignIn();
        if (!active) return;
        if (!result.ok) {
          setMessage(result.message);
          return;
        }
        router.replace(getDemoDashboardPath(result.role));
      } catch {
        if (active) setMessage("Login Google gagal diselesaikan. Silakan coba lagi.");
      }
    }

    void finishSignIn();
    return () => { active = false; };
  }, [router]);

  return (
    <main className="grid min-h-[50vh] place-items-center px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <h1 className="text-xl font-extrabold text-[#102a61]">{message ? "Login belum berhasil" : "Menghubungkan akun Google…"}</h1>
        {message ? (
          <>
            <p role="alert" className="mt-3 text-sm leading-relaxed text-slate-600">{message}</p>
            <Link href="/masuk" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#102a61] px-5 text-sm font-bold text-white hover:bg-blue-800">Kembali ke halaman masuk</Link>
          </>
        ) : <p role="status" className="mt-3 text-sm text-slate-500">Mohon tunggu, sesi Anda sedang disiapkan.</p>}
      </section>
    </main>
  );
}