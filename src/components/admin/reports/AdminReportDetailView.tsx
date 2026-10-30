"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeftIcon, CalendarIcon, PinIcon, UserIcon } from "@/components/icons";
import { AdminPageHeading } from "@/components/admin/shared/AdminPageHeading";
import { AdminReportStatus } from "@/components/admin/reports/AdminReportStatus";
import { getAdminReport, getAdminReportStatusHistory, type LocalReport, type ReportStatusHistoryEntry } from "@/lib/portal-store";
import type { ReportStatus } from "@/components/portal/portal-data";

type AdminReport = {
  id: string;
  title: string;
  category: string;
  reporter: string;
  location: string;
  date: string;
  status: ReportStatus;
  description: string;
  photo: string | null;
  address: string;
  district: string;
  latitude: string;
  longitude: string;
};

const REPORT_STATUS_STEPS: ReportStatus[] = ["Menunggu Verifikasi", "Terverifikasi", "Sedang Diproses", "Selesai", "Ditolak"];

function fromCitizenReport(report: LocalReport): AdminReport {
  return {
    id: report.id,
    title: report.title,
    category: report.category,
    reporter: report.reporterName ?? report.ownerEmail,
    location: `${report.address}, ${report.district}`,
    date: new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(report.createdAt)),
    status: report.status,
    description: report.description,
    photo: report.photo,
    address: report.address,
    district: report.district,
    latitude: report.latitude,
    longitude: report.longitude,
  };
}

export function AdminReportDetailView({ id }: { id: string }) {
  const [report, setReport] = useState<AdminReport | null>(null);
  const [statusHistory, setStatusHistory] = useState<ReportStatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const citizenReport = await getAdminReport(id);
        if (!active || !citizenReport) return;
        setReport(fromCitizenReport(citizenReport));
        setLoadError("");
        try {
          setStatusHistory(await getAdminReportStatusHistory(id));
          setHistoryError("");
        } catch {
          if (active) setHistoryError("Riwayat tanggal status belum tersedia. Pastikan migrasi riwayat status sudah diterapkan di Supabase.");
        }
      } catch (error: unknown) {
        if (active) setLoadError(error instanceof Error
          ? `Detail laporan gagal dimuat: ${error.message}`
          : "Detail laporan gagal dimuat. Periksa koneksi dan izin akses admin di Supabase.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading && !report) return <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">Memuat detail laporan…</p>;
  if (!report) return <section className="rounded-2xl bg-white p-6"><h2 className="font-bold text-[#102a61]">{loadError ? "Detail laporan gagal dimuat" : "Laporan tidak ditemukan"}</h2><p role={loadError ? "alert" : undefined} className="mt-2 text-sm text-slate-500">{loadError || "Laporan tidak tersedia atau admin tidak memiliki izin untuk melihatnya."}</p><Link href="/admin/laporan" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-700"><ArrowLeftIcon width={17} height={17} />Kembali ke laporan</Link></section>;

  const mapQuery = [report.latitude && report.longitude ? `${report.latitude},${report.longitude}` : "", report.address, report.district]
    .filter(Boolean)
    .join(", ");
  const encodedMapQuery = encodeURIComponent(mapQuery);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedMapQuery}`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodedMapQuery}&output=embed`;
  const currentStatusIndex = REPORT_STATUS_STEPS.indexOf(report.status);

  return (
    <div className="grid gap-6">
      <Link href="/admin/laporan" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900">
        <ArrowLeftIcon width={17} height={17} /> Kembali ke laporan
      </Link>
      <AdminPageHeading eyebrow="Detail laporan" title="Detail Laporan" description="Tinjau informasi laporan dan perbarui tindak lanjutnya." />
      {loadError && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{loadError}</p>}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div><h2 className="text-xl font-extrabold text-[#102a61]">{report.title}</h2></div>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">{report.status}</span>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.72fr)]">
            <div className="grid content-start gap-4">
              <p className="flex gap-3 text-sm"><PinIcon width={18} height={18} className="shrink-0 text-blue-600" /><span><b className="block text-[#102a61]">Lokasi</b><span className="text-slate-500">{report.location}</span></span></p>
              <p className="flex min-w-0 gap-3 text-sm"><CalendarIcon width={18} height={18} className="mt-0.5 shrink-0 text-blue-600" /><span className="min-w-0"><b className="block text-[#102a61]">Tanggal Laporan</b><span className="mt-0.5 block break-words text-slate-500">{report.date}</span></span></p>
              <p className="flex gap-3 text-sm"><span className="grid size-[18px] shrink-0 place-items-center text-blue-600">#</span><span><b className="block text-[#102a61]">Kategori</b><span className="text-slate-500">{report.category}</span></span></p>
            </div>
            {report.latitude && report.longitude && <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600"><b className="block text-[#102a61]">Koordinat laporan</b>{report.latitude}, {report.longitude}</p>}
            <section aria-labelledby="report-photo-title" className="min-w-0">
              <h3 id="report-photo-title" className="mb-2 text-sm font-extrabold text-[#102a61]">Foto Bukti Laporan</h3>
              {report.photo ? (
                <a href={report.photo} target="_blank" rel="noreferrer" className="group relative block h-44 overflow-hidden rounded-xl bg-slate-100 sm:h-52 lg:h-56">
                  <Image src={report.photo} alt={`Foto bukti laporan: ${report.title}`} fill unoptimized className="object-cover transition group-hover:scale-[1.02]" sizes="(max-width: 1024px) 100vw, 320px" />
                  <span className="absolute bottom-2 right-2 rounded-lg bg-slate-950/75 px-2.5 py-1.5 text-[10px] font-bold text-white">Lihat ukuran penuh ↗</span>
                </a>
              ) : (
                <div className="grid h-44 place-items-center rounded-xl bg-linear-to-br from-slate-100 via-blue-50 to-blue-100 p-4 text-center lg:h-56">
                  <div><span className="mx-auto grid size-12 place-items-center rounded-xl bg-white text-blue-600 shadow-sm"><PinIcon width={22} height={22} /></span><p className="mt-2 text-xs font-semibold text-slate-500">Foto belum tersedia</p><span className="text-[10px] text-slate-400">Tidak ada lampiran pada laporan ini</span></div>
                </div>
              )}
            </section>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5"><h3 className="text-sm font-extrabold text-[#102a61]">Deskripsi</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{report.description}</p></div>

          {mapQuery && <section aria-labelledby="report-map-title" className="mt-6 border-t border-slate-100 pt-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h3 id="report-map-title" className="text-sm font-extrabold text-[#102a61]">Peta Lokasi Laporan</h3><p className="mt-1 text-xs text-slate-500">Lokasi berdasarkan koordinat atau alamat yang dilaporkan warga.</p></div><a href={mapUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800">Buka Google Maps ↗</a></div>
            <iframe title={`Peta lokasi laporan ${report.title}`} src={mapEmbedUrl} className="h-44 w-full rounded-xl border-0 sm:h-52" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </section>}

          <div className="mt-6 flex items-center gap-3 rounded-xl bg-slate-50 p-4"><span className="grid size-10 place-items-center rounded-full bg-blue-100 text-blue-700"><UserIcon width={19} height={19} /></span><div><p className="text-sm font-bold text-[#102a61]">{report.reporter}</p><p className="text-xs text-slate-500">Warga · Pelapor</p></div></div>
        </article>
        <aside className="grid min-w-0 gap-5"><section className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)]"><h2 className="font-extrabold text-[#102a61]">Riwayat Status</h2>{historyError && <p role="status" className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">{historyError}</p>}<ol className="mt-5 grid gap-5 border-l-2 border-blue-100 pl-5">
          {REPORT_STATUS_STEPS.map((step, index) => {
            const reached = currentStatusIndex >= index;
            const current = currentStatusIndex === index;
            const statusEvent = [...statusHistory].reverse().find((event) => event.status === step);
            const eventDate = statusEvent
              ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(statusEvent.changedAt))
              : index === 0 ? report.date : reached ? "Tanggal belum tercatat" : "Belum dimulai";
            return <li key={step} className="relative min-w-0">
              <span className={`absolute -left-[1.63rem] top-1 size-3 rounded-full border-2 border-white ring-2 ${current ? "bg-amber-500 ring-amber-100" : reached ? "bg-blue-600 ring-blue-100" : "bg-slate-300 ring-slate-100"}`} />
              <p className={`break-words text-sm font-bold ${current ? "text-[#102a61]" : reached ? "text-slate-700" : "text-slate-400"}`}>{step}</p>
              <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">{eventDate}</p>
            </li>;
          })}
        </ol><AdminReportStatus reportId={report.id} initialStatus={report.status} onStatusUpdated={(status) => {
          const changedAt = new Date().toISOString();
          const statusChanged = status !== report.status;
          setReport((current) => current ? { ...current, status } : current);
          if (statusChanged) {
            setStatusHistory((current) => [...current, { status, changedAt }]);
          }
          void getAdminReportStatusHistory(report.id).then((history) => {
            setStatusHistory((current) => {
              const changedAtMs = Date.parse(changedAt);
              const hasSavedTransition = history.some((event) => event.status === status
                && Math.abs(Date.parse(event.changedAt) - changedAtMs) < 60_000);
              return hasSavedTransition || !statusChanged
                ? history
                : current;
            });
            setHistoryError("");
          }).catch(() => {
            if (statusChanged) setHistoryError("Status tersimpan. Tanggal ditampilkan saat ini; riwayat permanen memerlukan migrasi status di Supabase.");
            else setHistoryError("Status tersimpan, tetapi riwayat gagal dimuat ulang.");
          });
        }} /></section></aside>
      </div>
    </div>
  );
}
