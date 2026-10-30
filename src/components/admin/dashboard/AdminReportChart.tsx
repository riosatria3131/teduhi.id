"use client";

import { useEffect, useState } from "react";
import { formatReportCount, getAdminReportTrend, type ReportTrendPoint } from "@/lib/admin/report-analytics";
import { subscribeToLocalReports } from "@/lib/portal-store";

type Period = "monthly" | "yearly";

const PERIODS: { value: Period; label: string; title: string }[] = [
  { value: "monthly", label: "Per bulan", title: "12 Bulan Terakhir" },
  { value: "yearly", label: "Per tahun", title: "5 Tahun Terakhir" },
];

export function AdminReportChart() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [points, setPoints] = useState<ReportTrendPoint[]>([]);
  const [loadedPeriod, setLoadedPeriod] = useState<Period | null>(null);
  const [error, setError] = useState("");
  const loading = loadedPeriod !== period;

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const data = await getAdminReportTrend(period);
        if (!active) return;
        setPoints(data);
        setLoadedPeriod(period);
        setError("");
      } catch (loadError: unknown) {
        if (active) {
          setLoadedPeriod(period);
          setError(loadError instanceof Error ? loadError.message : "Grafik laporan gagal dimuat.");
        }
      }
    };
    void refresh();
    const unsubscribe = subscribeToLocalReports(() => void refresh());
    return () => {
      active = false;
      unsubscribe();
    };
  }, [period]);

  const periodInfo = PERIODS.find((item) => item.value === period)!;
  const chart = { left: 48, right: 680, top: 20, bottom: 190 };
  const tickStep = Math.ceil(Math.max(0, ...points.map((point) => point.value)) / 4 / 10) * 10 || 10;
  const chartMax = tickStep * 4;
  const xFor = (index: number) => chart.left + (index * (chart.right - chart.left)) / Math.max(1, points.length - 1);
  const yFor = (value: number) => chart.bottom - (value / chartMax) * (chart.bottom - chart.top);
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${xFor(index)} ${yFor(point.value)}`).join(" ");
  const ticks = [0, 1, 2, 3, 4].map((tick) => tickStep * tick);

  return (
    <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-extrabold text-[#102a61]">Grafik Laporan {periodInfo.title}</h2>
          <p className="mt-0.5 text-[10px] text-slate-500">Laporan berstatus selesai, dikelompokkan berdasarkan tanggal laporan</p>
        </div>
        <label className="sr-only" htmlFor="dashboard-range">Periode grafik laporan</label>
        <select id="dashboard-range" value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          {PERIODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>

      <div className="mt-4 h-44 w-full sm:h-52">
        <svg viewBox="0 0 700 240" role="img" aria-label={`Grafik laporan tertangani ${periodInfo.label.toLowerCase()}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          {ticks.map((tick) => {
            const y = yFor(tick);
            return <g key={tick}>
              <line x1={chart.left} x2={chart.right} y1={y} y2={y} stroke="#e8eef7" strokeDasharray="4 5" />
              <text x={chart.left - 12} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="11">{formatReportCount(tick)}</text>
            </g>;
          })}
          <line x1={chart.left} x2={chart.left} y1={chart.top} y2={chart.bottom} stroke="#cbd5e1" />
          <line x1={chart.left} x2={chart.right} y1={chart.bottom} y2={chart.bottom} stroke="#cbd5e1" />
          <path d={linePath} fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point, index) => {
            const x = xFor(index);
            return <g key={`${point.detail}-${index}`}>
              <circle cx={x} cy={yFor(point.value)} r="4" fill="white" stroke="#10b981" strokeWidth="2.5">
                <title>{`${point.detail}: ${formatReportCount(point.value)} laporan tertangani`}</title>
              </circle>
              <text x={x} y={chart.bottom + 22} textAnchor="middle" fill="#64748b" fontSize="11">{point.label}</text>
            </g>;
          })}
        </svg>
      </div>
      <div className="mt-2.5 flex justify-center text-[9px] font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-emerald-500" />Laporan tertangani</span>
      </div>
      {error ? <p role="alert" className="mt-2 text-center text-[9px] text-rose-600">Grafik gagal dimuat. {error}</p> : <p className="mt-2 text-center text-[9px] text-slate-400">{loading ? "Memuat agregat laporan dari Supabase…" : "Jumlah laporan berstatus selesai dari Supabase."}</p>}
    </section>
  );
}