"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { clearDemoSession } from "@/lib/demo-auth";
import { getSupabaseClient } from "@/lib/supabaseClient";

export function PortalAccessGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let checking = false;
    let redirecting = false;
    async function verifyAccess() {
      if (checking || redirecting) return;
      checking = true;
      try {
        const supabase = getSupabaseClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!active) return;
        if (userError || !user) {
          redirecting = true;
          clearDemoSession();
          router.replace("/masuk");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_active,role")
          .eq("id", user.id)
          .single();
        if (!active) return;
        if (profileError || !profile) {
          setError("Sesi akun tidak dapat diverifikasi. Silakan masuk kembali.");
          return;
        }
        if (profile.is_active === false) {
          redirecting = true;
          await supabase.auth.signOut();
          clearDemoSession();
          router.replace("/masuk?status=nonaktif");
          return;
        }
        setError("");
        setAllowed(true);
      } finally {
        checking = false;
      }
    }

    void verifyAccess().catch(() => {
      if (active) setError("Sesi akun tidak dapat diverifikasi. Periksa koneksi lalu coba lagi.");
    });
    const interval = window.setInterval(() => {
      void verifyAccess().catch(() => {
        if (active) setError("Sesi akun tidak dapat diverifikasi. Periksa koneksi lalu coba lagi.");
      });
    }, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [router]);

  if (error) return <main className="mx-auto mt-12 max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800" role="alert">{error}</main>;
  if (!allowed) return <div className="grid min-h-[50vh] place-items-center text-sm text-slate-500" role="status">Memeriksa status akun…</div>;
  return children;
}
