"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckIcon, ClockIcon, FileIcon, SendIcon } from "@/components/icons";
import { LiveDate } from "@/components/LiveDate";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { BpdlhSubmissionStatus } from "@/lib/bpdlh-report-submissions";

type SubmissionSnapshot = { status: BpdlhSubmissionStatus; submitted_at: string };
type DashboardData = { submissions: SubmissionSnapshot[]; loadedAt: Date };

const MONTH_FORMAT = new Intl.DateTimeFormat("id-ID", { month: "short" });
const COUNT_FORMAT = new Intl.NumberFormat("id-ID");

const metricsConfig = [
  { key: "total", label: "Total Pengajuan", note: "Seluruh laporan yang dikirim admin utama", tone: "blue", icon: FileIcon },
  { key: "waiting", label: "Menunggu Review", note: "Perlu ditinjau BPDLH", tone: "orange", icon: ClockIcon },
  { key: "approved", label: "Disetujui", note: "Keputusan sudah diteruskan ke admin utama", tone: "green", icon: CheckIcon },
  { key: "followUp", label: "Perlu Tindak Lanjut", note: "Revisi atau penolakan", tone: "amber", icon: SendIcon },
] as const;

const toneStyles = {
  blue: "bg-blue-50 text-blue-700",
  orange: "bg-orange-50 text-orange-600",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
} as const;

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-slate-100 bg-white p-3 shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)] sm:p-4 ${className}`}>{children}</section>;
}

function PanelHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="mb-3"><h2 className="text-[11px] font-extrabold text-[#102a61] sm:text-xs">{title}</h2>{subtitle && <p className="mt-0.5 text-[9px] text-slate-500">{subtitle}</p>}</div>;
}

export function BpdlhDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const { data: records, error: queryError } = await getSupabaseClient()
      .from("bpdlh_report_submissions")
      .select("status, submitted_at")
      .order("submitted_at", { ascending: true });
    if (queryError) throw queryError;
    setData({ submissions: (records ?? []) as SubmissionSnapshot[], loadedAt: new Date() });
    setError("");
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        await refresh();
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Data pengajuan gagal dimuat dari Supabase.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    const poll = window.setInterval(() => void load(), 20000);
    const supabase = getSupabaseClient();
    const channel = supabase.channel("bpdlh-dashboard-submissions-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "bpdlh_report_submissions" }, () => void load())
      .subscribe();

    return () => {
      active = false;
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const submissions = useMemo(() => data?.submissions ?? [], [data]);
  const counts = useMemo(() => ({
    total: submissions.length,
    waiting: submissions.filter((item) => item.status === "Menunggu Review").length,
    approved: submissions.filter((item) => item.status === "Disetujui").length,
    followUp: submissions.filter((item) => item.status === "Perlu Revisi" || item.status === "Ditolak").length,
  }), [submissions]);

  const chartPoints = useMemo(() => Array.from({ length: 12 }, (_, index) => {
    const start = new Date(new Date().getFullYear(), new Date().getMonth() - 11 + index, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const value = submissions.filter((submission) => {
      const date = Date.parse(submission.submitted_at);
      return Number.isFinite(date) && date >= start.getTime() && date < end.getTime();
    }).length;
    return { label: MONTH_FORMAT.format(start), year: start.getFullYear(), value };
  }), [submissions]);

  const chartMax = Math.max(1, ...chartPoints.map((point) => point.value));
  const chart = { left: 48, right: 680, top: 20, bottom: 190 };
  const xFor = (index: number) => chart.left + (index * (chart.right - chart.left)) / Math.max(1, chartPoints.length - 1);
  const yFor = (value: number) => chart.bottom - (value / chartMax) * (chart.bottom - chart.top);
  const chartPath = chartPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${xFor(index)} ${yFor(point.value)}`).join(" ");
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.ceil(chartMax * ratio));
  return (
    <div className="mx-auto grid max-w-[1500px] gap-3 sm:gap-4">
      <section className="relative isolate overflow-hidden rounded-xl bg-linear-to-r from-[#075be5] via-[#0878e5] to-[#08aeca] px-4 py-4 text-white shadow-[0_16px_40px_-24px_rgba(0,84,190,0.55)] sm:px-5 sm:py-5">
        <div aria-hidden="true" className="absolute -right-8 -top-20 -z-10 size-56 rounded-full border border-white/15" />
        <div aria-hidden="true" className="absolute right-20 -bottom-36 -z-10 size-64 rounded-full border border-white/15" />
        <div className="max-w-2xl">
          <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-blue-100">Panel Layanan Bencana</p>
          <h1 className="mt-1 text-lg font-extrabold sm:text-xl">Selamat datang, Admin BPDLH</h1>
          <p className="mt-1 max-w-lg text-[10px] leading-relaxed text-white/85 sm:text-xs">Ringkasan pengajuan laporan dari admin utama dan keputusan review BPDLH.</p>
          <div className="mt-2"><LiveDate className="bg-white/15 px-2 py-1 text-[8px] text-white/90" /></div>
        </div>
        <div aria-hidden="true" className="absolute right-4 bottom-0 hidden h-full w-[34%] items-end justify-end gap-2 overflow-hidden opacity-25 sm:flex">{["h-1/3", "h-2/3", "h-1/2", "h-4/5", "h-2/5"].map((height, index) => <div key={index} className={`${height} w-9 rounded-t-md border border-white/70 bg-white/10`} />)}</div>
      </section>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">Ringkasan pengajuan tidak dapat dimuat dari Supabase. Pastikan migrasi pengajuan sudah dijalankan dan role akun memiliki akses. {error}</p>}

      <section aria-label="Statistik pengajuan BPDLH" className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        {metricsConfig.map((metric) => {
          const Icon = metric.icon;
          const value = counts[metric.key];
          return <article key={metric.key} className="rounded-xl border border-slate-100 bg-white p-3 shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)] sm:p-3.5"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-[9px] font-bold text-slate-500 sm:text-[10px]">{metric.label}</p><p className="mt-1 text-lg font-extrabold leading-none tracking-tight text-[#102a61] sm:text-xl">{loading ? "…" : COUNT_FORMAT.format(value)}</p></div><span className={`grid size-7 shrink-0 place-items-center rounded-lg ${toneStyles[metric.tone]}`}><Icon width={15} height={15} /></span></div><p className="mt-1.5 min-h-5 text-[8px] font-semibold text-slate-500">{metric.note}</p><div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100"><span className={`block h-full rounded-full ${metric.tone === "green" ? "bg-emerald-500" : metric.tone === "orange" ? "bg-orange-500" : metric.tone === "amber" ? "bg-amber-500" : "bg-blue-600"}`} style={{ width: `${counts.total ? Math.min(100, (value / counts.total) * 100) : 0}%` }} /></div></article>;
        })}
      </section>

      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-2"><PanelHeading title="Tren Pengajuan BPDLH" subtitle="Jumlah laporan yang dikirim admin utama dalam 12 bulan terakhir" /><span className="text-[8px] text-slate-400">{data ? `Diperbarui ${new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(data.loadedAt)}` : "Mengambil data Supabase…"}</span></div>
        <div className="h-48 w-full sm:h-52">
          <svg viewBox="0 0 700 230" role="img" aria-label="Grafik jumlah pengajuan BPDLH per bulan dalam 12 bulan terakhir" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
            {ticks.map((tick, index) => {
              const y = yFor(tick);
              return <g key={`${tick}-${index}`}><line x1={chart.left} x2={chart.right} y1={y} y2={y} stroke="#e8eef7" strokeDasharray="4 5" /><text x={chart.left - 10} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10">{tick}</text></g>;
            })}
            <line x1={chart.left} x2={chart.left} y1={chart.top} y2={chart.bottom} stroke="#cbd5e1" />
            <line x1={chart.left} x2={chart.right} y1={chart.bottom} y2={chart.bottom} stroke="#cbd5e1" />
            {submissions.length > 0 && <path d={chartPath} fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
            {chartPoints.map((point, index) => {
              const x = xFor(index);
              return <g key={`${point.year}-${point.label}-${index}`}><circle cx={x} cy={yFor(point.value)} r="4" fill="white" stroke="#10b981" strokeWidth="2.5"><title>{`${point.label} ${point.year}: ${COUNT_FORMAT.format(point.value)} pengajuan`}</title></circle><text x={x} y={chart.bottom + 20} textAnchor="middle" fill="#64748b" fontSize="9">{point.label}</text></g>;
            })}
          </svg>
        </div>
        {data && submissions.length === 0 && <p className="py-1 text-center text-[9px] text-slate-500">Belum ada pengajuan BPDLH di database.</p>}
        <div className="mt-1 flex justify-center text-[8px] font-semibold text-slate-500"><span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-emerald-500" />Pengajuan tersimpan di Supabase</span></div>
      </Panel>
    </div>
  );
}
