"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BellIcon } from "@/components/icons";
import { getBpdlhReportSubmissions, type BpdlhReportSubmission } from "@/lib/bpdlh-report-submissions";
import { loadAdminNotificationReadIds, markAdminNotificationReadIds } from "@/lib/admin-notification-read-state";
import { useBpdlhNotificationPreferences } from "@/lib/bpdlh-notification-preference";
import { getSupabaseClient } from "@/lib/supabaseClient";

const SEEN_KEY = "teduhi:bpdlh-seen-citizen-reports";
const READ_ID_PREFIX = "bpdlh-submission:";

function getSeenIds() {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

type BpdlhNotificationItem = {
  id: string;
  reportId: string;
  title: string;
  description: string;
  kind: "new" | "status";
  createdAt: string;
};

function formatNotificationTime(value: string) {
  if (!value || Number.isNaN(Date.parse(value))) return "Waktu tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function BpdlhNotifications() {
  const [submissions, setSubmissions] = useState<BpdlhReportSubmission[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { preferences } = useBpdlhNotificationPreferences();

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
        if (active) setSubmissions(nextSubmissions);
      } catch {
        if (active) setSubmissions([]);
      }
    };
    const syncSeen = () => setSeenIds(getSeenIds());
    void refresh();
    syncSeen();
    const savedSeenIds = getSeenIds();
    if (savedSeenIds.length > 0) {
      markAdminNotificationReadIds(savedSeenIds.map((id) => id.startsWith(READ_ID_PREFIX) || id.startsWith("bpdlh-status:") ? id : `${READ_ID_PREFIX}${id}`));
    }
    void loadAdminNotificationReadIds().then((ids) => {
      if (!active) return;
      setSeenIds((current) => [...new Set([...current, ...ids])]);
    }).catch(() => {
      // Keep local seen state if persisted reads are temporarily unavailable.
    });
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`bpdlh-submission-notifications-${crypto.randomUUID()}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "bpdlh_report_submissions",
      }, () => void refresh())
      .subscribe();
    const poll = window.setInterval(() => void refresh(), 20000);
    window.addEventListener("storage", syncSeen);
    return () => {
      active = false;
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
      window.removeEventListener("storage", syncSeen);
    };
  }, []);

  const notifications = submissions.reduce<BpdlhNotificationItem[]>((items, submission) => {
    if (submission.submissionStatus === "Menunggu Review" && preferences.newSubmissionsEnabled) {
      items.push({
        id: `${READ_ID_PREFIX}${submission.reportId}`,
        reportId: submission.reportId,
        title: submission.title,
        description: `${submission.category} · ${submission.address}`,
        kind: "new" as const,
        createdAt: submission.submittedAt,
      });
    }
    if (submission.submissionStatus !== "Menunggu Review" && submission.submissionStatus !== "Belum Diajukan" && submission.reviewedAt && preferences.statusChangesEnabled) {
      items.push({
        id: `bpdlh-status:${submission.reportId}:${submission.reviewedAt}`,
        reportId: submission.reportId,
        title: `${submission.title} · ${submission.submissionStatus}`,
        description: submission.bpdlhNote || "Status pengajuan telah diperbarui.",
        kind: "status" as const,
        createdAt: submission.reviewedAt,
      });
    }
    return items;
  }, []).sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  const isSeen = (item: BpdlhNotificationItem) => seenIds.includes(item.id)
    || (item.kind === "new" && seenIds.includes(item.reportId));
  const unreadNotifications = notifications.filter((item) => !isSeen(item));
  const notificationCount = unreadNotifications.length;

  function saveToInbox(notification: BpdlhNotificationItem) {
    const next = [...new Set([...seenIds, ...getSeenIds(), notification.id])];
    setSeenIds(next);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(next));
    } catch {
      // Navigasi tetap dapat dilakukan walau penyimpanan notifikasi tidak tersedia.
    }
    markAdminNotificationReadIds([notification.id]);
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
            {unreadNotifications.length === 0 && <li className="px-4 py-5 text-center text-[11px] text-slate-500">Tidak ada notifikasi baru.</li>}
            {unreadNotifications.slice(0, 8).map((notification) => (
              <li key={notification.id}>
                <Link href="/bpdlh/pengajuan" onNavigate={closeNotifications} onClick={() => { saveToInbox(notification); closeNotifications(); }} className="block px-4 py-3 transition hover:bg-blue-50/60">
                  <span className="flex items-start justify-between gap-3"><span className="text-[9px] font-extrabold uppercase tracking-wide text-blue-700">{notification.kind === "new" ? "Pengajuan baru" : "Perubahan status"}</span><span className="mt-1 size-2 shrink-0 rounded-full bg-rose-500" /></span>
                  <span className="mt-1 block text-[11px] font-bold text-[#102a61]">{notification.title}</span>
                  <span className="mt-1 block line-clamp-2 text-[10px] text-slate-500">{notification.description}</span>
                  <time className="mt-1 block text-[9px] text-slate-400">{formatNotificationTime(notification.createdAt)}</time>
                </Link>
              </li>
            ))}
          </ul>
          {unreadNotifications.length > 0 && <Link href="/bpdlh/pengajuan" onNavigate={closeNotifications} onClick={() => { unreadNotifications.forEach(saveToInbox); closeNotifications(); }} className="block border-t border-slate-100 px-4 py-3 text-center text-[10px] font-bold text-blue-700 hover:bg-blue-50">Buka semua pengajuan</Link>}
        </section>
      </>}
    </div>
  );
}
