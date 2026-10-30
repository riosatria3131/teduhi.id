import { AdminPageHeading } from "@/components/admin/shared/AdminPageHeading";
import { AdminResidentsTable } from "@/components/admin/warga/AdminResidentsTable";

export default function AdminResidentsPage() {
  return (
    <div className="grid gap-6">
      <AdminPageHeading eyebrow="Administrasi" title="Data Warga" description="Mengelola data warga yang terdaftar di sistem TEDUHI." />
      <AdminResidentsTable />
    </div>
  );
}