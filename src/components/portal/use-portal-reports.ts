"use client";

import { useEffect, useState } from "react";
import { getLocalReports, subscribeToLocalReports, type LocalReport } from "@/lib/portal-store";
import { MOCK_REPORTS, type PortalReport } from "./portal-data";

function toPortalReport(report: LocalReport): PortalReport {
  return {
    id: report.id,
    title: report.title,
    location: `${report.address}, ${report.district}`,
    date: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(report.createdAt)),
    status: report.status,
    category: report.category,
    image: URL.createObjectURL(report.photo),
    imageAlt: `Foto laporan lokal: ${report.title}`,
    description: report.description,
    address: report.address,
    latitude: report.latitude,
    longitude: report.longitude,
    photoName: report.photoName,
    localOnly: true,
  };
}

export function usePortalReports() {
  const [reports, setReports] = useState<PortalReport[]>(MOCK_REPORTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let objectUrls: string[] = [];

    async function refresh() {
      try {
        const localReports = await getLocalReports();
        if (!active) return;
        objectUrls.forEach((url) => URL.revokeObjectURL(url));
        const mapped = localReports.map(toPortalReport);
        objectUrls = mapped.map((report) => report.image);
        setReports([...mapped, ...MOCK_REPORTS]);
        setError("");
      } catch {
        if (active) setError("Laporan lokal tidak dapat dibaca. Data contoh tetap ditampilkan.");
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
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return { reports, loading, error };
}