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
    const timer = window.setTimeout(() => {
      const session = getDemoSession();
      if (!session) return;
      setName(session.name);
      setEmail(session.email);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await updateDemoProfile({ name: name.trim(), email });
      setMessage("Profil berhasil diperbarui.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profil gagal diperbarui. Silakan coba lagi.");
    }
  }

  async function onSignOut() {
    try {
      await signOutDemoAccount();
      router.replace("/masuk");
    } catch {
      setMessage("Gagal keluar dari akun. Periksa koneksi lalu coba lagi.");
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
      <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-5 sm:p-7">
        <div className="flex items-center gap-3 border-b border-line pb-5"><span className="grid size-12 place-items-center rounded-full bg-brand-soft text-brand-dark"><UserIcon width={23} height={23} /></span><div><h2 className="font-extrabold text-ink">Informasi akun</h2><p className="text-xs text-muted">Profil akun warga Anda</p></div></div>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-ink">Nama lengkap<input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-line px-3.5 py-3 font-normal outline-none focus:border-brand" /></label>
          <label className="grid gap-2 text-sm font-bold text-ink">Email <span className="text-xs font-normal text-muted">Tidak dapat diedit pada mode demo</span><input readOnly type="email" value={email} className="w-full rounded-xl border border-line bg-paper px-3.5 py-3 font-normal text-muted outline-none" /></label>
          {message && <p role="status" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</p>}
          <button className="min-h-11 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-dark">Simpan perubahan</button>
          <div className="mt-2 border-t border-line pt-5">
            <button type="button" onClick={() => void onSignOut()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-50">
              <LogOutIcon width={18} height={18} /> Keluar dari akun
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}