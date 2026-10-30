"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BellIcon } from "@/components/icons";
import { getAllLocalReports, subscribeToLocalReports, type LocalReport } from "@/lib/portal-store";
import { getBpdlhReportSubmissions } from "@/lib/bpdlh-report-submissions";

const SEEN_KEY = "teduhi:bpdlh-seen-citizen-reports";

function getSeenIds() {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function BpdlhNotifications() {
  const [reports, setReports] = useState<LocalReport[]>([]);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const nextReports = await getAllLocalReports();
        if (active) setReports(nextReports.filter((report) => report.status === "Menunggu Verifikasi"));
      } catch {
        if (active) setReports([]);
      }
      try {
        const submissions = await getBpdlhReportSubmissions();
        if (active) setPendingReviewCount(submissions.filter((submission) => submission.submissionStatus === "Menunggu Review").length);
      } catch {
        if (active) setPendingReviewCount(0);
      }
    };
    const syncSeen = () => setSeenIds(getSeenIds());
    void refresh();
    syncSeen();
    const unsubscribe = subscribeToLocalReports(() => void refresh());
    const poll = window.setInterval(() => void refresh(), 20000);
    window.addEventListener("storage", syncSeen);
    return () => {
      active = false;
      window.clearInterval(poll);
      unsubscribe();
      window.removeEventListener("storage", syncSeen);
    };
  }, []);

  const unreadReportCount = reports.filter((report) => !seenIds.includes(report.id)).length;
  const notificationCount = pendingReviewCount + unreadReportCount;

  function saveToInbox(reportId: string) {
    const next = [...new Set([...seenIds, reportId])];
    setSeenIds(next);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(next));
    } catch {
      // Navigasi tetap dapat dilakukan walau penyimpanan notifikasi tidak tersedia.
    }
  }

  return (
    <div className="relative">
      <button type="button" aria-label={`Notifikasi${notificationCount ? `, ${notificationCount} belum dibuka` : ""}`} aria-expanded={open} onClick={() => setOpen((current) => !current)} className="relative grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-50">
        <BellIcon width={16} height={16} />
        {notificationCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[8px] font-extrabold text-white">{notificationCount > 9 ? "9+" : notificationCount}</span>}
      </button>
      {open && <>
        <button type="button" aria-label="Tutup notifikasi" onClick={() => setOpen(false)} className="fixed inset-0 z-30 cursor-default" />
        <section aria-label="Notifikasi BPDLH" className="absolute right-0 top-11 z-40 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-xs font-extrabold text-[#102a61]">Notifikasi</h2>
            <span className="text-[10px] text-slate-500">{notificationCount} belum dibuka</span>
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {pendingReviewCount > 0 && <li><Link href="/bpdlh/pengajuan" onClick={() => setOpen(false)} className="block px-4 py-3 transition hover:bg-blue-50/60"><span className="flex items-start justify-between gap-3"><span className="text-[11px] font-bold text-[#102a61]">Pengajuan menunggu review</span><span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[8px] font-extrabold text-white">{pendingReviewCount > 9 ? "9+" : pendingReviewCount}</span></span><span className="mt-1 block text-[10px] text-slate-500">{pendingReviewCount} pengajuan perlu ditinjau di Kotak Masuk Pengajuan.</span></Link></li>}
            {reports.length === 0 && pendingReviewCount === 0 && <li className="px-4 py-5 text-center text-[11px] text-slate-500">Belum ada notifikasi baru.</li>}
            {reports.slice(0, 8).map((report) => (
              <li key={report.id}>
                <Link href={`/bpdlh/pengajuan#laporan-${encodeURIComponent(report.id)}`} onClick={() => { saveToInbox(report.id); setOpen(false); }} className="block px-4 py-3 transition hover:bg-blue-50/60">
                  <span className="flex items-start justify-between gap-3"><span className="text-[11px] font-bold text-[#102a61]">{report.title}</span>{!seenIds.includes(report.id) && <span className="mt-1 size-2 shrink-0 rounded-full bg-rose-500" />}</span>
                  <span className="mt-1 block text-[10px] text-slate-500">{report.category} · {report.address}</span>
                  <span className="mt-1 block text-[9px] text-slate-400">Klik untuk membuka laporan ini di Kotak Masuk Pengajuan</span>
                </Link>
              </li>
            ))}
          </ul>
          {reports.length > 0 && <Link href="/bpdlh/pengajuan#laporan-warga" onClick={() => { reports.forEach((report) => saveToInbox(report.id)); setOpen(false); }} className="block border-t border-slate-100 px-4 py-3 text-center text-[10px] font-bold text-blue-700 hover:bg-blue-50">Buka semua laporan di kotak masuk</Link>}
        </section>
      </>}
    </div>
  );
}
