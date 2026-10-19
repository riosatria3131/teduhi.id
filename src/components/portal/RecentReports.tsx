"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { ReportCard } from "./ReportCard";
import { usePortalReports } from "./use-portal-reports";

export function RecentReports() {
  const { reports, loading } = usePortalReports();
  return (
    <section aria-labelledby="recent-title">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div><h2 id="recent-title" className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">Laporan Terbaru</h2><p className="mt-0.5 text-[11px] text-muted">Contoh dan laporan demo lokal</p></div>
        <Link href="/portal/riwayat" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-blue-600 hover:underline sm:text-sm">Lihat Semua <ArrowRightIcon width={15} height={15} /></Link>
      </div>
      <div className="grid gap-3">{reports.slice(0, 2).map((report) => <ReportCard key={report.id} report={report} />)}</div>
      {!loading && reports.length === 0 && <p className="rounded-xl bg-paper p-5 text-sm text-muted">Belum ada laporan.</p>}
    </section>
  );
}