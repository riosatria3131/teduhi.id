"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, CalendarIcon, CheckIcon, ClockIcon, PinIcon, TrashIcon } from "@/components/icons";
import { deleteLocalReport, getLocalReport } from "@/lib/portal-store";
import { MOCK_REPORTS, type PortalReport } from "./portal-data";

export function PortalReportDetail({ id }: { id: string }) {
  const router = useRouter();
  const [report, setReport] = useState<PortalReport | null>(MOCK_REPORTS.find((item) => item.id === id) ?? null);
  const [loading, setLoading] = useState(!report);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let photoUrl = "";
    void getLocalReport(id).then((local) => {
      if (!active || !local) return;
      photoUrl = URL.createObjectURL(local.photo);
      setReport({
        id: local.id,
        title: local.title,
        location: `${local.address}, ${local.district}`,
        date: new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(local.createdAt)),
        status: local.status,
        category: local.category,
        image: photoUrl,
        imageAlt: `Foto laporan lokal ${local.title}`,
        description: local.description,
        address: local.address,
        latitude: local.latitude,
        longitude: local.longitude,
        photoName: local.photoName,
        localOnly: true,
      });
    }).catch(() => {
      if (active) setError("Detail laporan demo tidak bisa dimuat dari penyimpanan browser.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [id]);

  async function removeLocalReport() {
    if (!report?.localOnly || !window.confirm("Hapus laporan demo ini dari penyimpanan browser? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      await deleteLocalReport(report.id);
      router.replace("/portal/riwayat");
    } catch {
      setError("Laporan lokal gagal dihapus. Silakan coba lagi.");
    }
  }

  if (loading) return <p className="rounded-2xl bg-white p-6 text-sm text-muted">Memuat detail laporan…</p>;
  if (!report) return <section className="rounded-2xl bg-white p-6"><h2 className="font-bold text-ink">Laporan tidak ditemukan</h2><p className="mt-2 text-sm text-muted">Laporan mungkin sudah dihapus, atau bukan bagian dari data contoh maupun akun demo ini.</p><Link href="/portal/riwayat" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-dark"><ArrowLeftIcon width={16} height={16} />Kembali ke riwayat</Link></section>;

  const statusStyle = report.status === "Selesai" ? "bg-emerald-50 text-emerald-700" : report.status === "Sedang Diproses" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-800";
  return (
    <div className="mx-auto grid max-w-4xl gap-5">
      <Link href="/portal/riwayat" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-brand-dark hover:underline"><ArrowLeftIcon width={17} height={17} />Riwayat laporan</Link>
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative min-h-56 bg-paper md:min-h-full">
            <Image src={report.image} alt={report.imageAlt} fill unoptimized={report.localOnly} className="object-cover" sizes="(max-width: 768px) 100vw, 45vw" />
          </div>
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-dark">{report.category}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle}`}>{report.status}</span></div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">{report.title}</h1>
            <p className="mt-2 text-xs font-semibold text-muted">{report.id}{report.localOnly ? " · Demo lokal" : " · Data contoh"}</p>
            <div className="mt-5 grid gap-3 border-y border-line py-4 text-sm text-muted">
              <p className="flex items-start gap-2"><PinIcon width={17} height={17} className="mt-0.5 shrink-0 text-brand" />{report.location}</p>
              <p className="flex items-start gap-2"><CalendarIcon width={17} height={17} className="mt-0.5 shrink-0 text-brand" />{report.date}</p>
            </div>
            <h2 className="mt-5 text-sm font-extrabold text-ink">Deskripsi</h2>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-muted">{report.description ?? "Catatan detail tidak tersedia pada data contoh."}</p>
            {report.localOnly ? (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-2 text-sm font-bold text-amber-950"><ClockIcon width={17} height={17} className="mt-0.5 shrink-0" />Tersimpan di browser, belum dikirim</div>
                <p className="mt-1.5 text-xs leading-relaxed text-amber-900">Status “Menunggu Verifikasi” hanya status awal untuk demonstrasi. Laporan ini belum diterima atau diproses instansi mana pun.</p>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900"><CheckIcon width={17} height={17} className="mr-1 inline" />Ini data contoh tampilan, bukan riwayat laporan warga sungguhan.</div>
            )}
            {report.latitude && report.longitude && <p className="mt-4 text-xs text-muted">Koordinat yang Anda masukkan: {report.latitude}, {report.longitude}</p>}
            {report.localOnly && <button type="button" onClick={removeLocalReport} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"><TrashIcon width={17} height={17} />Hapus dari browser</button>}
          </div>
        </div>
      </article>
    </div>
  );
}