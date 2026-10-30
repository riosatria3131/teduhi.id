import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalNotifications } from "@/components/portal/PortalNotifications";

export default function NotifikasiPage() {
  return <div className="grid gap-6"><PortalHeader title="Informasi" subtitle="Riwayat informasi laporan Anda, dengan informasi terbaru di bagian atas." /><PortalNotifications /></div>;
}