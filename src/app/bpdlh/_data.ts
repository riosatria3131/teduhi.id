export const currentRealizationRate = 68.5;

export const financeMetrics = [
  { label: "Likuiditas Siap Pakai", value: "Rp 128,4 M", note: "+8,2% dari minggu lalu", detail: "64% dari total pagu aktif", tone: "blue" },
  { label: "Realisasi Anggaran", value: `${currentRealizationRate.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`, note: "Dari total pagu aktif", detail: "Target tahunan 80%", tone: "blue" },
] as const;

export const realizationTrend = [
  { year: "2022", value: 42 },
  { year: "2023", value: 55 },
  { year: "2024", value: 50 },
  { year: "2025", value: 76 },
  { year: "2026", value: currentRealizationRate },
] as const;

export const fundingRequests = [
  { id: "PGJ-0261", title: "Tanggap Darurat - Banjir Demak", org: "BPBD Demak", date: "22 Okt 2026", status: "Perlu verifikasi", category: "Darurat", amount: "Rp 4.800.000.000", tone: "red" },
  { id: "PGJ-0260", title: "Tanggap Darurat - Banjir Brebes", org: "BPBD Brebes", date: "22 Okt 2026", status: "Perlu verifikasi", category: "Darurat", amount: "Rp 3.200.000.000", tone: "red" },
  { id: "PGJ-0259", title: "Rehabilitasi - Gempa Cianjur", org: "BPBD Cianjur", date: "21 Okt 2026", status: "Dokumen lengkap", category: "Rehabilitasi", amount: "Rp 2.100.000.000", tone: "orange" },
  { id: "PGJ-0258", title: "Rehabilitasi - Banjir Sintang", org: "BPBD Sintang", date: "20 Okt 2026", status: "Perlu revisi", category: "Rehabilitasi", amount: "Rp 1.750.000.000", tone: "orange" },
  { id: "PGJ-0257", title: "Mitigasi - Longsor Garut", org: "BPBD Garut", date: "21 Okt 2026", status: "Menunggu", category: "Mitigasi", amount: "Rp 850.000.000", tone: "green" },
  { id: "PGJ-0256", title: "Tanggap Darurat - Gempa Lombok", org: "BPBD Lombok Utara", date: "19 Okt 2026", status: "Perlu verifikasi", category: "Darurat", amount: "Rp 2.650.000.000", tone: "red" },
  { id: "PGJ-0255", title: "Rehabilitasi - Banjir Aceh Tamiang", org: "BPBD Aceh Tamiang", date: "18 Okt 2026", status: "Dokumen lengkap", category: "Rehabilitasi", amount: "Rp 1.400.000.000", tone: "orange" },
  { id: "PGJ-0254", title: "Mitigasi - Kekeringan Gunungkidul", org: "BPBD Gunungkidul", date: "17 Okt 2026", status: "Menunggu", category: "Mitigasi", amount: "Rp 620.000.000", tone: "green" },
  { id: "PGJ-0253", title: "Rehabilitasi - Gempa Pasaman", org: "BPBD Pasaman", date: "16 Okt 2026", status: "Perlu revisi", category: "Rehabilitasi", amount: "Rp 1.250.000.000", tone: "orange" },
  { id: "PGJ-0252", title: "Tanggap Darurat - Banjir Luwu", org: "BPBD Luwu", date: "15 Okt 2026", status: "Perlu verifikasi", category: "Darurat", amount: "Rp 2.900.000.000", tone: "red" },
  { id: "PGJ-0251", title: "Rehabilitasi - Longsor Sumedang", org: "BPBD Sumedang", date: "14 Okt 2026", status: "Dokumen lengkap", category: "Rehabilitasi", amount: "Rp 980.000.000", tone: "orange" },
  { id: "PGJ-0250", title: "Mitigasi - Banjir Kota Batu", org: "BPBD Kota Batu", date: "13 Okt 2026", status: "Menunggu", category: "Mitigasi", amount: "Rp 740.000.000", tone: "green" },
] as const;

export const paymentTransactions = [
  { id: "TRX-0261", application: "Tanggap Darurat - Banjir Demak", purpose: "Kas BPBD Demak", bank: "Bank Jateng", amount: 4800000000, status: "Success", date: "22 Okt 2026", time: "10:21 WIB" },
  { id: "TRX-0260", application: "Rehabilitasi - Gempa Cianjur", purpose: "Kas BPBD Cianjur", bank: "Bank BJB", amount: 2100000000, status: "Processing", date: "22 Okt 2026", time: "09:47 WIB" },
  { id: "TRX-0259", application: "Mitigasi - Longsor Garut", purpose: "Kas BPBD Garut", bank: "Bank BRI", amount: 650000000, status: "Failed", date: "21 Okt 2026", time: "17:12 WIB" },
  { id: "TRX-0258", application: "Tanggap Darurat - Banjir Brebes", purpose: "Kas BPBD Brebes", bank: "Bank Jateng", amount: 3200000000, status: "Success", date: "21 Okt 2026", time: "15:30 WIB" },
  { id: "TRX-0257", application: "Rehabilitasi - Banjir Sintang", purpose: "Kas BPBD Sintang", bank: "Bank Kalbar", amount: 1750000000, status: "Processing", date: "21 Okt 2026", time: "14:18 WIB" },
  { id: "TRX-0256", application: "Tanggap Darurat - Gempa Lombok", purpose: "Kas BPBD Lombok Utara", bank: "Bank NTB Syariah", amount: 2650000000, status: "Success", date: "20 Okt 2026", time: "13:05 WIB" },
  { id: "TRX-0255", application: "Rehabilitasi - Banjir Aceh Tamiang", purpose: "Kas BPBD Aceh Tamiang", bank: "Bank Aceh", amount: 1400000000, status: "Success", date: "20 Okt 2026", time: "11:42 WIB" },
  { id: "TRX-0254", application: "Mitigasi - Kekeringan Gunungkidul", purpose: "Kas BPBD Gunungkidul", bank: "Bank BPD DIY", amount: 620000000, status: "Processing", date: "19 Okt 2026", time: "16:35 WIB" },
  { id: "TRX-0253", application: "Rehabilitasi - Gempa Pasaman", purpose: "Kas BPBD Pasaman", bank: "Bank Nagari", amount: 1250000000, status: "Success", date: "19 Okt 2026", time: "14:09 WIB" },
  { id: "TRX-0252", application: "Tanggap Darurat - Banjir Luwu", purpose: "Kas BPBD Luwu", bank: "Bank Sulselbar", amount: 2900000000, status: "Success", date: "18 Okt 2026", time: "10:54 WIB" },
  { id: "TRX-0251", application: "Rehabilitasi - Longsor Sumedang", purpose: "Kas BPBD Sumedang", bank: "Bank BJB", amount: 980000000, status: "Success", date: "17 Okt 2026", time: "15:25 WIB" },
  { id: "TRX-0250", application: "Mitigasi - Banjir Kota Batu", purpose: "Kas BPBD Kota Batu", bank: "Bank Jatim", amount: 740000000, status: "Success", date: "16 Okt 2026", time: "09:33 WIB" },
] as const;

export const recentAudits = [
  { initials: "RN", title: "Catatan revisi - Banjir Demak", detail: "Mohon lampirkan pembaruan RAB pada pos logistik.", author: "Rina N. · Auditor BPDLH", time: "22 Okt 2026 · 10:05 WIB" },
] as const;
