import { FileIcon } from "@/components/icons";
import { LiveDate } from "@/components/LiveDate";
import { PortalHomeGuidance } from "@/components/portal/PortalHomeGuidance";
import { PortalImportantContacts } from "@/components/portal/PortalImportantContacts";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { ReportStats } from "@/components/portal/ReportStats";

export default function PortalHomePage() {
  return (
    <div className="mx-auto grid max-w-[1320px] gap-6 sm:gap-7 xl:gap-8">
      <PortalHeader title="Halo" personalized subtitle="Ada bencana? Segera tindak lanjuti!" />

      <section aria-labelledby="my-reports-title" className="relative isolate overflow-hidden rounded-[24px] bg-linear-to-br from-[#075be5] via-[#0878e5] to-[#12cbb8] p-4 text-white shadow-[0_20px_55px_-32px_rgba(0,76,190,0.75)] sm:rounded-[28px] sm:p-6 lg:p-8">
        <div aria-hidden="true" className="absolute -right-16 -top-24 -z-10 size-64 rounded-full border border-white/10 sm:size-80" />
        <div aria-hidden="true" className="absolute -bottom-36 -left-12 -z-10 size-64 rounded-full border border-white/10" />
        <div>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-white sm:size-14"><FileIcon width={26} height={26} /></span>
                <span className="min-w-0"><h2 id="my-reports-title" className="text-lg leading-tight font-extrabold sm:text-2xl">Laporan Saya</h2><p className="mt-0.5 text-[11px] text-white/80 sm:text-sm">Pantau perkembangan laporan Anda</p></span>
              </div>
              <LiveDate className="bg-white/15 text-white/90" />
            </div>
            <div className="mt-4 sm:mt-5"><ReportStats /></div>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-6">
        <PortalHomeGuidance />
        <PortalImportantContacts />
      </div>
    </div>
  );
}