import Link from "next/link";
import { ArrowRightIcon, FileIcon } from "@/components/icons";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { QuickActions } from "@/components/portal/QuickActions";
import { RecentReports } from "@/components/portal/RecentReports";
import { ReportStats } from "@/components/portal/ReportStats";

export default function PortalHomePage() {
  return (
    <div className="mx-auto grid max-w-[1320px] gap-6 sm:gap-7 xl:gap-8">
      <PortalHeader title="Halo" personalized subtitle="Ada masalah di sekitar Anda?" />

      <section aria-labelledby="my-reports-title" className="relative isolate overflow-hidden rounded-[24px] bg-linear-to-br from-[#075be5] via-[#0878e5] to-[#12cbb8] p-4 text-white shadow-[0_20px_55px_-32px_rgba(0,76,190,0.75)] sm:rounded-[28px] sm:p-6 lg:p-8">
        <div aria-hidden="true" className="absolute -right-16 -top-24 -z-10 size-64 rounded-full border border-white/10 sm:size-80" />
        <div aria-hidden="true" className="absolute -bottom-36 -left-12 -z-10 size-64 rounded-full border border-white/10" />
        <div>
          <div>
            <div className="flex items-center justify-between gap-3 lg:justify-start">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-white sm:size-14"><FileIcon width={26} height={26} /></span>
                <span className="min-w-0"><h2 id="my-reports-title" className="text-lg leading-tight font-extrabold sm:text-2xl">Laporan Saya</h2><p className="mt-0.5 text-[11px] text-white/80 sm:text-sm">Pantau perkembangan laporan Anda</p></span>
              </div>
              <Link href="/portal/riwayat" className="hidden shrink-0 items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/30 lg:inline-flex">Lihat Semua <ArrowRightIcon width={15} height={15} /></Link>
            </div>
            <div className="mt-4 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold tracking-wide text-white/80 sm:text-[10px]">DATA CONTOH + DEMO LOKAL</div>
            <div className="mt-4 sm:mt-5"><ReportStats /></div>
          </div>
        </div>
        <Link href="/portal/riwayat" className="mt-4 inline-flex min-h-10 items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-white/30 lg:hidden">Lihat Semua Laporan <ArrowRightIcon width={15} height={15} /></Link>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-7">
        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)] sm:p-6">
          <QuickActions />
        </div>
        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)] sm:p-6">
          <RecentReports />
        </div>
      </div>
    </div>
  );
}