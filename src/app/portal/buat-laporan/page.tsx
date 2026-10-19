import { PortalHeader } from "@/components/portal/PortalHeader";
import { ReportForm } from "@/components/portal/ReportForm";

export default function BuatLaporanPage() {
  return <div className="grid gap-6"><PortalHeader title="Buat Laporan" subtitle="Sertakan foto dan lokasi yang jelas agar kerusakan mudah ditindaklanjuti." /><ReportForm /></div>;
}