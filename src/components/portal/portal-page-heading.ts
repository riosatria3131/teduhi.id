export type PortalPageHeading = { eyebrow: string; title: string; subtitle: string };

const pageHeadings: Record<string, PortalPageHeading> = {
  "/portal": { eyebrow: "", title: "", subtitle: "" },
  "/portal/buat-laporan": {
    eyebrow: "",
    title: "Buat Laporan",
    subtitle: "Sertakan foto dan lokasi yang jelas agar kerusakan mudah ditindaklanjuti.",
  },
  "/portal/riwayat": { eyebrow: "", title: "Riwayat Laporan", subtitle: "" },
  "/portal/notifikasi": {
    eyebrow: "",
    title: "Pesan",
    subtitle: "Pesan dan pembaruan laporan Anda, dengan yang terbaru di bagian atas.",
  },
  "/portal/profil": { eyebrow: "", title: "Profil", subtitle: "Kelola informasi profil warga." },
};

export function getPortalPageHeading(pathname: string): PortalPageHeading {
  if (pathname.startsWith("/portal/riwayat/")) {
    return { eyebrow: "", title: "Detail Laporan", subtitle: "Detail dan perkembangan laporan Anda." };
  }
  return pageHeadings[pathname] ?? { eyebrow: "", title: "Portal Warga", subtitle: "" };
}
