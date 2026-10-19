"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon, UserIcon } from "@/components/icons";
import { getDemoSession, signOutDemoAccount, updateDemoProfile } from "@/lib/demo-auth";

export function PortalProfile() {
  const router = useRouter();
  const [name, setName] = useState("Warga TEDUHI");
  const [email, setEmail] = useState("warga@example.test");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const session = getDemoSession();
    if (session) {
      setName(session.name);
      setEmail(session.email);
    }
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateDemoProfile({ name: name.trim(), email });
    setMessage("Nama akun demo diperbarui di tab browser ini. Perubahan belum dikirim ke server.");
  }

  function onSignOut() {
    signOutDemoAccount();
    router.replace("/masuk");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
      <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-5 sm:p-7">
        <div className="flex items-center gap-3 border-b border-line pb-5"><span className="grid size-12 place-items-center rounded-full bg-brand-soft text-brand-dark"><UserIcon width={23} height={23} /></span><div><h2 className="font-extrabold text-ink">Informasi akun</h2><p className="text-xs text-muted">Profil contoh, belum terhubung dengan akun warga</p></div></div>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-ink">Nama lengkap<input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-line px-3.5 py-3 font-normal outline-none focus:border-brand" /></label>
          <label className="grid gap-2 text-sm font-bold text-ink">Email <span className="text-xs font-normal text-muted">Tidak dapat diedit pada mode demo</span><input readOnly type="email" value={email} className="w-full rounded-xl border border-line bg-paper px-3.5 py-3 font-normal text-muted outline-none" /></label>
          <label className="grid gap-2 text-sm font-bold text-ink">Nomor telepon <span className="text-xs font-normal text-muted">Belum tersedia dari backend</span><input disabled placeholder="Belum tersedia" className="w-full cursor-not-allowed rounded-xl border border-line bg-paper px-3.5 py-3 font-normal text-muted" /></label>
          {message && <p role="status" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</p>}
          <button className="min-h-11 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-dark">Simpan nama lokal</button>
          <div className="mt-2 border-t border-line pt-5">
            <button type="button" onClick={onSignOut} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-50">
              <LogOutIcon width={18} height={18} /> Keluar dari akun demo
            </button>
            <p className="mt-2 text-xs text-muted">Sesi demo akan dihapus dari tab ini. Akun demo tetap tersimpan agar Anda dapat masuk lagi.</p>
          </div>
        </div>
      </form>
      <aside className="h-fit rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-extrabold text-amber-950">Mode demo lokal</h2><p className="mt-2 text-sm leading-relaxed text-amber-900">Keluar menghapus sesi demo di tab ini, tetapi bukan autentikasi backend. Halaman portal belum diproteksi dan informasi profil belum tersinkron ke server.</p></aside>
    </div>
  );
}