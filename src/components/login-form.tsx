"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInDemoAccount, startGoogleSignIn } from "@/lib/demo-auth";
import { AuthInput } from "./auth-input";
import { LockIcon, LoginIcon, MailIcon } from "./icons";

type Errors = { identifier?: string; password?: string };

export function LoginForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("status") === "nonaktif") {
      const timer = window.setTimeout(() => setMessage("akun anda telah di nonaktifkan karena melanggar ketentuan"), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const identifier = String(data.get("identifier") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const next: Errors = {};
    if (!identifier) next.identifier = "Isi email atau username Anda.";
    if (password.length < 8) next.password = "Kata sandi minimal 8 karakter.";
    setErrors(next);
    setMessage("");
    if (next.identifier) return document.getElementById("identifier")?.focus();
    if (next.password) return document.getElementById("password")?.focus();

    setPending(true);
    try {
      const res = await signInDemoAccount({ identifier, password });
      if (res.ok) {
        const role = res.role?.toLowerCase().replace(/[\s-]+/g, "_");
        const destination = role === "admin_bpdlh" || role === "admin_keuangan" || role === "bpdlh"
          ? "/bpdlh"
          : ["admin", "administrator", "admin_utama", "admin_bpbd", "bpbd"].includes(role ?? "")
            ? "/admin"
            : "/portal";
        router.replace(destination);
        return;
      }
      setMessage(res.message);
    } catch {
      setMessage("Tidak dapat masuk saat ini. Periksa koneksi atau coba lagi nanti.");
    } finally {
      setPending(false);
    }
  }

  async function onGoogleSignIn() {
    setPending(true);
    setMessage("");
    try {
      await startGoogleSignIn();
    } catch {
      setMessage("Login Google belum dapat dimulai. Periksa konfigurasi Google pada Supabase Auth.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="login-form mt-8 grid gap-5">
      <AuthInput
        id="identifier" label="Email" icon={MailIcon} autoComplete="email"
        placeholder="email@contoh.com" error={errors.identifier}
      />
      <AuthInput
        id="password" label="Kata Sandi" icon={LockIcon} type="password" autoComplete="current-password"
        placeholder="Minimal 8 karakter" error={errors.password}
        extra={<Link href="#" className="text-sm font-bold text-brand-dark hover:underline">Lupa kata sandi?</Link>}
      />

      {message && <p role="status" className="rounded-xl bg-warn-soft px-4 py-3 text-sm font-medium text-warn">{message}</p>}

      <button
        type="submit" disabled={pending}
        className="flex h-14 items-center justify-center gap-2 rounded-full bg-ink font-bold text-white shadow-[0_14px_28px_-14px_rgba(16,39,92,0.7)] transition-colors hover:bg-brand-dark disabled:opacity-70"
      >
        {pending ? "Memproses…" : "Masuk"}
        {!pending && <LoginIcon width={20} height={20} />}
      </button>

      <div className="flex items-center gap-3 text-xs font-semibold text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span>ATAU</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        onClick={() => void onGoogleSignIn()}
        disabled={pending}
        className="flex h-14 items-center justify-center gap-3 rounded-full border border-line bg-white font-bold text-ink transition-colors hover:bg-paper disabled:cursor-wait disabled:opacity-70"
      >
        <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.96 46.98 31.8 46.98 24.55Z" />
          <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z" transform="translate(0 0)" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
        </svg>
        {pending ? "Menghubungkan…" : "Masuk dengan Google"}
      </button>

      <p className="text-center text-sm text-ink">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-bold text-brand-dark hover:underline">Daftar</Link>
      </p>
    </form>
  );
}
