import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, ChevronIcon, CheckIcon, ClockIcon, PinIcon, WrenchIcon } from "@/components/icons";
import type { PortalReport } from "./portal-data";

export function ReportCard({ report }: { report: PortalReport }) {
  const statusStyle = report.status === "Selesai" ? "bg-emerald-50 text-emerald-700" : report.status === "Ditolak" ? "bg-rose-50 text-rose-700" : report.status === "Sedang Diproses" ? "bg-blue-50 text-blue-700" : report.status === "Terverifikasi" ? "bg-violet-50 text-violet-700" : "bg-amber-50 text-amber-700";
  const StatusIcon = report.status === "Selesai" ? CheckIcon : report.status === "Sedang Diproses" || report.status === "Terverifikasi" ? WrenchIcon : ClockIcon;
  return (
    <Link href={`/portal/riwayat/${encodeURIComponent(report.id)}`} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_4px_18px_-14px_rgba(16,39,92,0.35)] transition hover:border-blue-100 hover:shadow-md sm:gap-4 sm:p-4">
      <Image src={report.image} alt={report.imageAlt} width={160} height={120} unoptimized={report.localOnly || report.image.startsWith("http")} className="size-[76px] shrink-0 rounded-xl object-cover sm:size-24" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-extrabold leading-tight text-[#102a61] sm:text-base">{report.title}</span>
        <span className="mt-1.5 flex min-w-0 items-center gap-1 text-[10px] text-slate-500 sm:text-xs"><PinIcon width={13} height={13} className="shrink-0 text-slate-400" /><span className="truncate">{report.location}</span></span>
        <span className="mt-1 flex min-w-0 items-center gap-1 text-[9px] text-slate-500 sm:text-xs"><CalendarIcon width={13} height={13} className="shrink-0 text-slate-400" /><span className="truncate">{report.date}</span></span>
        <span className={`mt-1.5 inline-flex max-w-full items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold leading-none sm:text-[10px] ${statusStyle}`}><StatusIcon width={12} height={12} /><span className="truncate">{report.status}</span></span>
      </span>
      <ChevronIcon width={18} height={18} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}