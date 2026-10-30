"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CalendarIcon, CheckIcon, FileIcon, ListIcon, PinIcon, SearchIcon, ShieldCheckIcon } from "@/components/icons";
import {
  getBpdlhReportSubmissions,
  reviewBpdlhReport,
  type BpdlhReportSubmission,
  type BpdlhSubmissionStatus,
} from "@/lib/bpdlh-report-submissions";

const statuses = ["Menunggu Review", "Disetujui", "Perlu Revisi", "Ditolak"] as const;
const statusStyles: Record<BpdlhSubmissionStatus, string> = {
  "Belum Diajukan": "bg-slate-100 text-slate-600",
  "Menunggu Review": "bg-blue-50 text-blue-700",
  Disetujui: "bg-emerald-50 text-emerald-700",
  "Perlu Revisi": "bg-amber-50 text-amber-700",
  Ditolak: "bg-rose-50 text-rose-700",
};
const categoryStyles = ["bg-blue-50 text-blue-700", "bg-rose-50 text-rose-600", "bg-amber-50 text-amber-700", "bg-emerald-50 text-emerald-700"];
const pageSize = 8;

function formatDate(value: string) {
  if (!value || Number.isNaN(Date.parse(value))) return "—";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function FundingInbox() {
  const [submissions, setSubmissions] = useState<BpdlhReportSubmission[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<BpdlhReportSubmission | null>(null);
  const [note, setNote] = useState("");
  const [transferDescription, setTransferDescription] = useState("");
  const [transferProof, setTransferProof] = useState<File | null>(null);
  const [pendingDecision, setPendingDecision] = useState<Exclude<BpdlhSubmissionStatus, "Belum Diajukan" | "Menunggu Review"> | null>(null);
  const [pending, setPending] = useState(false);

  const refresh = useCallback(async () => {
    const nextSubmissions = await getBpdlhReportSubmissions();
    setSubmissions(nextSubmissions);
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

  const statusCounts = useMemo(() => ({
    Semua: submissions.length,
    "Menunggu Review": submissions.filter((item) => item.submissionStatus === "Menunggu Review").length,
    Disetujui: submissions.filter((item) => item.submissionStatus === "Disetujui").length,
    "Perlu Revisi": submissions.filter((item) => item.submissionStatus === "Perlu Revisi").length,
    Ditolak: submissions.filter((item) => item.submissionStatus === "Ditolak").length,
  }), [submissions]);

  const filtered = useMemo(() => submissions.filter((item) => {
    const text = `${item.reportId} ${item.title} ${item.category} ${item.address} ${item.district} ${item.reporter}`.toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (statusFilter === "Semua Status" || item.submissionStatus === statusFilter);
  }), [query, statusFilter, submissions]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const firstItem = filtered.length ? (page - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(page * pageSize, filtered.length);
  const selectedMapQuery = selected ? [selected.address, selected.district].filter(Boolean).join(", ") : "";
  const selectedMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedMapQuery)}`;
  const selectedMapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(selectedMapQuery)}&output=embed`;

  function openReview(submission: BpdlhReportSubmission) {
    setSelected(submission);
    setNote(submission.bpdlhNote);
    setTransferDescription(submission.transferDescription);
    setTransferProof(null);
    setPendingDecision(null);
    setError("");
    setNotice("");
  }

  async function decide(decision: Exclude<BpdlhSubmissionStatus, "Belum Diajukan" | "Menunggu Review">) {
    if (!selected) return;
    if (decision === "Disetujui" && (!transferDescription.trim() || !transferProof)) {
      setError("Lengkapi deskripsi dan bukti transfer sebelum menyetujui pengajuan.");
      return;
    }
    if (decision !== "Disetujui" && !note.trim()) {
      setError(decision === "Perlu Revisi" ? "Isi catatan revisi sebelum mengirim keputusan." : "Isi alasan penolakan sebelum mengirim keputusan.");
      return;
    }
    setPending(true);
    setError("");
    setNotice("");
    try {
      await reviewBpdlhReport(selected.reportId, decision, note, decision === "Disetujui"
        ? { description: transferDescription, proof: transferProof! }
        : undefined);
      await refresh();
      setSelected(null);
      setPendingDecision(null);
      setNotice(`Keputusan “${decision}” berhasil dikirim ke admin utama.`);
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : "Keputusan gagal disimpan ke database.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)]">
        <header className="flex items-center gap-3 px-4 pt-4 sm:px-5">
          <div className="flex items-center gap-3">
            <div><h1 className="text-sm font-extrabold text-[#102a61] sm:text-base">Kotak Masuk Pengajuan</h1><p className="mt-0.5 text-[10px] text-slate-500">Laporan warga yang dikirim oleh admin utama untuk ditinjau BPDLH.</p></div>
          </div>
          <span className="ml-auto rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">{statusCounts["Menunggu Review"]} menunggu</span>
        </header>

        <div className="flex flex-col gap-3 px-4 pb-4 pt-5 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2" aria-label="Filter status pengajuan">
              {(["Semua", ...statuses] as const).map((item) => {
                const active = statusFilter === (item === "Semua" ? "Semua Status" : item);
                const style = item === "Semua" ? categoryStyles[0] : categoryStyles[statuses.indexOf(item) % categoryStyles.length];
                const count = item === "Semua" ? statusCounts.Semua : statusCounts[item];
                return <button key={item} type="button" aria-pressed={active} onClick={() => { setStatusFilter(item === "Semua" ? "Semua Status" : item); setPage(1); }} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition ${active ? `${style} ring-1 ring-current/15` : `${style} opacity-75 hover:opacity-100`}`}>{item} ({count})</button>;
              })}
            </div>
            <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
              <label className="relative min-w-0 flex-1 sm:w-56 sm:flex-none"><span className="sr-only">Cari pengajuan</span><SearchIcon width={14} height={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari laporan dari admin utama..." className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2 text-[10px] outline-none focus:border-blue-400" /></label>
              <button type="button" aria-expanded={showFilters} onClick={() => setShowFilters((open) => !open)} className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-semibold transition ${showFilters ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}><ListIcon width={13} height={13} />Filter</button>
            </div>
          </div>
          {showFilters && <div className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3"><label className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">Status<select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[10px] font-medium outline-none focus:border-blue-400"><option>Semua Status</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><button type="button" onClick={() => { setStatusFilter("Semua Status"); setQuery(""); setPage(1); }} className="text-[10px] font-bold text-blue-700 hover:underline">Reset filter</button></div>}
        </div>

        {error && !selected && <p role="alert" className="mx-4 mb-3 rounded-lg bg-rose-50 px-3 py-2 text-[10px] font-semibold text-rose-700 sm:mx-5">Gagal memuat data atau keputusan dari database. Periksa koneksi dan role akun BPDLH. {error}</p>}
        {notice && <p role="status" className="mx-4 mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-700 sm:mx-5">{notice}</p>}

        <div className="overflow-x-auto px-4 sm:px-5">
          <table className="w-full min-w-[780px] border-separate border-spacing-0 text-left text-[10px]">
            <thead><tr className="bg-slate-50 text-slate-500"><th className="rounded-l-lg border-y border-l border-slate-100 px-3 py-3 font-bold">Prioritas</th><th className="border-y border-slate-100 px-3 py-3 font-bold">Pengajuan</th><th className="border-y border-slate-100 px-3 py-3 font-bold">Pelapor</th><th className="border-y border-slate-100 px-3 py-3 font-bold">Tanggal</th><th className="border-y border-slate-100 px-3 py-3 font-bold">Status BPDLH</th><th className="rounded-r-lg border-y border-r border-slate-100 px-3 py-3 text-right font-bold">Aksi</th></tr></thead>
            <tbody>
              {visible.map((submission) => <tr key={submission.reportId} className="hover:bg-blue-50/30">
                <td className="border-b border-slate-100 px-3 py-3"><span className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-[9px] font-extrabold uppercase text-blue-700">Laporan Warga</span></td>
                <td className="border-b border-slate-100 px-3 py-3"><span className="block max-w-80 truncate font-bold text-[#102a61]">{submission.title}</span><span className="mt-1 block max-w-80 truncate text-[9px] text-slate-500">{submission.category} · {[submission.address, submission.district].filter(Boolean).join(", ")}</span></td>
                <td className="border-b border-slate-100 px-3 py-3 font-semibold text-slate-600">{submission.reporter}</td>
                <td className="whitespace-nowrap border-b border-slate-100 px-3 py-3 text-slate-600">{formatDate(submission.submittedAt)}</td>
                <td className="border-b border-slate-100 px-3 py-3"><span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-bold ${statusStyles[submission.submissionStatus]}`}>{submission.submissionStatus}</span></td>
                <td className="border-b border-slate-100 px-3 py-3 text-right">{submission.submissionStatus === "Menunggu Review" ? <button type="button" onClick={() => openReview(submission)} className="inline-flex rounded-lg bg-blue-700 px-3 py-2 text-[9px] font-bold text-white hover:bg-blue-800">Review</button> : <button type="button" onClick={() => openReview(submission)} className="inline-flex rounded-lg border border-slate-200 px-3 py-2 text-[9px] font-bold text-slate-600 hover:bg-slate-50">Lihat Keputusan</button>}</td>
              </tr>)}
              {!loading && visible.length === 0 && <tr><td colSpan={6} className="px-3 py-12 text-center text-xs text-slate-500">{error ? "Data pengajuan tidak tersedia." : "Belum ada pengajuan dari admin utama yang cocok dengan pencarian atau filter."}</td></tr>}
              {loading && <tr><td colSpan={6} className="px-3 py-12 text-center text-xs text-slate-500">Memuat pengajuan dari database…</td></tr>}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5"><p className="text-[9px] text-slate-500">Menampilkan {firstItem}–{lastItem} dari {filtered.length} data</p><nav aria-label="Navigasi halaman pengajuan" className="flex items-center gap-1"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} aria-label="Halaman sebelumnya" className="grid size-7 place-items-center rounded-full text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-40">‹</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button key={pageNumber} type="button" aria-current={page === pageNumber ? "page" : undefined} onClick={() => setPage(pageNumber)} className={`grid size-7 place-items-center rounded-full text-[10px] font-bold ${page === pageNumber ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{pageNumber}</button>)}<button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} aria-label="Halaman berikutnya" className="grid size-7 place-items-center rounded-full text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-40">›</button></nav><span className="text-[9px] text-slate-400">Data live dari Supabase</span></footer>
      </section>

      {selected && <div role="presentation" onClick={() => { setSelected(null); setPendingDecision(null); }} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-5"><section role="dialog" aria-modal="true" aria-labelledby="bpdlh-review-title" onClick={(event) => event.stopPropagation()} className="max-h-[94dvh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-[#f7faff] shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-3xl border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
          <div className="flex min-w-0 items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><ShieldCheckIcon width={21} height={21} /></span><div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-700">Review laporan warga</p><h2 id="bpdlh-review-title" className="mt-1 truncate text-lg font-extrabold text-[#102a61] sm:text-xl">{selected.title}</h2><p className="mt-1 text-xs text-slate-500">Periksa detail dan bukti laporan sebelum memberikan keputusan.</p></div></div>
          <button type="button" onClick={() => { setSelected(null); setPendingDecision(null); }} aria-label="Tutup review" className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50">×</button>
        </header>

        <div className="grid items-start gap-4 p-4 sm:gap-5 sm:p-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(330px,0.75fr)]">
          <div className="grid gap-4">
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4"><div><p className="text-[10px] font-bold text-blue-700">RINGKASAN LAPORAN</p><h3 className="mt-1 text-base font-extrabold text-[#102a61]">{selected.title}</h3><p className="mt-1 text-xs text-slate-500">Kategori: <strong className="text-slate-700">{selected.category}</strong></p></div><span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${statusStyles[selected.submissionStatus]}`}>{selected.submissionStatus}</span></div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="flex gap-3 text-xs"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><CalendarIcon width={17} height={17} /></span><span><strong className="block text-[#102a61]">Tanggal laporan</strong><span className="mt-1 block text-slate-500">{formatDate(selected.createdAt)} · Diajukan {formatDate(selected.submittedAt)}</span></span></div><div className="flex gap-3 text-xs"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600"><PinIcon width={17} height={17} /></span><span><strong className="block text-[#102a61]">Lokasi kejadian</strong><span className="mt-1 block text-slate-500">{[selected.address, selected.district].filter(Boolean).join(", ")}</span></span></div></div>
              <div className="mt-4 rounded-xl bg-slate-50 p-4"><h4 className="text-xs font-extrabold text-[#102a61]">Deskripsi warga</h4><p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{selected.description}</p></div>
              {selected.adminNote && <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4"><h4 className="text-xs font-extrabold text-blue-900">Catatan admin utama</h4><p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-blue-900/80">{selected.adminNote}</p></div>}
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"><div className="mb-3 flex items-center gap-2"><FileIcon width={17} height={17} className="text-blue-700" /><h3 className="text-sm font-extrabold text-[#102a61]">Foto bukti laporan</h3></div>{selected.photoUrl ? <a href={selected.photoUrl} target="_blank" rel="noreferrer" className="group relative block h-56 overflow-hidden rounded-xl bg-slate-100 sm:h-72"><Image src={selected.photoUrl} alt={`Bukti laporan ${selected.title}`} fill unoptimized sizes="(max-width: 1280px) 100vw, 700px" className="object-contain transition group-hover:scale-[1.01]" /><span className="absolute bottom-3 right-3 rounded-lg bg-slate-950/75 px-3 py-2 text-[10px] font-bold text-white">Buka gambar penuh ↗</span></a> : <div className="grid h-40 place-items-center rounded-xl bg-slate-50 text-xs text-slate-500">Foto laporan tidak tersedia.</div>}</section>

            {selectedMapQuery && <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"><div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="text-sm font-extrabold text-[#102a61]">Peta lokasi</h3><p className="mt-1 text-[10px] text-slate-500">Lokasi berdasarkan alamat yang dimasukkan warga.</p></div><a href={selectedMapUrl} target="_blank" rel="noreferrer" className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-[10px] font-bold text-blue-700 hover:bg-blue-100">Buka Maps ↗</a></div><iframe title={`Peta lokasi laporan ${selected.title}`} src={selectedMapEmbedUrl} className="h-52 w-full rounded-xl border-0 sm:h-64" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></section>}
          </div>

          <aside className="grid gap-4 xl:sticky xl:top-24">
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center gap-3 border-b border-slate-100 pb-4"><span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><ShieldCheckIcon width={20} height={20} /></span><div><h3 className="text-sm font-extrabold text-[#102a61]">Keputusan verifikasi</h3><p className="mt-1 text-[10px] text-slate-500">Pelapor: {selected.reporter}</p></div></div>
              {selected.submissionStatus === "Menunggu Review" ? <>
                {pendingDecision === "Disetujui" ? <div className="mt-4 grid gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"><div><h4 className="text-sm font-extrabold text-emerald-900">Bukti transfer & deskripsi</h4><p className="mt-1 text-[10px] leading-relaxed text-emerald-800">Lampirkan bukti penyaluran dan keterangannya sebelum menyetujui laporan.</p></div>
                  <label htmlFor="bpdlh-transfer-proof" className="grid gap-1.5 text-xs font-bold text-slate-700">Bukti transfer <span className="font-normal text-rose-600">Wajib · gambar atau PDF</span><input id="bpdlh-transfer-proof" type="file" accept="image/*,application/pdf" onChange={(event) => { setTransferProof(event.target.files?.[0] ?? null); setError(""); }} className="block w-full rounded-xl border border-slate-200 bg-white p-2 text-[10px] file:mr-2 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-blue-700" /></label>
                  {transferProof && <p className="truncate rounded-lg bg-white px-3 py-2 text-[10px] font-semibold text-emerald-800">Dipilih: {transferProof.name}</p>}
                  <label htmlFor="bpdlh-transfer-description" className="grid gap-1.5 text-xs font-bold text-slate-700">Deskripsi transfer <span className="font-normal text-rose-600">Wajib diisi</span><textarea id="bpdlh-transfer-description" value={transferDescription} onChange={(event) => { setTransferDescription(event.target.value); setError(""); }} placeholder="Nominal, tanggal, tujuan, atau keterangan penyaluran..." rows={4} className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-normal leading-relaxed outline-none focus:border-blue-400" /></label>
                  {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] text-rose-700">{error}</p>}
                  <div className="grid grid-cols-2 gap-2"><button type="button" disabled={pending} onClick={() => setPendingDecision(null)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Kembali</button><button type="button" disabled={pending} onClick={() => void decide("Disetujui")} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"><CheckIcon width={15} height={15} />{pending ? "Menyimpan…" : "Konfirmasi"}</button></div>
                </div> : <>
                  <label htmlFor="bpdlh-decision-note" className="mt-4 grid gap-2 text-xs font-bold text-slate-700">Catatan untuk admin utama <span className="font-normal text-slate-500">Wajib untuk revisi atau penolakan.</span><textarea id="bpdlh-decision-note" value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Jelaskan hasil pemeriksaan, hal yang perlu diperbaiki, atau alasan penolakan..." className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-normal leading-relaxed outline-none focus:border-blue-400" /></label>
                  {error && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] text-rose-700">{error}</p>}
                  <div className="mt-4 grid gap-2"><button type="button" disabled={pending} onClick={() => { setError(""); setPendingDecision("Disetujui"); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"><CheckIcon width={16} height={16} />Setujui pengajuan</button><div className="grid grid-cols-2 gap-2"><button type="button" disabled={pending} onClick={() => void decide("Perlu Revisi")} className="rounded-xl bg-amber-500 px-3 py-2.5 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-60">Minta revisi</button><button type="button" disabled={pending} onClick={() => void decide("Ditolak")} className="rounded-xl bg-rose-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60">Tolak</button></div></div>
                </>}
              </> : <div className="mt-4 grid gap-3"><div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3"><span className={`grid size-8 place-items-center rounded-full ${statusStyles[selected.submissionStatus]}`}><CheckIcon width={16} height={16} /></span><span><strong className="block text-xs text-[#102a61]">{selected.submissionStatus}</strong><span className="text-[10px] text-slate-500">Keputusan tersimpan</span></span></div>{selected.bpdlhNote && <div className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900"><strong className="block">Catatan keputusan</strong>{selected.bpdlhNote}</div>}{selected.transferDescription && <div className="rounded-xl bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900"><strong className="block">Deskripsi transfer</strong>{selected.transferDescription}</div>}{selected.transferProofUrl && <a href={selected.transferProofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-3 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"><FileIcon width={15} height={15} />Buka bukti transfer{selected.transferProofName ? ` · ${selected.transferProofName}` : ""}</a>}</div>}
            </section>
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><h3 className="text-xs font-extrabold text-[#102a61]">Alur status</h3><ol className="mt-4 grid gap-4 border-l-2 border-blue-100 pl-4 text-[10px]"><li className="relative"><span className="absolute -left-[1.38rem] top-0.5 size-2.5 rounded-full bg-blue-600 ring-2 ring-blue-100" /><strong className="block text-slate-700">Dikirim admin utama</strong><span className="mt-0.5 block text-slate-500">{formatDate(selected.submittedAt)}</span></li><li className="relative"><span className={`absolute -left-[1.38rem] top-0.5 size-2.5 rounded-full ${selected.submissionStatus === "Menunggu Review" ? "bg-amber-500 ring-2 ring-amber-100" : "bg-emerald-500 ring-2 ring-emerald-100"}`} /><strong className="block text-slate-700">Review BPDLH</strong><span className="mt-0.5 block text-slate-500">{selected.reviewedAt ? formatDate(selected.reviewedAt) : "Menunggu keputusan"}</span></li></ol></section>
          </aside>
        </div>
      </section></div>}
    </>
  );
}
