"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BellIcon } from "@/components/icons";
import { getBpdlhReportSubmissions, type BpdlhReportSubmission } from "@/lib/bpdlh-report-submissions";
import { subscribeToBudgetChanges } from "@/lib/bpdlh-budget-store";

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
  const [submissions, setSubmissions] = useState<BpdlhReportSubmission[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        // Only records explicitly sent by the main admin exist in this table.
        // A citizen report in the general reports table is not a BPDLH request.
        const nextSubmissions = await getBpdlhReportSubmissions();
        if (active) setSubmissions(nextSubmissions.filter((submission) => submission.submissionStatus === "Menunggu Review"));
      } catch {
        if (active) setSubmissions([]);
      }
    };
    const syncSeen = () => setSeenIds(getSeenIds());
    void refresh();
    syncSeen();
    const unsubscribe = subscribeToBudgetChanges(() => void refresh());
    const poll = window.setInterval(() => void refresh(), 20000);
    window.addEventListener("storage", syncSeen);
    return () => {
      active = false;
      window.clearInterval(poll);
      unsubscribe();
      window.removeEventListener("storage", syncSeen);
    };
  }, []);

  const unreadSubmissions = submissions.filter((submission) => !seenIds.includes(submission.reportId));
  const notificationCount = unreadSubmissions.length;

  function saveToInbox(reportId: string) {
    const next = [...new Set([...seenIds, reportId])];
    setSeenIds(next);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(next));
    } catch {
      // Navigasi tetap dapat dilakukan walau penyimpanan notifikasi tidak tersedia.
    }
  }

  function closeNotifications() {
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button type="button" aria-label={`Notifikasi${notificationCount ? `, ${notificationCount} belum dibuka` : ""}`} aria-expanded={open} onClick={() => setOpen((current) => !current)} className="relative grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-50">
        <BellIcon width={16} height={16} />
        {notificationCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[8px] font-extrabold text-white">{notificationCount > 9 ? "9+" : notificationCount}</span>}
      </button>
      {open && <>
        <section aria-label="Notifikasi BPDLH" className="absolute right-0 top-11 z-40 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-xs font-extrabold text-[#102a61]">Notifikasi</h2>
            <span className="text-[10px] text-slate-500">{notificationCount} belum dibuka</span>
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {submissions.length === 0 && <li className="px-4 py-5 text-center text-[11px] text-slate-500">Belum ada pengajuan yang dikirim admin utama.</li>}
            {submissions.slice(0, 8).map((submission) => (
              <li key={submission.reportId}>
                <Link href="/bpdlh/pengajuan" onNavigate={closeNotifications} onClick={() => { saveToInbox(submission.reportId); closeNotifications(); }} className="block px-4 py-3 transition hover:bg-blue-50/60">
                  <span className="flex items-start justify-between gap-3"><span className="text-[11px] font-bold text-[#102a61]">{submission.title}</span>{!seenIds.includes(submission.reportId) && <span className="mt-1 size-2 shrink-0 rounded-full bg-rose-500" />}</span>
                  <span className="mt-1 block text-[10px] text-slate-500">{submission.category} · {submission.address}</span>
                  <span className="mt-1 block text-[9px] text-slate-400">Dikirim admin utama · menunggu review BPDLH</span>
                </Link>
              </li>
            ))}
          </ul>
          {submissions.length > 0 && <Link href="/bpdlh/pengajuan" onNavigate={closeNotifications} onClick={() => { submissions.forEach((submission) => saveToInbox(submission.reportId)); closeNotifications(); }} className="block border-t border-slate-100 px-4 py-3 text-center text-[10px] font-bold text-blue-700 hover:bg-blue-50">Buka semua pengajuan terkirim</Link>}
        </section>
      </>}
    </div>
  );
}
