"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BellIcon, CheckIcon } from "@/components/icons";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { updateLocalReportStatus } from "@/lib/portal-store";
import {
  getBpdlhDecisionNotifications,
  getReadDecisionNotificationIds,
  markDecisionNotificationsRead,
  subscribeToBpdlhDecisionNotifications,
  type BpdlhDecisionNotification,
} from "@/lib/bpdlh-decision-notifications";

function formatDecisionTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function useDecisionNotifications() {
  const [notifications, setNotifications] = useState<BpdlhDecisionNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      setNotifications(getBpdlhDecisionNotifications());
      setReadIds(getReadDecisionNotificationIds());
    };
    const timer = window.setTimeout(sync, 0);
    const unsubscribe = subscribeToBpdlhDecisionNotifications(sync);
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return { notifications, readIds, refresh: () => {
    setNotifications(getBpdlhDecisionNotifications());
    setReadIds(getReadDecisionNotificationIds());
  } };
}

type PendingCitizenReport = {
  id: string;
  title: string | null;
  address: string | null;
  district: string | null;
  created_at: string | null;
};

export function AdminNotificationBell() {
  const router = useRouter();
  const { notifications, readIds, refresh } = useDecisionNotifications();
  const [citizenReports, setCitizenReports] = useState<PendingCitizenReport[]>([]);
  const [reportError, setReportError] = useState("");
  const [openingReportId, setOpeningReportId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((item) => !readIds.includes(item.id));

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeOnOutsideClick, true);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick, true);
  }, [open]);

  useEffect(() => {
    let active = true;
    const loadCitizenReports = async () => {
      const { data, error } = await getSupabaseClient()
        .from("reports")
        .select("id, title, address, district, created_at")
        .eq("status", "review")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) {
        setReportError(error.message);
        return;
      }
      setCitizenReports((data ?? []) as PendingCitizenReport[]);
      setReportError("");
    };

    const timer = window.setTimeout(() => void loadCitizenReports().catch((error: unknown) => {
      if (active) setReportError(error instanceof Error ? error.message : "Notifikasi laporan warga gagal dimuat.");
    }), 0);
    const refreshOnNewReport = () => void loadCitizenReports().catch((error: unknown) => {
      if (active) setReportError(error instanceof Error ? error.message : "Notifikasi laporan warga gagal dimuat.");
    });
    window.addEventListener("laporkota:reports-changed", refreshOnNewReport);
    const poll = window.setInterval(() => {
      if (open) refreshOnNewReport();
    }, 15000);

    return () => {
      active = false;
      window.clearTimeout(timer);
      window.clearInterval(poll);
      window.removeEventListener("laporkota:reports-changed", refreshOnNewReport);
    };
  }, [open]);

  async function openCitizenReport(report: PendingCitizenReport) {
    setOpeningReportId(report.id);
    setReportError("");
    try {
      // Clicking the notification is the admin's action to accept the submission
      // into the main report queue. Merely opening the bell does not publish it.
      await updateLocalReportStatus(report.id, "Menunggu Verifikasi");
      setCitizenReports((current) => current.filter((item) => item.id !== report.id));
      setOpen(false);
      router.push(`/admin/laporan/${encodeURIComponent(report.id)}`);
    } catch (error) {
      setReportError(error instanceof Error ? error.message : "Laporan belum dapat dibuka ke daftar utama.");
    } finally {
      setOpeningReportId(null);
    }
  }

  const notificationCount = unread.length + citizenReports.length;

  function openNotification(id: string) {
    markDecisionNotificationsRead([id]);
    refresh();
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button type="button" aria-label={`Notifikasi${notificationCount ? `, ${notificationCount} belum dibaca` : ""}`} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="relative grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-50">
        <BellIcon width={18} height={18} />
        {notificationCount > 0 && <span className="absolute right-1.5 top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[8px] font-extrabold text-white">{notificationCount > 9 ? "9+" : notificationCount}</span>}
      </button>
      {open && <>
        <section aria-label="Notifikasi admin" className="absolute right-0 top-11 z-40 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h2 className="text-xs font-extrabold text-[#102a61]">Notifikasi Admin</h2><span className="text-[10px] text-slate-500">{citizenReports.length} laporan baru</span></div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {reportError && <li role="alert" className="px-4 py-3 text-[10px] text-rose-700">Laporan baru gagal dimuat: {reportError}</li>}
            {citizenReports.length === 0 && !reportError && <li className="px-4 py-4 text-center text-[10px] text-slate-500">Belum ada laporan baru dari warga.</li>}
            {citizenReports.map((report) => <li key={`report:${report.id}`}>
              <button type="button" disabled={openingReportId === report.id} onClick={() => void openCitizenReport(report)} className="block w-full px-4 py-3 text-left transition hover:bg-blue-50/60 disabled:opacity-60">
                <span className="flex items-start justify-between gap-3"><span className="text-[11px] font-bold text-[#102a61]">{report.title || "Laporan baru dari warga"}</span><span className="mt-1 size-2 shrink-0 rounded-full bg-rose-500" /></span>
                <span className="mt-1 block text-[10px] text-slate-600">{[report.address, report.district].filter(Boolean).join(", ") || "Lokasi belum dicantumkan"}</span>
                <span className="mt-1 block text-[9px] font-semibold text-blue-700">{openingReportId === report.id ? "Membuka laporan…" : "Klik untuk memasukkan ke Kelola Laporan"}</span>
              </button>
            </li>)}
            {notifications.length === 0 && citizenReports.length === 0 && !reportError && <li className="px-4 py-5 text-center text-[11px] text-slate-500">Belum ada notifikasi laporan warga maupun informasi dari BPDLH.</li>}
            {notifications.slice(0, 8).map((item) => <li key={item.id}>
              <Link href={`/admin/notifikasi#${encodeURIComponent(item.id)}`} onClick={() => openNotification(item.id)} className="block px-4 py-3 hover:bg-blue-50/60">
                <span className="flex items-start justify-between gap-3"><span className="text-[11px] font-bold text-[#102a61]">{item.decision}: {item.requestTitle}</span>{!readIds.includes(item.id) && <span className="mt-1 size-2 shrink-0 rounded-full bg-rose-500" />}</span>
                {item.note && <span className="mt-1 block text-[10px] text-slate-600">{item.note}</span>}
                {item.transferDescription && <span className="mt-1 block text-[9px] text-emerald-700">Transfer: {item.transferDescription}</span>}
                <span className="mt-1 block text-[9px] text-slate-400">{formatDecisionTime(item.createdAt)}</span>
              </Link>
            </li>)}
          </ul>
          {notifications.length > 0 && <Link href="/admin/notifikasi" onClick={() => setOpen(false)} className="block border-t border-slate-100 px-4 py-3 text-center text-[10px] font-bold text-blue-700 hover:bg-blue-50">Buka pusat informasi</Link>}
        </section>
      </>}
    </div>
  );
}

export function AdminNotificationsView() {
  const { notifications, readIds, refresh } = useDecisionNotifications();
  const [proofError, setProofError] = useState("");

  function markAllRead() {
    markDecisionNotificationsRead(notifications.map((item) => item.id));
    refresh();
  }

  async function openProof(requestId: string) {
    setProofError("");
    try {
      const { getTransferProof } = await import("@/app/bpdlh/_review-store");
      const proof = await getTransferProof(requestId);
      if (!proof) {
        setProofError("Bukti transfer tidak ditemukan di penyimpanan browser ini.");
        return;
      }
      const url = URL.createObjectURL(proof.file);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = proof.fileName;
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setProofError("Bukti transfer tidak dapat dibuka dari browser ini.");
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-5">
        <div><h1 className="text-xl font-extrabold text-[#102a61]">Pusat Informasi</h1><p className="mt-1 text-sm text-slate-500">Keputusan dan tindak lanjut pengajuan dari BPDLH.</p></div>
        <button type="button" onClick={markAllRead} disabled={notifications.every((item) => readIds.includes(item.id))} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50">Tandai semua dibaca</button>
      </header>
      {proofError && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{proofError}</p>}
      <section aria-label="Daftar informasi keputusan" className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
        {notifications.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-500">Belum ada informasi keputusan dari BPDLH.</p>}
        <ol className="divide-y divide-slate-100">
          {notifications.map((item) => {
            const isRead = readIds.includes(item.id);
            return <li id={item.id} key={item.id} className={`scroll-mt-24 p-5 ${isRead ? "" : "bg-blue-50/30"}`}>
              <div className="flex items-start gap-3">
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${isRead ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-700"}`}>{isRead ? <CheckIcon width={18} height={18} /> : <BellIcon width={18} height={18} />}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-extrabold text-[#102a61]">{item.decision}: {item.requestTitle}</h2>{!isRead && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-700">Baru</span>}</div>
                  <p className="mt-1 text-xs text-slate-500">{formatDecisionTime(item.createdAt)}</p>
                  {item.note && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700"><strong>Catatan:</strong> {item.note}</p>}
                  {item.transferDescription && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900"><strong>Deskripsi transfer:</strong> {item.transferDescription}</p>}
                  {item.transferProofName && <div className="mt-3 flex flex-wrap items-center gap-3"><span className="text-xs text-slate-600">Bukti transfer: <strong>{item.transferProofName}</strong></span><button type="button" onClick={() => void openProof(item.requestId)} className="rounded-lg border border-emerald-200 px-3 py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50">Buka bukti</button></div>}
                </div>
              </div>
            </li>;
          })}
        </ol>
      </section>
      <p className="text-center text-[10px] text-slate-400">Notifikasi demo tersimpan lokal di browser ini, belum memakai backend.</p>
    </div>
  );
}
