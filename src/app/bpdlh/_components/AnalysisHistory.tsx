"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CalendarIcon, CheckIcon, ClockIcon, CloseIcon, EyeIcon, FileIcon, SearchIcon } from "@/components/icons";
import { getBpdlhReportSubmissions, type BpdlhReportSubmission } from "@/lib/bpdlh-report-submissions";
import { getSupabaseClient } from "@/lib/supabaseClient";

const statuses = ["Menunggu Review", "Disetujui", "Perlu Revisi", "Ditolak"] as const;
const statusStyles: Record<string, string> = {
  "Menunggu Review": "bg-orange-50 text-orange-700",
  Disetujui: "bg-emerald-50 text-emerald-700",
  "Perlu Revisi": "bg-amber-50 text-amber-700",
  Ditolak: "bg-rose-50 text-rose-700",
};
const pageSize = 4;

function formatDate(value: string) {
  if (!value || Number.isNaN(Date.parse(value))) return "Tanggal tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function displayStatus(status: BpdlhReportSubmission["submissionStatus"]) {
  return status === "Menunggu Review" ? "Dalam Proses" : status;
}

export function AnalysisHistory() {
  const [submissions, setSubmissions] = useState<BpdlhReportSubmission[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<BpdlhReportSubmission | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setSubmissions(await getBpdlhReportSubmissions());
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Riwayat analisis gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const records = await getBpdlhReportSubmissions();
        if (active) {
          setSubmissions(records);
          setError("");
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Riwayat analisis gagal dimuat.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    const supabase = getSupabaseClient();
    const channel = supabase.channel("bpdlh-analysis-history-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "bpdlh_report_submissions" }, () => void load())
      .subscribe();
    const poll = window.setInterval(() => void load(), 30000);
    return () => {
      active = false;
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, []);

  const reviewed = submissions.filter((item) => item.submissionStatus !== "Belum Diajukan");
  const approvedCount = reviewed.filter((item) => item.submissionStatus === "Disetujui").length;
  const rejectedCount = reviewed.filter((item) => item.submissionStatus === "Ditolak").length;
  const inProgressCount = reviewed.filter((item) => item.submissionStatus === "Menunggu Review").length;

  const filtered = useMemo(() => reviewed
    .filter((item) => {
      const searchable = `${item.title} ${item.category} ${item.address} ${item.district} ${item.reporter} ${item.adminNote} ${item.bpdlhNote} ${item.submittedAt} ${item.reviewedAt ?? ""}`.toLowerCase();
      const normalizedStatus = item.submissionStatus === "Menunggu Review" ? "Dalam Proses" : item.submissionStatus;
      return searchable.includes(query.trim().toLowerCase())
        && (statusFilter === "Semua Status" || normalizedStatus === statusFilter || item.submissionStatus === statusFilter);
    })
    .sort((a, b) => Date.parse(b.reviewedAt || b.submittedAt) - Date.parse(a.reviewedAt || a.submittedAt)),
  [query, reviewed, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const firstItem = filtered.length ? (page - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(page * pageSize, filtered.length);

  return (
    <div className="relative isolate mx-auto grid max-w-[1500px] gap-4 overflow-hidden rounded-[1.75rem] bg-[radial-gradient(ellipse_at_100%_0%,#dce8ff_0%,transparent_38%),linear-gradient(135deg,#f6f9ff_0%,#eef4ff_100%)] p-4 sm:gap-5 sm:p-6 lg:p-7">
      <header className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl bg-blue-100 text-blue-700 shadow-inner sm:size-[4.5rem]"><ClockIcon width={32} height={32} /></span>
          <div><h1 className="text-xl font-extrabold tracking-tight text-[#102a61] sm:text-3xl">Riwayat Analisis</h1><p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#354b78] sm:text-sm">Tinjau kembali hasil keputusan dan catatan atas pengajuan yang telah dianalisis.</p></div>
        </div>
      </header>

      <section aria-label="Ringkasan riwayat analisis" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Pengajuan Dianalisis" value={reviewed.length} tone="blue" icon={<BarsIcon />} trend="Pengajuan tercatat" />
        <SummaryCard label="Disetujui" value={approvedCount} tone="green" icon={<CheckIcon width={20} height={20} />} trend={`${reviewed.length ? Math.round((approvedCount / reviewed.length) * 100) : 0}% dari total`} />
        <SummaryCard label="Ditolak" value={rejectedCount} tone="red" icon={<CloseIcon width={20} height={20} />} trend={`${reviewed.length ? Math.round((rejectedCount / reviewed.length) * 100) : 0}% dari total`} />
        <SummaryCard label="Dalam Proses" value={inProgressCount} tone="blue" icon={<ClockIcon width={22} height={22} />} trend="Menunggu keputusan" />
      </section>

      <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1.5fr)_minmax(170px,0.7fr)_auto]">
        <label className="relative block"><span className="sr-only">Cari riwayat analisis</span><SearchIcon width={17} height={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-900" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari nama pengajuan, tanggal, atau keterangan..." className="h-11 w-full rounded-xl border border-blue-100 bg-white/90 pl-10 pr-3 text-xs text-[#102a61] shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></label>
        <label><span className="sr-only">Filter status</span><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="h-11 w-full rounded-xl border border-blue-100 bg-white/90 px-4 text-xs font-semibold text-[#102a61] shadow-sm outline-none focus:border-blue-400"><option>Semua Status</option><option>Dalam Proses</option>{statuses.filter((status) => status !== "Menunggu Review").map((status) => <option key={status}>{status}</option>)}</select></label>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white/90 px-4 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:opacity-60"><RefreshIcon />{loading ? "Memuat…" : "Refresh"}</button>
      </section>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">Riwayat gagal dimuat. {error}</p>}
      <section aria-label="Daftar riwayat analisis" className="overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-[0_12px_35px_-24px_rgba(16,39,92,0.35)]">
        {loading && submissions.length === 0 ? <p className="px-5 py-12 text-center text-xs text-slate-500">Memuat riwayat analisis…</p> : visible.length === 0 ? <p className="px-5 py-12 text-center text-xs text-slate-500">Belum ada pengajuan yang cocok dengan pencarian atau filter.</p> : (
          <ul className="divide-y divide-blue-50">
            {visible.map((item) => (
              <li key={item.reportId} className="grid gap-3 p-4 transition hover:bg-blue-50/35 sm:grid-cols-[minmax(0,1.55fr)_minmax(120px,0.55fr)_minmax(130px,0.65fr)_auto] sm:items-center sm:px-5">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600"><FileIcon width={22} height={22} /></span>
                  <div className="min-w-0"><h2 className="truncate text-xs font-extrabold text-[#102a61] sm:text-sm">{item.title}</h2><p className="mt-1 truncate text-[10px] text-slate-500">Dari: {item.reporter} · Diajukan: {formatDate(item.submittedAt)}</p><p className="mt-0.5 line-clamp-1 text-[10px] text-[#354b78]">Catatan: {item.bpdlhNote || item.adminNote || item.transferDescription || "Tidak ada catatan tambahan."}</p></div>
                </div>
                <div className="sm:pl-1"><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${statusStyles[item.submissionStatus] || "bg-slate-100 text-slate-600"}`}>{item.submissionStatus === "Disetujui" ? <CheckIcon width={13} height={13} /> : item.submissionStatus === "Ditolak" ? <CloseIcon width={13} height={13} /> : <ClockIcon width={13} height={13} />}{displayStatus(item.submissionStatus)}</span><p className="mt-1 text-[10px] text-slate-500">Oleh: Admin Keuangan</p></div>
                <p className="inline-flex items-center gap-2 text-[10px] text-[#354b78]"><CalendarIcon width={15} height={15} />{formatDate(item.reviewedAt || item.submittedAt)}</p>
                <button type="button" onClick={() => setSelected(item)} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-blue-200 px-3.5 text-[10px] font-bold text-blue-700 transition hover:bg-blue-50"><EyeIcon width={15} height={15} />Lihat Detail</button>
              </li>
            ))}
          </ul>
        )}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-blue-50 px-4 py-3 sm:px-5">
          <p className="text-[10px] text-[#354b78]">Menampilkan {firstItem}–{lastItem} dari {filtered.length} data</p>
          <nav aria-label="Halaman riwayat analisis" className="flex items-center gap-1">{Array.from({ length: pageCount }, (_, index) => index + 1).slice(0, 3).map((pageNumber) => <button key={pageNumber} type="button" aria-current={page === pageNumber ? "page" : undefined} onClick={() => setPage(pageNumber)} className={`grid size-8 place-items-center rounded-lg border text-[10px] font-bold ${page === pageNumber ? "border-blue-700 bg-blue-700 text-white" : "border-blue-100 bg-white text-[#354b78] hover:bg-blue-50"}`}>{pageNumber}</button>)}{pageCount > 3 && <><span className="px-1 text-[10px] text-slate-400">…</span><button type="button" onClick={() => setPage(pageCount)} className={`grid size-8 place-items-center rounded-lg border text-[10px] font-bold ${page === pageCount ? "border-blue-700 bg-blue-700 text-white" : "border-blue-100 bg-white text-[#354b78] hover:bg-blue-50"}`}>{pageCount}</button></>}<button type="button" aria-label="Halaman berikutnya" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="grid size-8 place-items-center rounded-lg border border-blue-100 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-40"><span aria-hidden="true">→</span></button></nav>
        </footer>
      </section>

      {selected && <div role="presentation" onClick={() => setSelected(null)} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="analysis-detail-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6"><header className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Detail Riwayat Analisis</p><h2 id="analysis-detail-title" className="mt-1 text-lg font-extrabold text-[#102a61]">{selected.title}</h2></div><button type="button" onClick={() => setSelected(null)} aria-label="Tutup detail" className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><CloseIcon width={17} height={17} /></button></header><div className="mt-5 grid gap-3 text-xs"><div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><span className="font-semibold text-slate-500">Status</span><span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${statusStyles[selected.submissionStatus] || "bg-slate-100 text-slate-600"}`}>{displayStatus(selected.submissionStatus)}</span></div><DetailRow label="Pelapor" value={selected.reporter} /><DetailRow label="Kategori" value={selected.category} /><DetailRow label="Lokasi" value={[selected.address, selected.district].filter(Boolean).join(", ")} /><DetailRow label="Tanggal pengajuan" value={formatDate(selected.submittedAt)} /><DetailRow label="Tanggal analisis" value={formatDate(selected.reviewedAt || "")} /><div className="rounded-xl border border-slate-100 p-3"><p className="font-bold text-[#102a61]">Catatan keputusan</p><p className="mt-1 whitespace-pre-wrap leading-relaxed text-slate-600">{selected.bpdlhNote || "Tidak ada catatan keputusan."}</p></div>{selected.transferDescription && <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3"><p className="font-bold text-emerald-800">Deskripsi penyaluran</p><p className="mt-1 whitespace-pre-wrap leading-relaxed text-emerald-800">{selected.transferDescription}</p></div>}</div><button type="button" onClick={() => setSelected(null)} className="mt-5 w-full rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800">Tutup</button></section></div>}
    </div>
  );
}

function SummaryCard({ label, value, tone, icon, trend }: { label: string; value: number; tone: "blue" | "green" | "red"; icon: ReactNode; trend: string }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-rose-100 text-rose-600",
  };
  return <article className="flex min-h-[92px] items-center gap-3 rounded-2xl border border-white bg-white/90 p-3.5 shadow-[0_8px_24px_-18px_rgba(16,39,92,0.28)] sm:p-4"><span className={`grid size-12 shrink-0 place-items-center rounded-full ${tones[tone]}`}>{icon}</span><div className="min-w-0"><p className="truncate text-[10px] font-semibold text-[#354b78] sm:text-xs">{label}</p><div className="mt-0.5 flex flex-wrap items-baseline gap-x-2"><strong className="text-2xl font-extrabold leading-none text-[#102a61]">{value}</strong><span className={`text-[9px] font-semibold ${tone === "red" ? "text-rose-500" : "text-emerald-600"}`}>{trend}</span></div></div></article>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2"><span className="shrink-0 font-semibold text-slate-500">{label}</span><span className="text-right text-slate-700">{value || "—"}</span></div>;
}

function BarsIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16M7 16v-5m5 5V5m5 11V9" /></svg>;
}

function RefreshIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" /></svg>;
}