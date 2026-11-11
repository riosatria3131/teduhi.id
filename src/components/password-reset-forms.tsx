"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AuthInput } from "@/components/auth-input";
import { LockIcon, MailIcon } from "@/components/icons";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!EMAIL_PATTERN.test(email)) {
      setMessage("Masukkan alamat email yang valid.");
      return;
    }

    setPending(true);
    setMessage("");
    try {
      const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/atur-ulang-kata-sandi`,
      });
      if (error) throw error;
      setSent(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Email reset gagal dikirim. Coba lagi nanti.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="login-form mt-8 grid gap-5">
      <p className="text-sm leading-6 text-muted">Masukkan email akun Anda. Jika terdaftar, kami akan mengirim tautan untuk membuat kata sandi baru.</p>
      <AuthInput id="email" label="Email" icon={MailIcon} type="email" autoComplete="email" placeholder="email@contoh.com" />
      {message && <p role="alert" className="rounded-xl bg-warn-soft px-4 py-3 text-sm font-medium text-warn">{message}</p>}
      {sent && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">Jika email tersebut terdaftar, tautan reset kata sandi sudah dikirim. Periksa kotak masuk dan folder spam.</p>}
      <button type="submit" disabled={pending} className="flex h-14 items-center justify-center rounded-full bg-ink font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-70">
        {pending ? "Mengirim tautan…" : sent ? "Kirim ulang tautan" : "Kirim tautan reset"}
      </button>
      <p className="text-center text-sm text-ink">Ingat kata sandi? <Link href="/masuk" className="font-bold text-brand-dark hover:underline">Kembali masuk</Link></p>
    </form>
  );
}

export function UpdatePasswordForm() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabaseClient();
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && (event === "PASSWORD_RECOVERY" || session)) setRecoveryReady(true);
    });

    const callbackUrl = new URL(window.location.href);
    const providerError = callbackUrl.searchParams.get("error_description") ?? callbackUrl.searchParams.get("error");
    if (providerError) {
      setMessage("Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan reset baru.");
      setChecking(false);
    } else {
      void supabase.auth.getSession().then(({ data, error }) => {
        if (!active) return;
        if (error) setMessage("Sesi reset tidak dapat diverifikasi. Minta tautan reset baru.");
        setRecoveryReady(Boolean(data.session));
        setChecking(false);
      }).catch(() => {
        if (active) {
          setMessage("Sesi reset tidak dapat diverifikasi. Minta tautan reset baru.");
          setChecking(false);
        }
      });
    }

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");
    if (password.length < 8) {
      setMessage("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (password !== confirmation) {
      setMessage("Konfirmasi kata sandi tidak sama.");
      return;
    }

    setPending(true);
    setMessage("");
    try {
      const { error } = await getSupabaseClient().auth.updateUser({ password });
      if (error) throw error;
      setUpdated(true);
      void getSupabaseClient().auth.signOut();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kata sandi gagal diperbarui. Minta tautan reset baru.");
    } finally {
      setPending(false);
    }
  }

  if (updated) {
    return (
      <div className="mt-8 grid gap-5 text-center">
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-800">Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru.</p>
        <Link href="/masuk" className="flex h-14 items-center justify-center rounded-full bg-ink font-bold text-white transition-colors hover:bg-brand-dark">Ke halaman masuk</Link>
      </div>
    );
  }

  if (checking) {
    return <p role="status" className="mt-8 rounded-xl bg-paper px-4 py-3 text-sm text-muted">Memeriksa tautan reset…</p>;
  }

  if (!recoveryReady) {
    return (
      <div className="mt-8 grid gap-5">
        <p role="alert" className="rounded-xl bg-warn-soft px-4 py-3 text-sm font-medium text-warn">{message || "Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan reset baru."}</p>
        <Link href="/lupa-kata-sandi" className="text-center text-sm font-bold text-brand-dark hover:underline">Minta tautan reset baru</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="login-form mt-8 grid gap-5">
      <AuthInput id="password" label="Kata sandi baru" icon={LockIcon} type="password" autoComplete="new-password" placeholder="Minimal 8 karakter" />
      <AuthInput id="confirmation" label="Ulangi kata sandi baru" icon={LockIcon} type="password" autoComplete="new-password" placeholder="Ulangi kata sandi" />
      {message && <p role="alert" className="rounded-xl bg-warn-soft px-4 py-3 text-sm font-medium text-warn">{message}</p>}
      <button type="submit" disabled={pending} className="flex h-14 items-center justify-center rounded-full bg-ink font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-70">
        {pending ? "Menyimpan…" : "Simpan kata sandi baru"}
      </button>
      <p className="text-center text-sm text-ink"><button type="button" onClick={() => router.push("/masuk")} className="font-bold text-brand-dark hover:underline">Kembali masuk</button></p>
    </form>
  );
}
