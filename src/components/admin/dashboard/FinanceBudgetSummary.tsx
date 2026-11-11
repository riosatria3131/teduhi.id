"use client";

import { useEffect, useMemo, useState } from "react";
import { getBudgetAllocations, subscribeToBudgetChanges, type BudgetAllocation } from "@/lib/bpdlh-budget-store";

const amountFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

function formatAmount(amount: number) {
  if (amount >= 1_000_000_000) return `Rp ${amountFormat.format(amount / 1_000_000_000)} M`;
  if (amount >= 1_000_000) return `Rp ${amountFormat.format(amount / 1_000_000)} jt`;
  return `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(amount)}`;
}

const metrics = [
  { key: "allocated", label: "Dana yang dialokasikan", description: "Total pagu seluruh pos anggaran", color: "bg-blue-600", text: "text-blue-700", icon: "Rp" },
  { key: "used", label: "Dana yang telah digunakan", description: "Akumulasi realisasi dari seluruh pos", color: "bg-orange-500", text: "text-orange-700", icon: "↗" },
  { key: "unused", label: "Dana yang belum digunakan", description: "Sisa pagu dari seluruh pos anggaran", color: "bg-emerald-500", text: "text-emerald-700", icon: "✓" },
] as const;

export function FinanceBudgetSummary() {
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const data = await getBudgetAllocations();
        if (!active) return;
        setAllocations(data);
        setUpdatedAt(new Date());
        setError("");
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Ringkasan dana gagal dimuat dari Supabase.");
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
    allocated: result.allocated + allocation.budget,
    used: result.used + allocation.spent,
  }), { allocated: 0, used: 0 }), [allocations]);
  const values = { ...totals, unused: totals.allocated - totals.used };

  return (
    <section className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)] sm:p-5">
      <div>
        <h2 className="text-sm font-extrabold text-[#102a61]">Ringkasan Dana Anggaran</h2>
        <p className="mt-0.5 text-[10px] text-slate-500">Rekap langsung dari pos anggaran BPDLH</p>
      </div>

      {error ? <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-3 text-xs text-rose-800">Ringkasan dana gagal dimuat dari Supabase. Pastikan migrasi akses ringkasan sudah dijalankan. {error}</p> : (
        <div className="mt-4 grid flex-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {metrics.map((metric) => (
            <article key={metric.key} className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:flex-col sm:items-start sm:justify-start sm:gap-2.5 sm:p-3.5">
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold text-white sm:size-10 ${metric.color}`} aria-hidden="true">{metric.icon}</span>
              <div className="min-w-0 flex-1 sm:w-full sm:flex-none">
                <p className="line-clamp-2 text-[10px] font-semibold leading-snug text-slate-500">{metric.label}</p>
                <p className={`mt-1 truncate text-lg font-extrabold tracking-tight sm:text-xl ${metric.text}`}>{loading ? "…" : formatAmount(values[metric.key])}</p>
                <p className="mt-1 line-clamp-2 text-[9px] leading-snug text-slate-400">{metric.description}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[9px] text-slate-400">
        <span>{error ? "Koneksi database bermasalah." : updatedAt ? `Supabase · diperbarui ${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(updatedAt)}` : "Menghubungkan ke Supabase…"}</span>
        <span>{allocations.length} pos anggaran · sinkron realtime</span>
      </div>
    </section>
  );
}
