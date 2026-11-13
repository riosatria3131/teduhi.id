"use client";

import { useEffect, useMemo, useState } from "react";
import { getBudgetAllocations, getBudgetPayouts, subscribeToBudgetChanges, type BudgetAllocation, type BudgetPayout } from "@/lib/bpdlh-budget-store";

const amountFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
const percentFormat = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function formatAmount(amount: number) {
  if (amount >= 1_000_000_000) return `Rp ${amountFormat.format(amount / 1_000_000_000)} M`;
  if (amount >= 1_000_000) return `Rp ${amountFormat.format(amount / 1_000_000)} jt`;
  return `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(amount)}`;
}

export function BudgetOverview() {
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [payouts, setPayouts] = useState<BudgetPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const [nextAllocations, nextPayouts] = await Promise.all([getBudgetAllocations(), getBudgetPayouts()]);
        if (!active) return;
        setAllocations(nextAllocations);
        setPayouts(nextPayouts);
        setUpdatedAt(new Date());
        setError("");
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Ringkasan anggaran gagal dimuat dari Supabase.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void refresh();
    const poll = window.setInterval(() => void refresh(), 30000);
    const unsubscribe = subscribeToBudgetChanges(() => void refresh());
    return () => {
      active = false;
      window.clearInterval(poll);
      unsubscribe();
    };
  }, []);

  const totals = useMemo(() => allocations.reduce((result, allocation) => ({
    budget: result.budget + allocation.budget,
    spent: result.spent + allocation.spent,
  }), { budget: 0, spent: 0 }), [allocations]);
  const remaining = totals.budget - totals.spent;
  const realizationRate = totals.budget > 0 ? (totals.spent / totals.budget) * 100 : 0;
  const years = useMemo(() => {
    const thisYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, index) => thisYear - 4 + index);
  }, []);
  const yearlyPayouts = useMemo(() => years.map((year) => ({
    year,
    amount: payouts.reduce((sum, payout) => {
      const payoutYear = new Date(payout.createdAt).getFullYear();
      return payoutYear === year ? sum + payout.amount : sum;
    }, 0),
  })), [payouts, years]);
  const maxYearlyPayout = Math.max(1, ...yearlyPayouts.map((item) => item.amount));

  return (
    <>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">Ringkasan tidak dapat dimuat dari Supabase. Pastikan migrasi anggaran sudah dijalankan dan akun memiliki role BPDLH. {error}</p>}
      <section aria-label="Ringkasan anggaran" className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)] sm:p-5">
          <p className="text-xs font-bold text-slate-500">Likuiditas Siap Pakai</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#102a61]">{loading ? "…" : formatAmount(remaining)}</p>
          <p className="mt-2 text-xs font-semibold text-emerald-700">Sisa dari pagu anggaran aktif</p>
          <p className="mt-1 text-[10px] text-slate-400">Total pagu {formatAmount(totals.budget)} · {allocations.length} pos</p>
        </article>
        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)] sm:p-5">
          <p className="text-xs font-bold text-slate-500">Realisasi Anggaran</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#102a61]">{loading ? "…" : `${percentFormat.format(realizationRate)}%`}</p>
          <p className="mt-2 text-xs font-semibold text-emerald-700">{formatAmount(totals.spent)} telah direalisasikan</p>
          <p className="mt-1 text-[10px] text-slate-400">Dihitung dari realisasi ÷ total pagu aktif</p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div><h2 className="text-sm font-extrabold text-[#102a61]">Tren pencairan anggaran</h2><p className="mt-1 text-[10px] text-slate-500">Total transaksi pencairan yang tercatat per tahun</p></div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700">Pagu aktif: {formatAmount(totals.budget)}</span>
        </div>
        <div className="mt-5 grid grid-cols-5 items-end gap-3 sm:gap-6" aria-label="Grafik total pencairan anggaran per tahun">
          {yearlyPayouts.map((item) => {
            const height = item.amount > 0 ? Math.max(4, (item.amount / maxYearlyPayout) * 100) : 0;
            return <div key={item.year} className="grid justify-items-center gap-2">
              <span className="text-center text-[10px] font-bold text-slate-600">{formatAmount(item.amount)}</span>
              <div className="flex h-36 w-full max-w-16 items-end overflow-hidden rounded-t-lg bg-slate-100">
                <div className="w-full rounded-t-lg bg-blue-600" style={{ height: `${height}%` }} aria-label={`${item.year}: ${formatAmount(item.amount)}`} />
              </div>
              <span className="text-[10px] font-semibold text-slate-500">{item.year}</span>
            </div>;
          })}
        </div>
        {!loading && payouts.length === 0 && <p className="mt-3 text-center text-[10px] text-slate-500">Belum ada transaksi pencairan. Grafik akan terisi setelah pencairan dicatat.</p>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[9px] text-slate-400">
          <span>{error ? "Koneksi database bermasalah." : updatedAt ? `Diperbarui ${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(updatedAt)}` : "Menghubungkan ke Supabase…"}</span>
          <span>Sinkron otomatis saat data berubah</span>
        </div>
      </section>
    </>
  );
}
