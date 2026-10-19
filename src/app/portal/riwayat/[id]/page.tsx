import { PortalReportDetail } from "@/components/portal/PortalReportDetail";

export default async function ReportDetailPage({ params }: PageProps<"/portal/riwayat/[id]">) {
  const { id } = await params;
  return <PortalReportDetail id={decodeURIComponent(id)} />;
}