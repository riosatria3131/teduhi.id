"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInDemoAccount } from "@/lib/demo-auth";
import { AuthInput } from "./auth-input";
import { LockIcon, LoginIcon, MailIcon } from "./icons";

type Errors = { identifier?: string; password?: string };

export function LoginForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

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
        router.replace("/portal");
        return;
      }
      setMessage(res.message);
    } catch {
      setMessage("Tidak dapat masuk saat ini. Periksa koneksi atau coba lagi nanti.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-5">
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">Mode demo lokal: daftar dahulu di tab ini, lalu masuk. Ini bukan autentikasi backend dan tidak melindungi halaman portal.</p>
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

      <p className="text-center text-sm text-ink">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-bold text-brand-dark hover:underline">Daftar</Link>
      </p>
    </form>
  );
}
