"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { ReportCard } from "./ReportCard";
import { usePortalReports } from "./use-portal-reports";

const HISTORY_STATUSES = ["Selesai", "Ditolak"] as const;

export function ReportHistory({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState("Semua status");
  const { reports: allReports, loading, error } = usePortalReports();
  const completedReports = useMemo(() => allReports.filter((report) => report.status === "Selesai" || report.status === "Ditolak"), [allReports]);
  const reports = useMemo(() => completedReports.filter((report) => {
    const matchesQuery = `${report.title} ${report.location} ${report.category} ${report.description ?? ""}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "Semua status" || report.status === status);
  }), [completedReports, query, status]);
  return (
    <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
        <label className="relative"><span className="sr-only">Cari laporan atau lokasi</span><SearchIcon width={18} height={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-xl border border-line bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-brand" placeholder="Cari laporan atau Lokasi" /></label>
        <label><span className="sr-only">Filter status</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl border border-line bg-white px-3 py-3 text-sm outline-none focus:border-brand"><option value="Semua status">Semua status</option>{HISTORY_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
      <p className="mt-4 text-xs text-muted">{loading ? "Memuat laporan lokal…" : `Menampilkan ${reports.length} dari ${completedReports.length} laporan selesai atau ditolak.`}</p>
      {error && <p role="status" className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</p>}
      <div className="mt-4 grid gap-3">{reports.map((report) => <ReportCard key={report.id} report={report} />)}</div>
      {reports.length === 0 && <p className="rounded-xl bg-paper p-6 text-center text-sm text-muted">Belum ada laporan selesai atau ditolak yang cocok dengan pencarian ini.</p>}
    </section>
  );
}