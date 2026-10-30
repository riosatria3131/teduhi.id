import { getSupabaseClient } from "@/lib/supabaseClient";

export type ReportTrendPeriod = "monthly" | "yearly";
export type AdminReportMetric = {
  label: string;
  value: number;
  note: string;
  tone: "blue" | "red" | "orange" | "green";
};
export type ReportTrendPoint = { label: string; value: number; detail: string };

const MONTH_LABEL = new Intl.DateTimeFormat("id-ID", { month: "short" });
const MONTH_DETAIL = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" });
const NUMBER_FORMAT = new Intl.NumberFormat("id-ID");

async function countReports(options: { statuses?: string[]; category?: string; start?: Date; end?: Date } = {}): Promise<number> {
  let query = getSupabaseClient().from("reports").select("id", { count: "exact", head: true });
  const { statuses, category, start, end } = options;
  if (statuses?.length === 1) query = query.eq("status", statuses[0]);
  if (statuses && statuses.length > 1) query = query.in("status", statuses);
  if (category) query = query.eq("category", category);
  if (start) query = query.gte("created_at", start.toISOString());
  if (end) query = query.lt("created_at", end.toISOString());

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function getAdminReportMetrics(): Promise<AdminReportMetric[]> {
  const [total, pending, inProgress, completed] = await Promise.all([
    countReports(),
    countReports({ statuses: ["Menunggu Verifikasi"] }),
    countReports({ statuses: ["Terverifikasi", "Sedang Diproses"] }),
    countReports({ statuses: ["Selesai"] }),
  ]);

  return [
    { label: "Total Laporan", value: total, note: "Seluruh laporan warga", tone: "blue" },
    { label: "Laporan Tertunda", value: pending, note: "Menunggu verifikasi", tone: "red" },
    { label: "Dalam Proses", value: inProgress, note: "Terverifikasi atau ditangani", tone: "orange" },
    { label: "Selesai", value: completed, note: "Laporan telah ditangani", tone: "green" },
  ];
}

export async function getAdminReportTrend(period: ReportTrendPeriod): Promise<ReportTrendPoint[]> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const periods = period === "monthly"
    ? Array.from({ length: 12 }, (_, index) => {
      const date = new Date(currentYear, currentMonth - (11 - index), 1);
      return {
        start: date,
        end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
        label: MONTH_LABEL.format(date),
        detail: MONTH_DETAIL.format(date),
      };
    })
    : Array.from({ length: 5 }, (_, index) => {
      const year = currentYear - (4 - index);
      return {
        start: new Date(year, 0, 1),
        end: new Date(year + 1, 0, 1),
        label: String(year),
        detail: `Tahun ${year}`,
      };
    });

  const counts = await Promise.all(periods.map(({ start, end }) => countReports({ statuses: ["Selesai"], start, end })));
  return periods.map(({ label, detail }, index) => ({ label, detail, value: counts[index] }));
}

export async function getAdminReportCategoryCounts(categories: string[]): Promise<Record<string, number>> {
  const entries = await Promise.all(categories.map(async (category) => [
    category,
    await countReports({ category }),
  ] as const));
  return Object.fromEntries(entries);
}

export function formatReportCount(value: number): string {
  return NUMBER_FORMAT.format(value);
}
