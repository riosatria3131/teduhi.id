"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { registerDemoAccount } from "@/lib/demo-auth";
import { AuthInput } from "./auth-input";
import { ArrowRightIcon, LockIcon, MailIcon, UserIcon } from "./icons";

type Errors = { name?: string; email?: string; password?: string };

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
    const password = String(data.get("password") ?? "");

    const next: Errors = {};
    if (name.length < 2) next.name = "Isi nama lengkap Anda.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Isi alamat email yang valid.";
    if (password.length < 8) next.password = "Kata sandi minimal 8 karakter.";
    setErrors(next);
    setMessage("");
    const first = (["name", "email", "password"] as const).find((k) => next[k]);
    if (first) return document.getElementById(first)?.focus();

    setPending(true);
    try {
      const res = await registerDemoAccount({ name, email, password });
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

  return (
    <form onSubmit={onSubmit} noValidate className="register-form mt-8 grid gap-5">
      <AuthInput id="name" label="Nama lengkap" icon={UserIcon} autoComplete="name" placeholder="Nama lengkap" error={errors.name} />
      <AuthInput id="email" label="Email" icon={MailIcon} type="email" autoComplete="email" placeholder="email@contoh.com" error={errors.email} />
      <AuthInput id="password" label="Kata sandi" icon={LockIcon} type="password" autoComplete="new-password" placeholder="Minimal 8 karakter" error={errors.password} />

      {message && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"><p>{message}</p>{message.startsWith("Email sudah terdaftar") && <Link href="/masuk" className="mt-2 inline-block font-bold text-brand-dark underline underline-offset-2">Masuk dengan email ini</Link>}</div>}

      <button
        type="submit" disabled={pending}
        className="flex h-14 items-center justify-center gap-2 rounded-full bg-ink font-bold text-white shadow-[0_14px_28px_-14px_rgba(16,39,92,0.7)] transition-colors hover:bg-brand-dark disabled:opacity-70"
      >
        {pending ? "Memproses…" : "Daftar"}
        {!pending && <ArrowRightIcon width={20} height={20} />}
      </button>

      <p className="text-center text-sm text-ink">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-bold text-brand-dark hover:underline">Masuk</Link>
      </p>
    </form>
  );
}
