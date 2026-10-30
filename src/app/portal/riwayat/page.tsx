import { PortalHeader } from "@/components/portal/PortalHeader";
import { ReportHistory } from "@/components/portal/ReportHistory";

export default async function RiwayatPage({ searchParams }: PageProps<"/portal/riwayat">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  return <div className="grid gap-6"><PortalHeader title="Riwayat Laporan" subtitle="" showEyebrow={false} /><ReportHistory initialQuery={query} /></div>;
}