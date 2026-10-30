import { AdminReportDetailView } from "@/components/admin/reports/AdminReportDetailView";

export default async function AdminReportDetailPage({ params }: PageProps<"/admin/laporan/[id]">) {
  const { id } = await params;
  return <AdminReportDetailView id={id} />;
}