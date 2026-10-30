"use client";

import { useEffect, useState } from "react";
import {
  BellIcon,
  CheckIcon,
  ClockIcon,
  FileIcon,
} from "@/components/icons";
import { LiveDate } from "@/components/LiveDate";
import { formatReportCount, getAdminReportMetrics, type AdminReportMetric } from "@/lib/admin/report-analytics";
import { subscribeToLocalReports } from "@/lib/portal-store";
import { AdminReportChart } from "./AdminReportChart";
import { TopDisasterCategories } from "./TopDisasterCategories";

const metricIcons = [FileIcon, BellIcon, ClockIcon, CheckIcon] as const;
const metricStyles = {
  blue: "bg-blue-50 text-blue-700",
  orange: "bg-orange-50 text-orange-600",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-rose-50 text-rose-600",
} as const;
export function AdminDashboardView() {
  const [metrics, setMetrics] = useState<AdminReportMetric[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState("");

  useEffect(() => {
    let active = true;
    const refreshMetrics = async () => {
      try {
        const nextMetrics = await getAdminReportMetrics();
        if (active) {
          setMetrics(nextMetrics);
          setMetricsError("");
        }
      } catch (error: unknown) {
        if (active) setMetricsError(error instanceof Error ? error.message : "Statistik laporan gagal dimuat.");
      } finally {
        if (active) setLoadingMetrics(false);
      }
    };
    void refreshMetrics();
    const unsubscribe = subscribeToLocalReports(() => void refreshMetrics());
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <div className="mx-auto grid max-w-[1500px] gap-4 sm:gap-5">
      <section className="relative isolate overflow-hidden rounded-2xl bg-linear-to-r from-[#075be5] via-[#0878e5] to-[#12b8c8] px-5 py-5 text-white shadow-[0_16px_40px_-24px_rgba(0,84,190,0.55)] sm:px-7 sm:py-6">
        <div aria-hidden="true" className="absolute -right-8 -top-20 -z-10 size-64 rounded-full border border-white/15" />
        <div aria-hidden="true" className="absolute right-20 -bottom-36 -z-10 size-72 rounded-full border border-white/15" />
        <div className="max-w-2xl">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-100">Panel Administrasi TEDUHI</p>
          <h1 className="mt-1.5 text-xl font-extrabold sm:text-2xl">Selamat datang, Admin!</h1>
          <p className="mt-1 max-w-lg text-xs leading-relaxed text-white/85 sm:text-sm">Berikut ringkasan data dan aktivitas terbaru layanan TEDUHI hari ini.</p>
          <div className="mt-3"><LiveDate className="bg-white/15 text-white/90" /></div>
        </div>
        <div aria-hidden="true" className="absolute right-5 bottom-0 hidden h-full w-[34%] items-end justify-end gap-2 overflow-hidden opacity-25 sm:flex">
          <div className="h-1/3 w-10 rounded-t-lg border border-white/70 bg-white/10" />
          <div className="h-2/3 w-14 rounded-t-lg border border-white/70 bg-white/10" />
          <div className="h-1/2 w-11 rounded-t-lg border border-white/70 bg-white/10" />
          <div className="h-4/5 w-16 rounded-t-lg border border-white/70 bg-white/10" />
          <div className="h-2/5 w-10 rounded-t-lg border border-white/70 bg-white/10" />
        </div>
      </section>

      <section aria-label="Statistik laporan" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {(metrics.length ? metrics : [
          { label: "Total Laporan", value: 0, note: "Seluruh laporan warga", tone: "blue" as const },
          { label: "Laporan Tertunda", value: 0, note: "Menunggu verifikasi", tone: "red" as const },
          { label: "Dalam Proses", value: 0, note: "Terverifikasi atau ditangani", tone: "orange" as const },
          { label: "Selesai", value: 0, note: "Laporan telah ditangani", tone: "green" as const },
        ]).map((metric, index) => {
          const Icon = metricIcons[index];
          return (
            <article key={metric.label} className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)] sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold text-slate-500 sm:text-xs">{metric.label}</p>
                  <p className="mt-1 text-2xl font-extrabold leading-none tracking-tight text-[#102a61] sm:text-3xl">{loadingMetrics ? "…" : formatReportCount(metric.value)}</p>
                </div>
                <span className={`grid size-8 shrink-0 place-items-center rounded-lg sm:size-9 ${metricStyles[metric.tone]}`}><Icon width={17} height={17} /></span>
              </div>
              <p className="mt-2 truncate text-[9px] font-semibold text-slate-500 sm:text-[10px]">{metric.note}</p>
            </article>
          );
        })}
      </section>

      {metricsError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Statistik dashboard gagal dimuat dari Supabase. Periksa koneksi dan izin admin. {metricsError}</p>}

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        <AdminReportChart />
        <TopDisasterCategories />
      </div>

      <p className="text-center text-[10px] text-slate-400">Statistik laporan dimuat langsung dari database Supabase.</p>
    </div>
  );
}
