"use client";

import { useEffect, useMemo, useState } from "react";
import { getBudgetUsageByPeriod, subscribeToBudgetChanges, type BudgetIslandUsage, type BudgetPeriodUsageRecord } from "@/lib/bpdlh-budget-store";
import { INDONESIAN_ISLANDS } from "@/lib/admin/island-region";

const COLORS = ["#3568d4", "#e33d1c", "#ff9800", "#10951f", "#7954b8"];
const MONEY_FORMAT = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
const ZERO_USAGE = { ...Object.fromEntries(INDONESIAN_ISLANDS.map((island) => [island, 0])), unknown: 0 } as BudgetIslandUsage;
type UsageSlice = { label: string; value: number; color: string };
const MONTHS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1).padStart(2, "0"),
  label: new Intl.DateTimeFormat("id-ID", { month: "long" }).format(new Date(2026, index, 1)),
}));

function formatAmount(amount: number) {
  if (amount >= 1_000_000_000) return `Rp ${MONEY_FORMAT.format(amount / 1_000_000_000)} M`;
  if (amount >= 1_000_000) return `Rp ${MONEY_FORMAT.format(amount / 1_000_000)} jt`;
  return `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(amount)}`;
}

export function IslandReportPieChart() {
  const [usageRecords, setUsageRecords] = useState<BudgetPeriodUsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIsland, setActiveIsland] = useState<string | null>(null);
  const [selectedIsland, setSelectedIsland] = useState("");
  const [periodType, setPeriodType] = useState<"monthly" | "yearly">("monthly");
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const nextUsage = await getBudgetUsageByPeriod();
        if (!active) return;
        setUsageRecords(nextUsage);
        setError("");
      } catch (loadError: unknown) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Penggunaan dana per pulau gagal dimuat.");
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

  const years = useMemo(() => [...new Set([
    new Date().getFullYear(),
    ...usageRecords.filter((row) => row.periodType === periodType).map((row) => Number(row.periodStart.slice(0, 4))),
  ])].sort((a, b) => b - a), [periodType, usageRecords]);
  const usage = useMemo(() => {
    const totals = { ...ZERO_USAGE };
    for (const row of usageRecords) {
      if (row.periodType !== periodType || !row.periodStart.startsWith(selectedYear)) continue;
      if (periodType === "monthly" && row.periodStart.slice(5, 7) !== selectedMonth) continue;
      totals[row.island] += row.spentTotal;
    }
    return totals;
  }, [periodType, selectedMonth, selectedYear, usageRecords]);
  const slices = useMemo(() => INDONESIAN_ISLANDS.map<UsageSlice>((island, index) => ({
    label: island,
    value: usage[island],
    color: COLORS[index % COLORS.length],
  })).concat({ label: "Tidak terpetakan", value: usage.unknown, color: "#64748b" }).filter((slice) => slice.value > 0), [usage]);
  const visibleSlices = useMemo(() => selectedIsland ? slices.filter((slice) => slice.label === selectedIsland) : slices, [selectedIsland, slices]);
  const total = visibleSlices.reduce((sum, slice) => sum + slice.value, 0);
  const labeledSlices = visibleSlices.map((slice, index) => {
    const start = visibleSlices.slice(0, index).reduce((sum, item) => sum + item.value, 0);
    const percentage = total > 0 ? slice.value / total : 0;
    return { ...slice, percentage: Math.round(percentage * 100), midAngle: ((start + slice.value / 2) / total) * 360 };
  });

  return (
    <section className="flex h-full min-w-0 flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)] sm:p-5">
      <div className="grid min-w-0 gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-extrabold text-[#102a61]">Penggunaan Dana per Pulau</h2>
          <p className="mt-0.5 text-[10px] text-slate-500">Pilih periode dan wilayah penggunaan dana</p>
        </div>
        <div className="grid w-full min-w-0 grid-cols-2 gap-2 xl:grid-cols-4">
          <label className="grid min-w-0 gap-1 text-[9px] font-semibold text-slate-500">Periode<select aria-label="Jenis periode penggunaan dana" value={periodType} onChange={(event) => setPeriodType(event.target.value as "monthly" | "yearly")} className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600"><option value="monthly">Bulanan</option><option value="yearly">Tahunan</option></select></label>
          {periodType === "monthly" && <label className="grid min-w-0 gap-1 text-[9px] font-semibold text-slate-500">Bulan<select aria-label="Pilih bulan" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600">{MONTHS.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}</select></label>}
          <label className="grid min-w-0 gap-1 text-[9px] font-semibold text-slate-500">Tahun<select aria-label="Pilih tahun penggunaan dana" value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600">{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
          <label className="grid min-w-0 gap-1 text-[9px] font-semibold text-slate-500">Wilayah<select aria-label="Filter wilayah penggunaan dana" value={selectedIsland} onChange={(event) => setSelectedIsland(event.target.value)} className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600"><option value="">Seluruh Indonesia</option>{INDONESIAN_ISLANDS.map((island) => <option key={island} value={island}>{island}</option>)}<option value="Tidak terpetakan">Tidak terpetakan</option></select></label>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col items-center justify-center">
        <p className="mb-2 w-full text-center text-xs font-bold text-slate-600">{loading ? "Memuat data…" : `${formatAmount(total)} digunakan · ${periodType === "monthly" ? `${MONTHS.find((month) => month.value === selectedMonth)?.label} ` : "Tahun "}${selectedYear}`}</p>
        <div className="size-52 max-w-full sm:size-56">
          <svg viewBox="0 0 256 256" role="img" aria-label={`Grafik penggunaan dana per pulau: ${visibleSlices.map((slice) => `${slice.label} ${formatAmount(slice.value)}`).join(", ") || "belum ada pencairan"}`} className="size-full overflow-visible">
            {labeledSlices.map((slice, index) => {
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
              const radians = (slice.midAngle * Math.PI) / 180;
              const isActive = activeIsland === slice.label;
              const offset = isActive ? 6 : 0;
              const translateX = Math.sin(radians) * offset;
              const translateY = -Math.cos(radians) * offset;
              const labelRadius = 79;
              const labelX = 128 + Math.sin(radians) * labelRadius;
              const labelY = 128 - Math.cos(radians) * labelRadius;
              const activate = () => setActiveIsland(slice.label);
              const deactivate = () => setActiveIsland(null);
              const title = `${slice.label}: ${formatAmount(slice.value)} (${slice.percentage}%)`;

              return <g key={slice.label} transform={`translate(${translateX} ${translateY})`} className="transition-transform duration-200 ease-out">
                {path ? <path d={path} fill={slice.color} stroke="white" strokeWidth="1.5" role="button" tabIndex={0} aria-label={title} onMouseEnter={activate} onMouseLeave={deactivate} onFocus={activate} onBlur={deactivate}><title>{title}</title></path> : <circle cx="128" cy="128" r="128" fill={slice.color} role="button" tabIndex={0} aria-label={title} onMouseEnter={activate} onMouseLeave={deactivate} onFocus={activate} onBlur={deactivate}><title>{title}</title></circle>}
                <text x={labelX} y={labelY - 5} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="800" stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" paintOrder="stroke" className="pointer-events-none select-none">{slice.label}</text>
                <text x={labelX} y={labelY + 9} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="11" fontWeight="800" stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" paintOrder="stroke" className="pointer-events-none select-none">{slice.percentage}%</text>
              </g>;
            })}
          </svg>
        </div>
      </div>
      {!loading && total === 0 && <p className="mt-3 text-center text-[10px] text-slate-500">Belum ada transaksi pencairan untuk periode dan wilayah ini.</p>}
      {error && <p role="alert" className="mt-3 text-[10px] text-rose-600">Penggunaan dana gagal dimuat dari Supabase. {error}</p>}
    </section>
  );
}
