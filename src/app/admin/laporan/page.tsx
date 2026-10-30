import { AdminPageHeading } from "@/components/admin/shared/AdminPageHeading";
import { AdminReportsTable } from "@/components/admin/reports/AdminReportsTable";

export default function AdminReportsPage() {
  return (
    <div className="grid gap-6">
      <AdminPageHeading eyebrow="Administrasi" title="Kelola Laporan" description="Lihat, telusuri, dan kelola semua laporan masyarakat." />
      <AdminReportsTable />
    </div>
  );
}