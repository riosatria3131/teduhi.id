"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type LocationRow = { address: string; district: string; latitude: number | null; longitude: number | null; report_count: number };

export function AdminLocationsTable() {
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        const { data, error: queryError } = await getSupabaseClient()
          .from("report_location_summary")
          .select("address, district, latitude, longitude, report_count")
          .order("report_count", { ascending: false });
        if (queryError) throw queryError;
        if (active) setLocations((data ?? []) as LocationRow[]);
      })().catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Data lokasi gagal dimuat.");
      }).finally(() => {
        if (active) setLoading(false);
      });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)]">
      {error && <p role="alert" className="m-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Data lokasi laporan gagal dimuat dari Supabase. {error}</p>}
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 text-center">No</th><th className="px-4 py-3">Nama Lokasi</th><th className="px-4 py-3">Wilayah</th><th className="px-4 py-3">Koordinat</th><th className="px-4 py-3">Jumlah Laporan</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{locations.map((location, index) => <tr key={`${location.address}-${location.district}-${location.latitude}-${location.longitude}`}><td className="px-4 py-3.5 text-center text-xs text-slate-400">{index + 1}</td><td className="px-4 py-3.5 font-bold text-[#102a61]">{location.address}</td><td className="px-4 py-3.5 text-slate-600">{location.district}</td><td className="px-4 py-3.5 text-slate-600">{location.latitude != null && location.longitude != null ? `${location.latitude}, ${location.longitude}` : "—"}</td><td className="px-4 py-3.5 text-slate-600">{location.report_count}</td><td className="px-4 py-3.5"><span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">Aktif</span></td></tr>)}{locations.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">{loading ? "Memuat lokasi…" : "Belum ada data lokasi pada laporan."}</td></tr>}</tbody></table></div>
      <p className="border-t border-slate-100 px-5 py-2.5 text-[11px] text-slate-400">Lokasi dan jumlah laporan diringkas dari laporan warga di Supabase.</p>
    </section>
  );
}
