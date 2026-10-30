"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckIcon, ClockIcon, FileIcon } from "@/components/icons";
import { getBpdlhReportSubmissions, reviewBpdlhReport, type BpdlhReportSubmission, type BpdlhSubmissionStatus } from "@/lib/bpdlh-report-submissions";

const decisionStyles: Record<BpdlhSubmissionStatus, string> = {
  "Belum Diajukan": "bg-slate-100 text-slate-600",
  "Menunggu Review": "bg-blue-50 text-blue-700",
  Disetujui: "bg-emerald-50 text-emerald-700",
  "Perlu Revisi": "bg-amber-50 text-amber-700",
  Ditolak: "bg-rose-50 text-rose-700",
};

function formatSubmittedDate(value: string) {
  if (!value || Number.isNaN(Date.parse(value))) return "—";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function BpdlhReportReviewInbox() {
  const [submissions, setSubmissions] = useState<BpdlhReportSubmission[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    const records = await getBpdlhReportSubmissions();
    setSubmissions(records);
    setError("");
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        await refresh();
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Pengajuan gagal dimuat dari database.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    const poll = window.setInterval(() => void load(), 20000);
    return () => {
      active = false;
      window.clearInterval(poll);
    };
  }, [refresh]);

  async function decide(reportId: string, status: Exclude<BpdlhSubmissionStatus, "Belum Diajukan" | "Menunggu Review">) {
    const note = notes[reportId] ?? "";
    if (status !== "Disetujui" && !note.trim()) {
      setError(status === "Perlu Revisi" ? "Isi catatan yang perlu diperbaiki sebelum mengirim revisi." : "Isi alasan penolakan sebelum menolak laporan.");
      return;
    }
    setPendingId(reportId);
    setError("");
    setNotice("");
    try {
      await reviewBpdlhReport(reportId, status, note);
      await refresh();
      setNotice(status === "Disetujui"
        ? "Laporan disetujui dan keputusan sudah diteruskan ke dashboard admin utama."
        : `Keputusan “${status}” sudah diteruskan ke dashboard admin utama.`);
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : "Keputusan gagal disimpan ke database.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)]">
      <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
        <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-700"><FileIcon width={17} height={17} /></span>
        <div><h2 className="text-sm font-extrabold text-[#102a61]">Laporan dari Admin Utama</h2><p className="mt-0.5 text-[10px] text-slate-500">Pengajuan yang dikirim admin utama, bukan laporan warga yang belum diteruskan.</p></div>
        <span className="ml-auto rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">{submissions.filter((item) => item.submissionStatus === "Menunggu Review").length} menunggu</span>
      </header>
      {error && <p role="alert" className="mx-4 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] text-rose-800 sm:mx-5">Pengajuan gagal dimuat atau keputusan tidak tersimpan. Periksa izin role BPDLH dan migrasi database. {error}</p>}
      {notice && <p role="status" className="mx-4 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] text-emerald-800 sm:mx-5">{notice}</p>}
      {loading ? <p className="px-5 py-8 text-center text-xs text-slate-500">Memuat pengajuan dari database…</p> : submissions.length === 0 ? <p className="px-5 py-8 text-center text-xs text-slate-500">Belum ada laporan yang dikirim oleh admin utama.</p> : (
        <ul className="divide-y divide-slate-100">
          {submissions.map((submission) => {
            const waiting = submission.submissionStatus === "Menunggu Review";
            return <li key={submission.reportId} className="grid gap-3 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_minmax(240px,0.55fr)]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h3 className="text-xs font-extrabold text-[#102a61] sm:text-sm">{submission.title}</h3><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${decisionStyles[submission.submissionStatus]}`}>{submission.submissionStatus}</span></div>
                <p className="mt-1 text-[10px] text-slate-500">{submission.category} · {[submission.address, submission.district].filter(Boolean).join(", ")}</p>
                <p className="mt-1 text-[10px] text-slate-500">Pelapor: {submission.reporter} · Dikirim {formatSubmittedDate(submission.submittedAt)}</p>
                {submission.adminNote && <p className="mt-2 rounded-lg bg-slate-50 p-2.5 text-[10px] leading-relaxed text-slate-600"><strong>Catatan admin utama:</strong> {submission.adminNote}</p>}
                {submission.bpdlhNote && <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-[10px] leading-relaxed text-amber-800"><strong>Catatan keputusan:</strong> {submission.bpdlhNote}</p>}
              </div>
              {waiting && <div className="grid gap-2">
                <label className="sr-only" htmlFor={`bpdlh-note-${submission.reportId}`}>Catatan keputusan BPDLH</label>
                <textarea id={`bpdlh-note-${submission.reportId}`} value={notes[submission.reportId] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [submission.reportId]: event.target.value }))} rows={2} placeholder="Catatan untuk admin utama (wajib untuk revisi atau penolakan)" className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-[10px] outline-none focus:border-blue-400" />
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={pendingId === submission.reportId} onClick={() => void decide(submission.reportId, "Disetujui")} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-700 disabled:opacity-60"><CheckIcon width={13} height={13} />Setujui & kirim ke admin</button>
                  <button type="button" disabled={pendingId === submission.reportId} onClick={() => void decide(submission.reportId, "Perlu Revisi")} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-amber-600 disabled:opacity-60"><ClockIcon width={13} height={13} />Minta revisi</button>
                  <button type="button" disabled={pendingId === submission.reportId} onClick={() => void decide(submission.reportId, "Ditolak")} className="inline-flex min-h-8 items-center rounded-lg bg-rose-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-rose-700 disabled:opacity-60">Tolak</button>
                </div>
              </div>}
            </li>;
          })}
        </ul>
      )}
      <footer className="flex items-center gap-1.5 border-t border-slate-100 px-4 py-3 text-[9px] text-slate-400 sm:px-5"><ClockIcon width={12} height={12} />Keputusan disimpan ke database dan langsung terlihat oleh admin utama.</footer>
    </section>
  );
}