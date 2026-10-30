export const ADMIN_METRICS = [
  { label: "Total Laporan", value: "245", note: "+12% dari bulan lalu", tone: "blue" },
  { label: "Laporan Tertunda", value: "25", note: "Melewati target penanganan", tone: "red" },
  { label: "Dalam Proses", value: "38", note: "Perlu tindak lanjut petugas", tone: "orange" },
  { label: "Selesai", value: "182", note: "74% laporan tertangani", tone: "green" },
] as const;

export const RECENT_ADMIN_REPORTS = [
  { id: "LPR-0245", title: "Jalan berlubang", category: "Infrastruktur", reporter: "Budi Santoso", location: "Jl. Merdeka, Bogor Tengah", date: "21 Mei 2025", status: "Selesai" },
  { id: "LPR-0244", title: "Sampah menumpuk", category: "Kebersihan", reporter: "Siti Nurhaliza", location: "Jl. Sudirman, Bogor", date: "21 Mei 2025", status: "Dalam Proses" },
  { id: "LPR-0243", title: "Lampu jalan mati", category: "Penerangan", reporter: "Rizky Pratama", location: "Taman Merdeka", date: "20 Mei 2025", status: "Baru" },
  { id: "LPR-0242", title: "Pohon tumbang", category: "Lingkungan", reporter: "Dewi Lestari", location: "Jl. Pajajaran", date: "20 Mei 2025", status: "Dalam Proses" },
  { id: "LPR-0241", title: "Saluran air tersumbat", category: "Infrastruktur", reporter: "Andi Wijaya", location: "Kel. Babakan", date: "19 Mei 2025", status: "Selesai" },
] as const;

export const ADMIN_RESIDENTS = [
  { id: "1", name: "Budi Santoso", email: "budi.santoso@gmail.com", joined: "21 Mei 2025", status: "Aktif" },
  { id: "2", name: "Siti Nurhaliza", email: "siti.nurhaliza@yahoo.com", joined: "20 Mei 2025", status: "Aktif" },
  { id: "3", name: "Rizky Pratama", email: "rizky.pratama@outlook.com", joined: "19 Mei 2025", status: "Aktif" },
  { id: "4", name: "Dewi Lestari", email: "dewi.lestari@gmail.com", joined: "18 Mei 2025", status: "Nonaktif" },
  { id: "5", name: "Andi Wijaya", email: "andi.wijaya@proton.me", joined: "17 Mei 2025", status: "Aktif" },
  { id: "6", name: "Nadia Putri", email: "nadia.putri@icloud.com", joined: "16 Mei 2025", status: "Aktif" },
  { id: "7", name: "Fajar Hidayat", email: "fajar.hidayat@gmail.com", joined: "14 Mei 2025", status: "Aktif" },
  { id: "8", name: "Maya Sari", email: "maya.sari@ymail.com", joined: "12 Mei 2025", status: "Nonaktif" },
  { id: "9", name: "Asep Rahman", email: "asep.rahman@yahoo.co.id", joined: "11 Mei 2025", status: "Aktif" },
  { id: "10", name: "Lina Marlina", email: "lina.marlina@outlook.com", joined: "8 Mei 2025", status: "Aktif" },
] as const;

export const ADMIN_CATEGORIES = [
  { id: "1", name: "Jalan & Infrastruktur", icon: "🛣️", reports: "78", status: "Aktif" },
  { id: "2", name: "Kebersihan Lingkungan", icon: "♻️", reports: "56", status: "Aktif" },
  { id: "3", name: "Penerangan Jalan", icon: "💡", reports: "42", status: "Aktif" },
  { id: "4", name: "Fasilitas Umum", icon: "🏛️", reports: "28", status: "Aktif" },
  { id: "5", name: "Lainnya", icon: "📍", reports: "10", status: "Aktif" },
] as const;

export const ADMIN_LOCATIONS = [
  { id: "1", name: "Jl. Merdeka", area: "Kec. Bogor Tengah", coordinates: "-6.595, 106.799", reports: "32", status: "Aktif" },
  { id: "2", name: "Jl. Sudirman", area: "Kec. Bogor Tengah", coordinates: "-6.589, 106.795", reports: "24", status: "Aktif" },
  { id: "3", name: "Taman Merdeka", area: "Kec. Bogor Tengah", coordinates: "-6.597, 106.798", reports: "18", status: "Aktif" },
  { id: "4", name: "Bundaran Cibuluh", area: "Kec. Bogor Utara", coordinates: "-6.565, 106.806", reports: "12", status: "Aktif" },
] as const;

export const ADMIN_USERS = [
  { id: "1", name: "Admin TEDUHI", email: "admin@teduhi.id", joined: "21 Mei 2025", status: "Aktif" },
  { id: "2", name: "Budi Santoso", email: "petugas1@teduhi.id", joined: "20 Mei 2025", status: "Aktif" },
  { id: "3", name: "Siti Nurhaliza", email: "petugas2@teduhi.id", joined: "19 Mei 2025", status: "Aktif" },
  { id: "4", name: "Rizky Pratama", email: "petugas3@teduhi.id", joined: "18 Mei 2025", status: "Aktif" },
  { id: "5", name: "Dewi Lestari", email: "petugas4@teduhi.id", joined: "17 Mei 2025", status: "Nonaktif" },
] as const;

export const ADMIN_WEEKLY_REPORTS = [
  { day: "Sen", reports: 24, done: 15 },
  { day: "Sel", reports: 35, done: 22 },
  { day: "Rab", reports: 28, done: 18 },
  { day: "Kam", reports: 42, done: 29 },
  { day: "Jum", reports: 34, done: 24 },
  { day: "Sab", reports: 48, done: 32 },
  { day: "Min", reports: 30, done: 21 },
] as const;

export const ADMIN_WEEKLY_TRENDS = [
  { day: "Sen", handled: 14 },
  { day: "Sel", handled: 42 },
  { day: "Rab", handled: 23 },
  { day: "Kam", handled: 56 },
  { day: "Jum", handled: 37 },
  { day: "Sab", handled: 66 },
  { day: "Min", handled: 49 },
] as const;