export const CATEGORIES = [
  "Longsor",
  "Kebakaran",
  "Gempa Bumi",
  "Banjir",
  "Tsunami",
  "Lainnya",
] as const;

export const PROVINCES = ["Jawa Barat"] as const;

export const CITIES = ["Kota Bogor"] as const;

export const DISTRICTS = [
  "Bogor Tengah",
  "Bogor Utara",
  "Bogor Timur",
  "Bogor Selatan",
  "Bogor Barat",
  "Tanah Sareal",
] as const;

export const FAQS = [
  {
    q: "Siapa yang bisa membuat laporan?",
    a: "Semua warga. Cukup isi judul, kategori, foto bukti, deskripsi singkat, dan lokasi kerusakan.",
  },
  {
    q: "Berapa lama laporan saya ditindaklanjuti?",
    a: "Admin memeriksa laporan lebih dulu. Setelah dinyatakan valid, petugas dijadwalkan turun ke lokasi. Status laporan berubah di setiap tahap, jadi Anda tidak perlu bertanya kembali.",
  },
  {
    q: "Foto seperti apa yang sebaiknya saya unggah?",
    a: "Foto yang jelas dan menunjukkan kerusakan beserta sekitarnya, supaya petugas mudah mengenali tempatnya. Format JPG atau PNG, maksimal 5 MB.",
  },
  {
    q: "Bagaimana kalau saya tidak tahu koordinat lokasinya?",
    a: "Tidak perlu. Ketik daerah dan tulis alamat atau patokan terdekat.",
  },
  {
    q: "Mengapa laporan saya ditolak?",
    a: "Laporan bisa ditolak jika fotonya tidak menunjukkan bencana yang serius, lokasinya tidak jelas, atau sudah pernah dilaporkan orang lain.",
  },
];
