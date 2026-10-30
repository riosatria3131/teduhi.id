"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckIcon, ClockIcon, EyeIcon, SearchIcon, SendIcon } from "@/components/icons";
import { getMainAdminBpdlhSubmissions, submitReportToBpdlh, type BpdlhReportSubmission } from "@/lib/bpdlh-report-submissions";
import { subscribeToLocalReports } from "@/lib/portal-store";

const statusStyle: Record<string, string> = {
  "Belum Diajukan": "bg-slate-100 text-slate-600",
  "Menunggu Review": "bg-blue-50 text-blue-700",
  Disetujui: "bg-emerald-50 text-emerald-700",
  "Perlu Revisi": "bg-amber-50 text-amber-700",
  Ditolak: "bg-rose-50 text-rose-700",
};

function formatDate(value: string) {
  if (!value || Number.isNaN(Date.parse(value))) return "—";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return fallback;
}

export function AdminBpdlhSubmissions() {
  const [reports, setReports] = useState<BpdlhReportSubmission[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sendTargetIds, setSendTargetIds] = useState<string[]>([]);
  const [adminDescription, setAdminDescription] = useState("");
  const [detailReport, setDetailReport] = useState<BpdlhReportSubmission | null>(null);

  const refreshReports = useCallback(async () => {
    const data = await getMainAdminBpdlhSubmissions();
    setReports(data);
    setSelectedIds([]);
    setError("");
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        await refreshReports();
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Laporan gagal dimuat dari Supabase.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void refresh();
    const unsubscribe = subscribeToLocalReports(() => void refresh());
    const poll = window.setInterval(() => void refresh(), 30000);
    return () => {
      active = false;
      unsubscribe();
      window.clearInterval(poll);
    };
  }, [refreshReports]);

  const counts = useMemo(() => ({
    ready: reports.filter((report) => report.submissionStatus === "Belum Diajukan" || report.submissionStatus === "Perlu Revisi").length,
    waiting: reports.filter((report) => report.submissionStatus === "Menunggu Review").length,
    approved: reports.filter((report) => report.submissionStatus === "Disetujui").length,
  }), [reports]);

  const filteredReports = useMemo(() => reports.filter((report) => {
    const haystack = `${report.reportId} ${report.title} ${report.category} ${report.address} ${report.district} ${report.reporter}`.toLowerCase();
    return haystack.includes(search.trim().toLowerCase()) && (statusFilter === "Semua Status" || report.submissionStatus === statusFilter);
  }), [reports, search, statusFilter]);

  function openSendDialog(ids: string[]) {
    const readyIds = ids.filter((id) => reports.some((report) => report.reportId === id && (report.submissionStatus === "Belum Diajukan" || report.submissionStatus === "Perlu Revisi")));
    if (!readyIds.length) return;
    setSendTargetIds(readyIds);
    setAdminDescription("");
    setError("");
    setNotice("");
  }

  async function forwardReports() {
    const readyIds = sendTargetIds;
    if (!readyIds.length) return;
    if (adminDescription.trim().length < 10) {
      setError("Isi deskripsi laporan minimal 10 karakter sebelum dikirim ke BPDLH.");
      return;
    }
    setPending(true);
    setError("");
    setNotice("");
    const sentIds: string[] = [];
    const failures: { id: string; message: string }[] = [];
    try {
      for (const id of readyIds) {
        try {
          await submitReportToBpdlh(id, adminDescription);
          sentIds.push(id);
        } catch (actionError) {
          failures.push({ id, message: getErrorMessage(actionError, "Pengajuan gagal diteruskan.") });
        }
      }

      if (failures.length) {
        setSendTargetIds(failures.map(({ id }) => id));
      } else {
        setSendTargetIds([]);
      }

      try {
        await refreshReports();
      } catch (refreshError) {
        const detail = getErrorMessage(refreshError, "Daftar tidak dapat dimuat ulang.");
        failures.push({ id: "refresh", message: `Daftar gagal diperbarui: ${detail}` });
      }
      if (sentIds.length) {
        setNotice(`${sentIds.length} laporan berhasil diteruskan dan tersimpan di database.`);
      }
      if (failures.length) {
        const sendFailures = failures.filter(({ id }) => id !== "refresh");
        const refreshFailure = failures.find(({ id }) => id === "refresh");
        const messages = [
          sendFailures.length ? `${sendFailures.length} laporan gagal dikirim. ${sendFailures[0].message}` : "",
          refreshFailure ? `Pengiriman telah diproses, tetapi daftar gagal diperbarui: ${refreshFailure.message}` : "",
          sendFailures.length > 1 ? `Ada ${sendFailures.length - 1} laporan lain yang gagal.` : "",
        ].filter(Boolean);
        setError(messages.join(" "));
      }
    } finally {
      setPending(false);
    }
  }

  function toggleReport(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  const visibleReadyIds = filteredReports.filter((report) => report.submissionStatus === "Belum Diajukan" || report.submissionStatus === "Perlu Revisi").map((report) => report.reportId);
  const allVisibleSelected = visibleReadyIds.length > 0 && visibleReadyIds.every((id) => selectedIds.includes(id));

  return (
    <div className="mx-auto grid max-w-[1500px] gap-4">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#102a61] sm:text-2xl">Pengajuan Laporan ke BPDLH</h1>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500 sm:text-sm">Teruskan laporan warga yang sudah masuk dan pantau tindak lanjutnya berdasarkan status laporan di database.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <SummaryCard label="Siap Diajukan" value={counts.ready} icon={<SendIcon width={16} height={16} />} tone="blue" />
          <SummaryCard label="Menunggu Verifikasi" value={counts.waiting} icon={<ClockIcon width={16} height={16} />} tone="orange" />
          <SummaryCard label="Disetujui BPDLH" value={counts.approved} icon={<CheckIcon width={16} height={16} />} tone="green" />
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:px-5">
          <label className="relative block min-w-48 flex-1 sm:max-w-sm">
            <span className="sr-only">Cari laporan warga</span>
            <SearchIcon width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari laporan warga..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-blue-400" />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <select aria-label="Filter status laporan" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-blue-400">
              <option>Semua Status</option>
              <option>Belum Diajukan</option>
              <option>Menunggu Review</option>
              <option>Disetujui</option>
              <option>Perlu Revisi</option>
              <option>Ditolak</option>
            </select>
            <button type="button" disabled={selectedIds.length === 0 || pending} onClick={() => openSendDialog(selectedIds)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-700 px-3 text-xs font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4">
              <SendIcon width={15} height={15} />{pending ? "Mengirim…" : "Kirim Laporan Terpilih"}
            </button>
          </div>
        </div>

        {error && <p role="alert" className="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 sm:mx-5">Laporan gagal dimuat atau diperbarui dari Supabase. Periksa koneksi dan izin akun admin. {error}</p>}
        {notice && <p role="status" className="mx-4 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 sm:mx-5">{notice}</p>}

        <div className="overflow-x-auto px-4 pb-2 pt-3 sm:px-5">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-xs">
            <thead><tr className="bg-slate-50 text-slate-500">
              <th className="rounded-l-xl border-y border-l border-slate-100 px-3 py-3"><input type="checkbox" aria-label="Pilih semua laporan siap diajukan" checked={allVisibleSelected} onChange={() => setSelectedIds((current) => allVisibleSelected ? current.filter((id) => !visibleReadyIds.includes(id)) : [...new Set([...current, ...visibleReadyIds])])} className="size-3.5 accent-blue-700" /></th>
              <th className="border-y border-slate-100 px-3 py-3 font-bold">No</th><th className="border-y border-slate-100 px-3 py-3 font-bold">Laporan Warga</th><th className="border-y border-slate-100 px-3 py-3 font-bold">Tanggal</th><th className="border-y border-slate-100 px-3 py-3 font-bold">Status</th><th className="rounded-r-xl border-y border-r border-slate-100 px-3 py-3 text-right font-bold">Aksi</th>
            </tr></thead>
            <tbody>
              {filteredReports.map((report, index) => {
                const status = report.submissionStatus;
                const ready = report.submissionStatus === "Belum Diajukan" || report.submissionStatus === "Perlu Revisi";
                return <tr key={report.reportId} className="hover:bg-blue-50/30">
                  <td className="border-b border-slate-100 px-3 py-3"><input type="checkbox" aria-label={`Pilih laporan ${report.title}`} checked={selectedIds.includes(report.reportId)} disabled={!ready} onChange={() => toggleReport(report.reportId)} className="size-3.5 accent-blue-700 disabled:opacity-30" /></td>
                  <td className="border-b border-slate-100 px-3 py-3 text-slate-500">{index + 1}</td>
                  <td className="border-b border-slate-100 px-3 py-3"><span className="block max-w-72 truncate font-semibold text-[#102a61]">{report.title}</span><span className="mt-1 block text-[10px] text-slate-500">{report.category} · {report.address}{report.district ? `, ${report.district}` : ""}</span><span className="mt-1 block text-[10px] text-slate-400">Pelapor: {report.reporter}</span></td>
                  <td className="whitespace-nowrap border-b border-slate-100 px-3 py-3 text-slate-600">{formatDate(report.submittedAt)}</td>
                  <td className="border-b border-slate-100 px-3 py-3"><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[status] || "bg-slate-100 text-slate-600"}`}>{status}</span></td>
                  <td className="border-b border-slate-100 px-3 py-3 text-right"><div className="inline-flex items-center gap-2">
                    <button type="button" onClick={() => setDetailReport(report)} aria-label={`Lihat detail BPDLH ${report.title}`} title="Lihat deskripsi dan keputusan BPDLH" className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-700"><EyeIcon width={15} height={15} /></button>
                    {ready && <button type="button" disabled={pending} onClick={() => openSendDialog([report.reportId])} className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-700 px-2.5 text-[10px] font-bold text-white hover:bg-blue-800 disabled:opacity-60"><SendIcon width={13} height={13} />{report.submissionStatus === "Perlu Revisi" ? "Kirim Ulang" : "Kirim ke BPDLH"}</button>}
                  </div></td>
                </tr>;
              })}
              {!loading && filteredReports.length === 0 && <tr><td colSpan={6} className="px-3 py-12 text-center text-slate-500">{error ? "Data laporan tidak tersedia." : "Belum ada laporan yang cocok dengan pencarian atau filter."}</td></tr>}
              {loading && <tr><td colSpan={6} className="px-3 py-12 text-center text-slate-500">Memuat laporan dari database…</td></tr>}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-[10px] text-slate-500 sm:px-5"><span>Menampilkan {filteredReports.length} dari {reports.length} laporan</span><span>Data laporan diambil langsung dari database Supabase.</span></footer>
      </section>
      {detailReport && <div role="presentation" onClick={() => setDetailReport(null)} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="bpdlh-result-title" onClick={(event) => event.stopPropagation()} className="flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex shrink-0 items-start justify-between gap-4 rounded-t-3xl bg-slate-50/70 px-5 py-4 sm:px-6"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-700">Hasil review BPDLH</p><h2 id="bpdlh-result-title" className="mt-1 text-lg font-extrabold text-[#102a61]">{detailReport.title}</h2></div><button type="button" onClick={() => setDetailReport(null)} aria-label="Tutup detail" className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">×</button></header>
        <div className="hide-scrollbar grid min-h-0 flex-1 gap-4 overflow-y-auto p-5 sm:p-6"><div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><span className="text-xs font-semibold text-slate-600">Status pengajuan</span><span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${statusStyle[detailReport.submissionStatus] || "bg-slate-100 text-slate-600"}`}>{detailReport.submissionStatus}</span></div>
          <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"><h3 className="text-xs font-extrabold text-blue-900">Deskripsi dari admin utama</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-blue-950">{detailReport.adminNote || "Tidak ada deskripsi tambahan dari admin utama."}</p></section>
          <section className="rounded-xl border border-slate-200 p-4"><h3 className="text-xs font-extrabold text-[#102a61]">Catatan keputusan BPDLH</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{detailReport.bpdlhNote || "BPDLH belum menambahkan catatan keputusan."}</p></section>
          {detailReport.transferDescription && <section className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"><h3 className="text-xs font-extrabold text-emerald-900">Deskripsi transfer dari BPDLH</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-emerald-950">{detailReport.transferDescription}</p></section>}
          {detailReport.transferProofUrl && <a href={detailReport.transferProofUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-200 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50">Buka bukti transfer{detailReport.transferProofName ? ` · ${detailReport.transferProofName}` : ""}</a>}
          <p className="text-[10px] text-slate-400">Ditinjau: {detailReport.reviewedAt ? formatDate(detailReport.reviewedAt) : "Belum ditinjau"}</p>
        </div>
        <footer className="flex shrink-0 justify-end gap-2 rounded-b-3xl bg-white px-5 py-4 sm:px-6"><Link href={`/admin/laporan/${encodeURIComponent(detailReport.reportId)}`} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Buka detail laporan warga</Link><button type="button" onClick={() => setDetailReport(null)} className="rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800">Tutup</button></footer>
      </section></div>}
      {sendTargetIds.length > 0 && <div role="presentation" onClick={() => setSendTargetIds([])} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="send-bpdlh-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="border-b border-slate-100 bg-linear-to-r from-blue-50 to-white px-5 py-5 sm:px-6"><p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-blue-700">Penerusan laporan</p><h2 id="send-bpdlh-title" className="mt-1 text-lg font-extrabold text-[#102a61]">Lengkapi deskripsi sebelum dikirim</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">Informasi ini akan ikut bersama laporan agar admin BPDLH memahami kebutuhan penanganannya.</p></header>
        <div className="grid gap-4 p-5 sm:p-6"><div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3"><p className="text-[10px] font-bold text-blue-800">{sendTargetIds.length} laporan dipilih</p><ul className="mt-2 grid gap-1.5">{sendTargetIds.slice(0, 4).map((id) => { const report = reports.find((item) => item.reportId === id); return <li key={id} className="truncate text-xs font-semibold text-[#102a61]">• {report?.title ?? id}</li>; })}{sendTargetIds.length > 4 && <li className="text-[10px] text-slate-500">dan {sendTargetIds.length - 4} laporan lainnya</li>}</ul></div>
          <label htmlFor="admin-bpdlh-description" className="grid gap-2 text-xs font-bold text-slate-700">Deskripsi untuk admin BPDLH <span className="font-normal text-slate-500">Jelaskan konteks laporan, dampak, urgensi, atau tindak lanjut yang diminta. Minimal 10 karakter.</span><textarea id="admin-bpdlh-description" required minLength={10} value={adminDescription} onChange={(event) => { setAdminDescription(event.target.value); setError(""); }} rows={5} placeholder="Contoh: Laporan sudah diverifikasi oleh admin. Mohon tinjau kebutuhan penanganan dan rekomendasi dukungan untuk lokasi terdampak..." className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal leading-relaxed outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></label>
          {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
        </div><footer className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6"><button type="button" disabled={pending} onClick={() => setSendTargetIds([])} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Batal</button><button type="button" disabled={pending || adminDescription.trim().length < 10} onClick={() => void forwardReports()} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"><SendIcon width={15} height={15} />{pending ? "Mengirim…" : "Kirim ke BPDLH"}</button></footer>
      </section></div>}
    </div>
  );
}

function SummaryCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: "blue" | "orange" | "green" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-700",
  };
  return <article className="flex min-w-20 items-center gap-2 rounded-xl border border-slate-100 bg-white px-2.5 py-2 shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)] sm:min-w-28 sm:gap-3 sm:px-3.5 sm:py-3"><span className={`grid size-8 shrink-0 place-items-center rounded-full ${tones[tone]}`}>{icon}</span><span className="min-w-0"><span className="block text-sm font-extrabold leading-tight text-[#102a61] sm:text-base">{value}</span><span className="block max-w-20 truncate text-[8px] leading-tight text-slate-500 sm:max-w-28 sm:text-[9px]">{label}</span></span></article>;
}