"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ReportStatus } from "@/components/portal/portal-data";
import { updateLocalReportStatus } from "@/lib/portal-store";

const REPORT_STATUSES: ReportStatus[] = ["Menunggu Verifikasi", "Terverifikasi", "Sedang Diproses", "Selesai", "Ditolak"];

export function AdminReportStatus({ reportId, initialStatus, onStatusUpdated }: { reportId: string; initialStatus: ReportStatus; onStatusUpdated: (status: ReportStatus) => void }) {
  const [status, setStatus] = useState<ReportStatus>(initialStatus);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const statusPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statusMenuOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setStatusMenuOpen(false);
    }
    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !statusPickerRef.current?.contains(event.target)) setStatusMenuOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [statusMenuOpen]);

  async function saveStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setSaved(false);
    setError("");
    try {
      await updateLocalReportStatus(reportId, status);
      onStatusUpdated(status);
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Status laporan gagal diperbarui.");
    } finally {
      setPending(false);
    }
  }

  return <form onSubmit={saveStatus} className="mt-6 border-t border-slate-100 pt-5">
    <div ref={statusPickerRef} className="grid gap-2 text-xs font-bold text-slate-600">
      <span id="report-status-label">Perbarui status</span>
      <button
        type="button"
        aria-labelledby="report-status-label report-status-value"
        aria-haspopup="listbox"
        aria-controls="report-status-options"
        aria-expanded={statusMenuOpen}
        onClick={() => setStatusMenuOpen((open) => !open)}
        className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3 text-left text-sm font-semibold text-[#102a61] outline-none transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${statusMenuOpen ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-300"}`}
      >
        <span id="report-status-value">{status}</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={`size-4 shrink-0 text-slate-500 transition-transform ${statusMenuOpen ? "rotate-180" : ""}`}><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {statusMenuOpen && <div id="report-status-options" role="listbox" aria-labelledby="report-status-label" className="grid gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {REPORT_STATUSES.map((item) => <button key={item} type="button" role="option" aria-selected={status === item} onClick={() => { setStatus(item); setSaved(false); setStatusMenuOpen(false); }} className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-semibold transition ${status === item ? "bg-blue-50 text-blue-800" : "text-slate-700 hover:bg-slate-50"}`}>
          {item}{status === item && <span aria-hidden="true" className="text-blue-700">✓</span>}
        </button>)}
      </div>}
    </div>
    <button disabled={pending} className="mt-3 h-10 w-full rounded-xl bg-blue-700 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60">{pending ? "Menyimpan…" : "Simpan Status"}</button>
    {error && <p role="alert" className="mt-2 text-center text-xs font-semibold text-rose-700">{error}</p>}
    {saved && <p role="status" className="mt-2 text-center text-xs font-semibold text-emerald-700">Status laporan diperbarui menjadi “{status}”.</p>}
  </form>;
}