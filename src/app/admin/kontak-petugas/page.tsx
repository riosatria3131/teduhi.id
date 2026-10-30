import { AdminOfficerContacts } from "@/components/admin/contacts/AdminOfficerContacts";
import { AdminPageHeading } from "@/components/admin/shared/AdminPageHeading";

export default function AdminOfficerContactsPage() {
  return (
    <div className="grid gap-6">
      <AdminPageHeading eyebrow="Administrasi" title="Kontak Petugas" description="Kelola direktori petugas, wilayah tugas, dan kanal komunikasi warga." />
      <AdminOfficerContacts />
    </div>
  );
}
