import { PortalHeader } from "@/components/portal/PortalHeader";
import { ReportHistory } from "@/components/portal/ReportHistory";

export default async function RiwayatPage({ searchParams }: PageProps<"/portal/riwayat">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  return <div className="grid gap-6"><PortalHeader title="Riwayat Laporan" subtitle="Cari dan saring laporan contoh maupun laporan demo yang tersimpan di browser ini." /><div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">Data berlabel contoh hanya ilustrasi. Laporan demo buatan Anda disimpan di browser ini dan belum dikirim atau diterima instansi.</div><ReportHistory initialQuery={query} /></div>;
}