"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { getSupabaseClient } from "@/lib/supabaseClient";

type CategoryRow = { id: string; name: string; icon: string; status: string; reportCount: number };

export function AdminCategoriesManager() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📍");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function refreshCategories() {
    const supabase = getSupabaseClient();
    const { data, error: categoryError } = await supabase
      .from("categories")
      .select("id, name, icon, status")
      .order("name");
    if (categoryError) throw categoryError;

    const categoryRows = (data ?? []) as Array<{ id: string | number; name: string; icon?: string | null; status?: string | null }>;
    const counts = await Promise.all(categoryRows.map(async (category) => {
      const { count, error: countError } = await supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("category", category.name);
      if (countError) throw countError;
      return [String(category.id), count ?? 0] as const;
    }));
    const countById = Object.fromEntries(counts);
    setCategories(categoryRows.map((category) => ({
      id: String(category.id),
      name: category.name,
      icon: category.icon || "📍",
      status: category.status || "Aktif",
      reportCount: countById[String(category.id)] ?? 0,
    })));
    setError("");
  }

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void refreshCategories().catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Kategori gagal dimuat.");
      }).finally(() => {
        if (active) setLoading(false);
      });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    const { error: insertError } = await getSupabaseClient().from("categories").insert({ name: name.trim(), icon, status: "Aktif" });
    if (insertError) {
      setError(insertError.message);
      setPending(false);
      return;
    }
    try {
      await refreshCategories();
      setName("");
      setIcon("📍");
      setShowForm(false);
      setNotice("Kategori berhasil ditambahkan.");
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Kategori ditambahkan tetapi daftar gagal dimuat ulang.");
    } finally {
      setPending(false);
    }
  }

  const visibleCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(query.toLowerCase())
    && (statusFilter === "Semua Status" || category.status === statusFilter),
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <label className="relative block w-full sm:max-w-sm"><span className="sr-only">Cari kategori</span><SearchIcon width={17} height={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari kategori..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white" /></label>
        <div className="flex flex-wrap items-center gap-2"><select aria-label="Filter status kategori" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600"><option>Semua Status</option><option>Aktif</option><option>Nonaktif</option></select><button type="button" onClick={() => setShowForm((current) => !current)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800"><PlusIcon width={17} height={17} />Tambah Kategori</button></div>
      </div>
      {showForm && <form onSubmit={addCategory} className="grid gap-3 border-b border-blue-100 bg-blue-50/50 p-4 sm:grid-cols-[1fr_120px_auto] sm:items-end"><label className="grid gap-1 text-xs font-bold text-slate-600">Nama kategori<input required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal" placeholder="Contoh: Jalan & Infrastruktur" /></label><label className="grid gap-1 text-xs font-bold text-slate-600">Ikon<input required maxLength={12} value={icon} onChange={(event) => setIcon(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm" /></label><button disabled={pending} className="h-10 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white disabled:opacity-60">{pending ? "Menyimpan…" : "Simpan"}</button></form>}
      {error && <p role="alert" className="m-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{loading ? "Kategori atau jumlah laporan gagal dimuat." : "Perubahan kategori gagal."} {error}</p>}
      {notice && <p role="status" className="m-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
      <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 text-center">No</th><th className="px-4 py-3">Nama Kategori</th><th className="px-4 py-3">Ikon</th><th className="px-4 py-3">Jumlah Laporan</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleCategories.map((category, index) => <tr key={category.id}><td className="px-4 py-3.5 text-center text-xs text-slate-400">{index + 1}</td><td className="px-4 py-3.5 font-bold text-[#102a61]">{category.name}</td><td className="px-4 py-3.5">{category.icon}</td><td className="px-4 py-3.5 text-slate-600">{category.reportCount}</td><td className="px-4 py-3.5"><span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">{category.status}</span></td></tr>)}{visibleCategories.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">{loading ? "Memuat kategori…" : "Tidak ada kategori yang cocok."}</td></tr>}</tbody></table></div>
      <p className="border-t border-slate-100 px-5 py-2.5 text-[11px] text-slate-400">Kategori dan jumlah laporan diambil dari Supabase.</p>
    </section>
  );
}
