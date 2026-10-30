"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Resident = {
  id: string;
  nama: string | null;
  email: string | null;
  created_at: string | null;
  is_active: boolean;
};

function formatJoinedDate(isoDate: string | null): string {
  if (!isoDate) return "-";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function AdminResidentsTable() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Semua Status");
  const [page, setPage] = useState(1);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadResidents() {
      try {
        const { data, error } = await getSupabaseClient()
          .from("profiles")
          .select("id, nama, email, created_at, is_active")
          .eq("role", "warga")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (active) {
          setResidents((data ?? []) as Resident[]);
          setLoadError("");
        }
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Data warga gagal dimuat.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadResidents();
    return () => { active = false; };
  }, []);

  const filteredResidents = useMemo(() => residents.filter((resident) => {
    const status = resident.is_active ? "Aktif" : "Nonaktif";
    const matchesSearch = `${resident.nama ?? ""} ${resident.email ?? ""}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesSearch && (filter === "Semua Status" || status === filter);
  }), [filter, query, residents]);
  const pageCount = Math.max(1, Math.ceil(filteredResidents.length / 5));
  const visibleResidents = filteredResidents.slice((page - 1) * 5, page * 5);

  async function setResidentStatus(resident: Resident) {
    const nextActive = !resident.is_active;
    setPendingId(resident.id);
    setActionError("");
    try {
      const { error } = await getSupabaseClient().rpc("admin_set_resident_active", {
        p_user_id: resident.id,
        p_is_active: nextActive,
      });
      if (error) throw error;
      setResidents((current) => current.map((item) => item.id === resident.id ? { ...item, is_active: nextActive } : item));
      setOpenActionId(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Status akun gagal diperbarui.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">Cari nama atau email</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-slate-400"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari nama atau email..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white" />
        </label>
        <select value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1); }} aria-label="Filter status" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-blue-400">
          <option>Semua Status</option><option>Aktif</option><option>Nonaktif</option>
        </select>
      </div>

      {loadError && <p role="alert" className="m-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Gagal memuat data warga dari database: {loadError}</p>}
      {actionError && <p role="alert" className="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:mx-5">Status akun gagal diperbarui: {actionError}</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="w-12 px-4 py-3 text-center">No</th><th className="px-4 py-3 font-extrabold">Nama</th><th className="px-4 py-3 font-extrabold">Email</th><th className="px-4 py-3 font-extrabold">Tanggal Daftar</th><th className="px-4 py-3 font-extrabold">Status</th><th className="px-4 py-3 text-right font-extrabold">Aksi</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">Memuat data warga…</td></tr>}
            {!loading && !loadError && visibleResidents.map((resident, index) => {
              const status = resident.is_active ? "Aktif" : "Nonaktif";
              return <tr key={resident.id} className="transition hover:bg-slate-50/70">
                <td className="px-4 py-3.5 text-center text-xs text-slate-400">{(page - 1) * 5 + index + 1}</td>
                <td className="px-4 py-3.5 font-bold text-[#102a61]">{resident.nama?.trim() || "Warga"}</td>
                <td className="px-4 py-3.5 text-slate-600">{resident.email || "-"}</td>
                <td className="px-4 py-3.5 text-slate-600">{formatJoinedDate(resident.created_at)}</td>
                <td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${resident.is_active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{status}</span></td>
                <td className="px-4 py-3.5 text-right"><div className="relative inline-block text-left">
                  <button type="button" aria-label={`Aksi untuk ${resident.nama || resident.email || "warga"}`} aria-expanded={openActionId === resident.id} onClick={() => setOpenActionId((current) => current === resident.id ? null : resident.id)} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50">•••</button>
                  {openActionId === resident.id && <div className="absolute right-0 z-10 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"><button type="button" disabled={pendingId === resident.id} onClick={() => void setResidentStatus(resident)} className={`w-full rounded-lg px-2.5 py-2 text-left text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 ${resident.is_active ? "text-rose-600" : "text-slate-700"}`}>{pendingId === resident.id ? "Menyimpan…" : resident.is_active ? "Nonaktifkan" : "Aktifkan"}</button></div>}
                </div></td>
              </tr>;
            })}
            {!loading && !loadError && visibleResidents.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">Tidak ada data warga yang cocok.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3.5 sm:px-5">
        <p className="text-xs text-slate-500">Menampilkan {filteredResidents.length ? (page - 1) * 5 + 1 : 0}–{Math.min(page * 5, filteredResidents.length)} dari {filteredResidents.length} data</p>
        <div className="flex items-center gap-1"><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} className="size-8 rounded-lg border border-slate-200 text-sm text-slate-500 hover:bg-slate-50" aria-label="Halaman sebelumnya">‹</button>{Array.from({ length: pageCount }, (_, index) => <button key={index} type="button" onClick={() => setPage(index + 1)} className={`size-8 rounded-lg text-xs font-bold ${page === index + 1 ? "bg-blue-700 text-white" : "text-slate-500 hover:bg-slate-50"}`}>{index + 1}</button>)}<button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="size-8 rounded-lg border border-slate-200 text-sm text-slate-500 hover:bg-slate-50" aria-label="Halaman berikutnya">›</button></div>
      </div>
      <p className="border-t border-slate-100 px-5 py-2.5 text-[11px] text-slate-400">Data warga diambil langsung dari database Supabase.</p>
    </section>
  );
}
