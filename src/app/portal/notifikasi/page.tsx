import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalNotifications } from "@/components/portal/PortalNotifications";

export default function NotifikasiPage() {
  return <div className="grid gap-6"><PortalHeader title="Notifikasi" subtitle="Pembaruan status laporan akan muncul di sini." /><PortalNotifications /></div>;
}