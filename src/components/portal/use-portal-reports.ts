"use client";

import { useEffect, useState } from "react";
import { getLocalReports, subscribeToLocalReports, type LocalReport } from "@/lib/portal-store";
import { type PortalReport } from "./portal-data";

function toPortalReport(report: LocalReport): PortalReport {
  return {
    id: report.id,
    title: report.title,
    location: `${report.address}, ${report.district}`,
    date: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(report.createdAt)),
    status: report.status,
    category: report.category,
    image: report.photo,
    imageAlt: `Foto laporan lokal: ${report.title}`,
    description: report.description,
    address: report.address,
    latitude: report.latitude,
    longitude: report.longitude,
    photoName: report.photoName,
  };
}

export function usePortalReports() {
  const [reports, setReports] = useState<PortalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const localReports = await getLocalReports();
        if (!active) return;
        const mapped = localReports.map(toPortalReport);
        setReports(mapped);
        setError("");
      } catch {
        if (active) setError("Laporan dari server tidak dapat dimuat. Periksa koneksi dan izin akun.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void refresh();
    const unsubscribe = subscribeToLocalReports(() => void refresh());
    window.addEventListener("laporkota:session-changed", refresh);
    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener("laporkota:session-changed", refresh);
    };
  }, []);

  return { reports, loading, error };
}