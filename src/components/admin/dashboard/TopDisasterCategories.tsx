"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { getAdminReportCategoryCounts } from "@/lib/admin/report-analytics";
import { subscribeToLocalReports } from "@/lib/portal-store";

const DISASTERS = [
  { name: "Kebakaran", category: "Kebakaran", badge: "bg-red-100 text-red-700" },
  { name: "Longsor", category: "Longsor", badge: "bg-[#8b5e3c] text-white" },
  { name: "Banjir", category: "Banjir", badge: "bg-[#fff4d6] text-[#8a5a00]" },
  { name: "Gempa", category: "Gempa Bumi", badge: "bg-slate-200 text-slate-700" },
  { name: "Tsunami", category: "Tsunami", badge: "bg-blue-100 text-blue-700" },
] as const;

export function TopDisasterCategories() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const refreshCounts = async () => {
      try {
        const nextCounts = await getAdminReportCategoryCounts(DISASTERS.map((disaster) => disaster.category));
        if (!active) return;
        setCounts(nextCounts);
        setError("");
      } catch (loadError) {
        if (active) {
          setCounts({});
          setError(loadError instanceof Error ? loadError.message : "Agregat kategori gagal dimuat.");
        }
      }
    };

    void refreshCounts();
    const unsubscribe = subscribeToLocalReports(() => void refreshCounts());
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const rankedDisasters = DISASTERS
    .map((disaster) => ({ ...disaster, count: counts[disaster.category] ?? 0 }))
    .sort((a, b) => b.count - a.count);

  return (
    <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)] sm:p-5">
      <div className="mb-3">
        <h2 className="text-sm font-extrabold text-[#102a61]">Top Kategori Laporan</h2>
        <p className="mt-0.5 text-[10px] text-slate-500">Peringkat berdasarkan laporan bencana warga</p>
      </div>
      <ol className="grid gap-2">
        {rankedDisasters.map((disaster, index) => (
          <li key={disaster.name} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-3">
            <p className="min-w-0 truncate text-xs font-semibold text-slate-700">
              <span className={`mr-2 inline-flex rounded-md px-2 py-1 text-[10px] font-extrabold ${disaster.badge}`}>Top {index + 1}</span>
              {disaster.name}
            </p>
            <p className="shrink-0 text-xs font-extrabold text-[#102a61]">{disaster.count} kejadian</p>
          </li>
        ))}
      </ol>
      <Link href="/admin/kategori" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:underline">
        Lihat Semua <ArrowRightIcon width={12} height={12} />
      </Link>
      {error ? <p role="alert" className="mt-2 text-[9px] text-rose-600">Gagal memuat agregat Supabase: {error}</p> : <p className="mt-2 text-[9px] text-slate-400">Jumlah kategori dihitung dari tabel reports Supabase.</p>}
    </section>
  );
}
