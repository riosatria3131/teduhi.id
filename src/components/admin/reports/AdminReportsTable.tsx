"use client";

import { useEffect, useState } from "react";
import { AdminDataTable, type AdminTableRow } from "@/components/admin/shared/AdminDataTable";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { subscribeToLocalReports } from "@/lib/portal-store";

type AdminReportRow = {
  id: string | number;
  title: string | null;
  description: string | null;
  address: string | null;
  district: string | null;
  status: string | null;
  created_at: string | null;
  photo_path: string | null;
  profiles: { nama?: string | null } | Array<{ nama?: string | null }> | null;
};

function getReporterName(profiles: AdminReportRow["profiles"]): string {
  const profile = Array.isArray(profiles) ? profiles[0] : profiles;
  return profile?.nama || "Warga";
}

export function AdminReportsTable() {
  const [rows, setRows] = useState<AdminTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const { data, error: queryError } = await getSupabaseClient()
          .from("reports")
          .select("id, title, description, address, district, status, created_at, photo_path, profiles(nama)")
          .neq("status", "review")
          .order("created_at", { ascending: false });
        if (queryError) throw queryError;
        if (!active) return;
        const reports = (data ?? []) as unknown as AdminReportRow[];
        setRows(reports.map((report) => ({
          id: String(report.id),
          values: [
            report.title || "Tanpa judul",
            getReporterName(report.profiles),
            [report.address, report.district].filter((part): part is string => Boolean(part?.trim())).join(", ") || "Lokasi tidak tersedia",
            report.status || "Tidak diketahui",
            report.created_at && !Number.isNaN(Date.parse(report.created_at))
              ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(report.created_at))
              : "—",
          ],
          status: report.status ?? undefined,
          href: `/admin/laporan/${encodeURIComponent(String(report.id))}`,
        })));
        setError("");
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Laporan warga gagal dimuat.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void refresh();
    const unsubscribe = subscribeToLocalReports(() => void refresh());
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const statusFilters = [...new Set(rows.map((row) => row.status).filter((status): status is string => Boolean(status)))];

  return (
    <>
      {loading && <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">Memuat laporan warga…</p>}
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Laporan tidak dapat dimuat. Pastikan akun admin memiliki izin baca di Supabase. Detail: {error}</p>}
      {!loading && !error && rows.length === 0 && <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">Belum ada laporan warga di database.</p>}
      <AdminDataTable
        columns={["Judul Laporan", "Pelapor", "Lokasi", "Status", "Tanggal"]}
        rows={rows}
        searchPlaceholder="Cari laporan atau lokasi..."
        filters={statusFilters}
        footerMessage="Data laporan warga tersimpan di Supabase."
      />
    </>
  );
}
