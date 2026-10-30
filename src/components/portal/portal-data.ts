export type ReportStatus = "Menunggu Verifikasi" | "Terverifikasi" | "Sedang Diproses" | "Selesai" | "Ditolak";

export type PortalReport = {
  id: string;
  title: string;
  location: string;
  date: string;
  status: ReportStatus;
  category: string;
  image: string;
  imageAlt: string;
  description?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  photoName?: string;
  localOnly?: boolean;
};

// Seluruh isi dashboard berikut adalah mock data untuk pratinjau UI, bukan data backend.
export const MOCK_REPORTS: PortalReport[] = [
  { id: "LK-2026-0124", title: "Jalan berlubang di Jl. Merdeka", location: "Bogor Tengah, Kota Bogor", date: "14 Okt 2026", status: "Menunggu Verifikasi", category: "Jalan & Trotoar", image: "/mock-road-report.svg", imageAlt: "Ilustrasi jalan berlubang sebagai data contoh" },
  { id: "LK-2026-0118", title: "Lampu penerangan jalan mati", location: "Bogor Utara, Kota Bogor", date: "08 Okt 2026", status: "Selesai", category: "Penerangan Jalan", image: "/mock-streetlight-report.svg", imageAlt: "Ilustrasi lampu jalan sebagai data contoh" },
  { id: "LK-2026-0112", title: "Tempat sampah umum rusak", location: "Bogor Tengah, Kota Bogor", date: "05 Okt 2026", status: "Selesai", category: "Sampah", image: "/mock-road-report.svg", imageAlt: "Ilustrasi fasilitas umum sebagai data contoh" },
  { id: "LK-2026-0106", title: "Saluran air tersumbat", location: "Bogor Timur, Kota Bogor", date: "02 Okt 2026", status: "Selesai", category: "Drainase & Saluran", image: "/mock-streetlight-report.svg", imageAlt: "Ilustrasi lokasi laporan sebagai data contoh" },
  { id: "LK-2026-0099", title: "Trotoar perlu diperbaiki", location: "Bogor Selatan, Kota Bogor", date: "28 Sep 2026", status: "Selesai", category: "Jalan & Trotoar", image: "/mock-road-report.svg", imageAlt: "Ilustrasi jalan sebagai data contoh" },
  { id: "LK-2026-0092", title: "Rambu jalan miring", location: "Tanah Sareal, Kota Bogor", date: "23 Sep 2026", status: "Selesai", category: "Fasilitas Umum", image: "/mock-streetlight-report.svg", imageAlt: "Ilustrasi area kota sebagai data contoh" },
  { id: "LK-2026-0087", title: "Lubang di badan jalan", location: "Bogor Barat, Kota Bogor", date: "19 Sep 2026", status: "Sedang Diproses", category: "Jalan & Trotoar", image: "/mock-road-report.svg", imageAlt: "Ilustrasi jalan berlubang sebagai data contoh" },
  { id: "LK-2026-0081", title: "Lampu taman tidak menyala", location: "Bogor Timur, Kota Bogor", date: "14 Sep 2026", status: "Menunggu Verifikasi", category: "Penerangan Jalan", image: "/mock-streetlight-report.svg", imageAlt: "Ilustrasi lampu taman sebagai data contoh" },
];

export const MOCK_ACTIVITY = [
  { label: "Sen", value: 42 },
  { label: "Sel", value: 55 },
  { label: "Rab", value: 74 },
  { label: "Kam", value: 60 },
  { label: "Jum", value: 54 },
  { label: "Sab", value: 82 },
  { label: "Min", value: 100 },
];

export const MOCK_NOTIFICATIONS = [
  { id: "sample:LK-2026-0124", reportId: "LK-2026-0124", title: "Laporan menunggu verifikasi", detail: "Jalan berlubang di Jl. Merdeka · Bogor Tengah", time: "14 Okt 2026", unread: true },
  { id: "sample:LK-2026-0118", reportId: "LK-2026-0118", title: "Laporan selesai", detail: "Lampu penerangan jalan mati · Bogor Utara", time: "08 Okt 2026", unread: true },
  { id: "sample:LK-2026-0112", reportId: "LK-2026-0112", title: "Contoh penanganan selesai", detail: "Tempat sampah umum rusak · Bogor Tengah", time: "05 Okt 2026", unread: false },
];