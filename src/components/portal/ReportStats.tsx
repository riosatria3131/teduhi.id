"use client";

import { CheckIcon, ClockIcon, WrenchIcon } from "@/components/icons";
import { usePortalReports } from "./use-portal-reports";

export function ReportStats() {
  const { reports } = usePortalReports();
  const stats = [
    { label: "Menunggu", value: reports.filter((report) => report.status === "Menunggu Verifikasi").length, Icon: ClockIcon, tone: "amber" },
    { label: "Diproses", value: reports.filter((report) => report.status === "Sedang Diproses").length, Icon: WrenchIcon, tone: "blue" },
    { label: "Selesai", value: reports.filter((report) => report.status === "Selesai").length, Icon: CheckIcon, tone: "teal" },
  ];
  return (
    <section aria-label="Ringkasan status laporan contoh dan lokal" className="grid grid-cols-3 gap-2.5 sm:gap-3">
      {stats.map(({ label, value, Icon, tone }) => (
        <article key={label} className="min-w-0 rounded-xl border border-white/15 bg-white/10 px-2.5 py-3 text-white backdrop-blur-sm sm:flex sm:items-center sm:gap-3 sm:px-4">
          <span className={`mb-2 grid size-9 place-items-center rounded-full text-white sm:mb-0 sm:size-10 ${tone === "amber" ? "bg-amber-500" : tone === "teal" ? "bg-emerald-400" : "bg-blue-400/80"}`}><Icon width={19} height={19} /></span>
          <span className="block min-w-0"><span className="block truncate text-[10px] font-medium text-white/80 sm:text-xs">{label}</span><span className="mt-0.5 block text-2xl leading-none font-extrabold sm:text-[27px]">{value}</span></span>
        </article>
      ))}
    </section>
  );
}