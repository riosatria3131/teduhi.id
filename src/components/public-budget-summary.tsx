"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type PublicBudgetSummaryData = {
  allocated_total: number | string;
  spent_total: number | string;
  updated_at: string;
};

const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const formatMoney = (value: number) => money.format(value).replace("Rp", "Rp ");

export function PublicBudgetSummary() {
  const [summary, setSummary] = useState<PublicBudgetSummaryData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const { data, error: queryError } = await getSupabaseClient()
        .from("bpdlh_public_budget_summary")
        .select("allocated_total, spent_total, updated_at")
        .eq("singleton", true)
        .maybeSingle();
      if (!active) return;
      if (queryError) {
        setError(queryError.message);
        return;
      }
      setSummary(data as PublicBudgetSummaryData | null);
      setError("");
    };

    void refresh();
    const poll = window.setInterval(() => void refresh(), 30000);
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`public-budget-summary-${crypto.randomUUID()}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "bpdlh_public_budget_summary",
        filter: "singleton=eq.true",
      }, () => void refresh())
      .subscribe();

    return () => {
      active = false;
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, []);

  const allocated = Number(summary?.allocated_total ?? 0);
  const used = Number(summary?.spent_total ?? 0);
  const remaining = Math.max(0, allocated - used);
  const updatedAt = summary?.updated_at ? new Date(summary.updated_at) : null;

  return (
    <section aria-labelledby="public-budget-title" className="mt-8 rounded-3xl border border-emerald-100 bg-white/90 p-5 shadow-[0_12px_34px_-24px_rgba(16,39,92,0.28)] backdrop-blur-sm sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">Transparansi bantuan</p>
          <h2 id="public-budget-title" className="mt-1 text-xl font-extrabold text-[#102a61] sm:text-2xl">Ringkasan Dana Anggaran</h2>
          <p className="mt-1 text-sm text-muted">Ringkasan penggunaan anggaran BPDLH yang diperbarui otomatis.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-800">Data publik · realtime</span>
      </div>

      {error ? <p role="status" className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Ringkasan dana belum dapat dimuat. Coba muat ulang halaman.</p> : (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4"><p className="text-xs font-semibold text-slate-600">Dana dialokasikan</p><p className="mt-2 text-xl font-extrabold text-blue-800">{summary ? formatMoney(allocated) : "Memuat…"}</p></article>
          <article className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4"><p className="text-xs font-semibold text-slate-600">Dana digunakan</p><p className="mt-2 text-xl font-extrabold text-orange-700">{summary ? formatMoney(used) : "Memuat…"}</p></article>
          <article className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><p className="text-xs font-semibold text-slate-600">Sisa anggaran</p><p className="mt-2 text-xl font-extrabold text-emerald-800">{summary ? formatMoney(remaining) : "Memuat…"}</p></article>
        </div>
      )}
      <p className="mt-4 border-t border-slate-100 pt-3 text-[10px] text-slate-400">{updatedAt && Number.isFinite(updatedAt.getTime()) ? `Pembaruan terakhir ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(updatedAt)}` : "Angka ditampilkan sebagai total agregat; rincian pos dan transaksi tidak dipublikasikan."}</p>
    </section>
  );
}
