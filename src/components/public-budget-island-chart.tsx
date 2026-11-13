"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { INDONESIAN_ISLANDS } from "@/lib/admin/island-region";

const COLORS = ["#3568d4", "#e33d1c", "#ff9800", "#10951f", "#7954b8"];
const MONEY_FORMAT = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
const ISLANDS = [...INDONESIAN_ISLANDS, "Tidak terpetakan"] as const;
type Island = (typeof ISLANDS)[number];
type UsageRecord = { period_type: "monthly" | "yearly"; period_start: string; island: Island; spent_total: number | string; updated_at: string };
type UsageSlice = { label: Island; value: number; color: string };
const MONTHS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1).padStart(2, "0"),
  label: new Intl.DateTimeFormat("id-ID", { month: "long" }).format(new Date(2026, index, 1)),
}));

function formatAmount(amount: number) {
  if (amount >= 1_000_000_000) return `Rp ${MONEY_FORMAT.format(amount / 1_000_000_000)} M`;
  if (amount >= 1_000_000) return `Rp ${MONEY_FORMAT.format(amount / 1_000_000)} jt`;
  return `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(amount)}`;
}

export function PublicBudgetIslandChart() {
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [periodType, setPeriodType] = useState<"monthly" | "yearly">("monthly");
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [selectedIsland, setSelectedIsland] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;
    let refreshInFlight = false;
    let refreshRequested = false;
    let refreshTimer: number | null = null;
    const refresh = async () => {
      if (refreshInFlight) {
        refreshRequested = true;
        return;
      }
      refreshInFlight = true;
      try {
        const { data, error: queryError } = await getSupabaseClient()
          .from("bpdlh_public_budget_period_usage")
          .select("period_type, period_start, island, spent_total, updated_at");
        if (!active) return;
        if (queryError) {
          setError(queryError.message);
          setLoading(false);
          return;
        }
        setUsageRecords((data ?? []) as UsageRecord[]);
        const mostRecent = (data ?? []).reduce<Date | null>((latest, row) => {
          const date = new Date(row.updated_at);
          return Number.isFinite(date.getTime()) && (!latest || date > latest) ? date : latest;
        }, null);
        setUpdatedAt(mostRecent);
        setError("");
        setLoading(false);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Data penggunaan dana gagal dimuat.");
          setLoading(false);
        }
      } finally {
        refreshInFlight = false;
        if (active && refreshRequested) {
          refreshRequested = false;
          void refresh();
        }
      }
    };
    const scheduleRefresh = () => {
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        refreshTimer = null;
        void refresh();
      }, 150);
    };

    void refresh();
    const poll = window.setInterval(() => void refresh(), 30000);
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`public-budget-island-usage-${crypto.randomUUID()}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "bpdlh_public_budget_period_usage",
      }, scheduleRefresh)
      .subscribe();

    return () => {
      active = false;
      window.clearInterval(poll);
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, []);

  const years = useMemo(() => [...new Set([
    new Date().getFullYear(),
    ...usageRecords.filter((row) => row.period_type === periodType).map((row) => Number(row.period_start.slice(0, 4))),
  ])].sort((a, b) => b - a), [periodType, usageRecords]);
  const usage = useMemo(() => {
    const totals: Record<Island, number> = { Sumatra: 0, Kalimantan: 0, Sulawesi: 0, Jawa: 0, Papua: 0, "Tidak terpetakan": 0 };
    for (const row of usageRecords) {
      if (row.period_type !== periodType || !row.period_start.startsWith(selectedYear)) continue;
      if (periodType === "monthly" && row.period_start.slice(5, 7) !== selectedMonth) continue;
      totals[row.island] += Number(row.spent_total);
    }
    return totals;
  }, [periodType, selectedMonth, selectedYear, usageRecords]);
  const slices = useMemo(() => ISLANDS.map<UsageSlice>((island, index) => ({
    label: island,
    value: usage[island],
    color: island === "Tidak terpetakan" ? "#64748b" : COLORS[index % COLORS.length],
  })).filter((slice) => slice.value > 0), [usage]);
  const visibleSlices = selectedIsland ? slices.filter((slice) => slice.label === selectedIsland) : slices;
  const visibleIslands = selectedIsland ? ISLANDS.filter((island) => island === selectedIsland) : ISLANDS;
  const total = visibleSlices.reduce((sum, slice) => sum + slice.value, 0);
  const labeledSlices = visibleSlices.map((slice, index) => {
    const start = visibleSlices.slice(0, index).reduce((sum, item) => sum + item.value, 0);
    return {
      ...slice,
      percentage: total > 0 ? Math.round((slice.value / total) * 100) : 0,
      midAngle: total > 0 ? ((start + slice.value / 2) / total) * 360 : 0,
    };
  });

  return (
    <section aria-labelledby="budget-island-title" className="mt-5 rounded-3xl border border-emerald-100 bg-white/90 p-5 shadow-[0_12px_34px_-24px_rgba(16,39,92,0.28)] backdrop-blur-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 id="budget-island-title" className="text-lg font-extrabold text-[#102a61] sm:text-xl">Penggunaan Dana Indonesia</h2>
          <p className="mt-1 text-sm text-muted">Pilih periode dan wilayah untuk melihat realisasi pencairan.</p>
        </div>
        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1 text-[10px] font-semibold text-slate-500">Periode<select aria-label="Jenis periode penggunaan dana" value={periodType} onChange={(event) => setPeriodType(event.target.value as "monthly" | "yearly")} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-400"><option value="monthly">Bulanan</option><option value="yearly">Tahunan</option></select></label>
          {periodType === "monthly" && <label className="grid gap-1 text-[10px] font-semibold text-slate-500">Bulan<select aria-label="Pilih bulan" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-400">{MONTHS.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}</select></label>}
          <label className="grid gap-1 text-[10px] font-semibold text-slate-500">Tahun<select aria-label="Pilih tahun" value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-400">{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
          <label className="grid gap-1 text-[10px] font-semibold text-slate-500">Wilayah<select aria-label="Filter wilayah penggunaan dana" value={selectedIsland} onChange={(event) => setSelectedIsland(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-400"><option value="">Seluruh Indonesia</option>{ISLANDS.map((island) => <option key={island} value={island}>{island}</option>)}</select></label>
        </div>
      </div>

      {error ? <p role="status" className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">Data periode belum tersedia. Pastikan migrasi agregat penggunaan dana terbaru sudah diterapkan di Supabase, lalu muat ulang halaman.</p> : (
        <div className="mt-5 grid items-center gap-5 md:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)]">
          <div className="flex flex-col items-center">
            <p className="mb-2 text-center text-sm font-bold text-slate-600">{loading ? "Memuat data…" : `${formatAmount(total)} digunakan · ${periodType === "monthly" ? `${MONTHS.find((month) => month.value === selectedMonth)?.label} ` : "Tahun "}${selectedYear}`}</p>
            <div className="size-56 max-w-full sm:size-64">
              <svg viewBox="0 0 256 256" role="img" aria-label={`Grafik penggunaan dana per pulau: ${visibleSlices.map((slice) => `${slice.label} ${formatAmount(slice.value)}`).join(", ") || "belum ada pencairan"}`} className="size-full overflow-visible">
                {total > 0 && labeledSlices.map((slice, index) => {
                  const startAngle = (visibleSlices.slice(0, index).reduce((sum, item) => sum + item.value, 0) / total) * Math.PI * 2 - Math.PI / 2;
                  const endAngle = startAngle + (slice.value / total) * Math.PI * 2;
                  const startX = 128 + 128 * Math.cos(startAngle);
                  const startY = 128 + 128 * Math.sin(startAngle);
                  const endX = 128 + 128 * Math.cos(endAngle);
                  const endY = 128 + 128 * Math.sin(endAngle);
                  const largeArc = slice.value / total > 0.5 ? 1 : 0;
                  const path = slice.value === total
                    ? undefined
                    : `M 128 128 L ${startX} ${startY} A 128 128 0 ${largeArc} 1 ${endX} ${endY} Z`;
                  const labelRadius = 78;
                  const radians = (slice.midAngle * Math.PI) / 180;
                  const labelX = 128 + Math.sin(radians) * labelRadius;
                  const labelY = 128 - Math.cos(radians) * labelRadius;
                  const title = `${slice.label}: ${formatAmount(slice.value)} (${slice.percentage}%)`;
                  return <g key={slice.label}>
                    {path ? <path d={path} fill={slice.color} stroke="white" strokeWidth="1.5"><title>{title}</title></path> : <circle cx="128" cy="128" r="128" fill={slice.color}><title>{title}</title></circle>}
                    {slice.percentage >= 7 && <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="800" stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" paintOrder="stroke" className="pointer-events-none select-none">{slice.label} {slice.percentage}%</text>}
                  </g>;
                })}
                {total === 0 && <circle cx="128" cy="128" r="126" fill="#f1f5f9" />}
              </svg>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {visibleIslands.map((island) => {
              const islandIndex = INDONESIAN_ISLANDS.findIndex((item) => item === island);
              const color = islandIndex < 0 ? "#64748b" : COLORS[islandIndex % COLORS.length];
              return <article key={island} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                <span className="flex min-w-0 items-center gap-2"><i aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} /><span className="truncate text-sm font-semibold text-slate-600">{island}</span></span>
                <span className="shrink-0 text-sm font-extrabold text-[#102a61]">{loading ? "…" : formatAmount(usage[island])}</span>
              </article>;
            })}
            {!loading && total === 0 && <p className="text-sm text-muted sm:col-span-2">Belum ada pencairan dana untuk periode dan wilayah ini.</p>}
          </div>
        </div>
      )}
      <p className="mt-4 border-t border-slate-100 pt-3 text-[10px] text-slate-400">{updatedAt ? `Diperbarui ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(updatedAt)}` : "Data agregat pencairan dikelompokkan berdasarkan bulan, tahun, dan pulau."}</p>
    </section>
  );
}
