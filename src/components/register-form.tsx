"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { registerDemoAccount, startGoogleSignIn } from "@/lib/demo-auth";
import { AuthInput } from "./auth-input";
import { ArrowRightIcon, LockIcon, MailIcon, PhoneIcon, UserIcon } from "./icons";

type Errors = { name?: string; email?: string; phone?: string; password?: string };

export function RegisterForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const next: Errors = {};
    if (name.length < 2) next.name = "Isi nama lengkap Anda.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Isi alamat email yang valid.";
    if (phone.replace(/\D/g, "").length < 9 || phone.replace(/\D/g, "").length > 15) next.phone = "Isi nomor HP aktif yang valid (9–15 digit).";
    if (password.length < 8) next.password = "Kata sandi minimal 8 karakter.";
    setErrors(next);
    setMessage("");
    const first = (["name", "email", "phone", "password"] as const).find((k) => next[k]);
    if (first) return document.getElementById(first)?.focus();

    setPending(true);
    try {
      const res = await registerDemoAccount({ name, email, phone, password });
      if (res.ok) {
        setMessage(res.message);
        if (res.redirectToLogin) router.replace("/masuk");
        return;
      }
      setMessage(res.message);
    } catch {
      setMessage("Pendaftaran gagal diproses. Periksa koneksi atau coba lagi nanti.");
    } finally {
      setPending(false);
    }
  }

  async function onGoogleSignUp() {
    setPending(true);
    setMessage("");
    try {
      await startGoogleSignIn();
    } catch {
      setMessage("Pendaftaran Google belum dapat dimulai. Periksa konfigurasi Google pada Supabase Auth.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="register-form mt-8 grid gap-5">
      <AuthInput id="name" label="Nama lengkap" icon={UserIcon} autoComplete="name" placeholder="Nama lengkap" error={errors.name} />
      <AuthInput id="email" label="Email" icon={MailIcon} type="email" autoComplete="email" placeholder="email@contoh.com" error={errors.email} />
      <AuthInput id="phone" label="Nomor HP" icon={PhoneIcon} type="tel" autoComplete="tel" placeholder="08xxxxxxxxxx" error={errors.phone} extra={<span className="text-xs font-normal text-muted">Untuk menghubungi Anda</span>} />
      <AuthInput id="password" label="Kata sandi" icon={LockIcon} type="password" autoComplete="new-password" placeholder="Minimal 8 karakter" error={errors.password} />

      {message && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"><p>{message}</p>{message.startsWith("Email sudah terdaftar") && <Link href="/masuk" className="mt-2 inline-block font-bold text-brand-dark underline underline-offset-2">Masuk dengan email ini</Link>}</div>}

      <button
        type="submit" disabled={pending}
        className="flex h-14 items-center justify-center gap-2 rounded-full bg-ink font-bold text-white shadow-[0_14px_28px_-14px_rgba(16,39,92,0.7)] transition-colors hover:bg-brand-dark disabled:opacity-70"
      >
        {pending ? "Memproses…" : "Daftar"}
        {!pending && <ArrowRightIcon width={20} height={20} />}
      </button>

      <div className="register-google-group grid gap-3">
        <div className="flex items-center gap-3 text-xs font-semibold text-muted" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          <span>ATAU</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          onClick={() => void onGoogleSignUp()}
          disabled={pending}
          className="flex h-14 items-center justify-center gap-3 rounded-full border border-line bg-white font-bold text-ink transition-colors hover:bg-paper disabled:cursor-wait disabled:opacity-70"
        >
          <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.96 46.98 31.8 46.98 24.55Z" />
            <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
          </svg>
          {pending ? "Menghubungkan…" : "Daftar dengan Google"}
        </button>
      </div>

      <p className="text-center text-sm text-ink">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-bold text-brand-dark hover:underline">Masuk</Link>
      </p>
    </form>
  );
}
