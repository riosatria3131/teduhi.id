import { ReportHistory } from "@/components/portal/ReportHistory";

export default async function RiwayatPage({ searchParams }: PageProps<"/portal/riwayat">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  return <div className="grid gap-6"><ReportHistory initialQuery={query} /></div>;
}