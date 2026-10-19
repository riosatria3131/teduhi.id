export const CATEGORIES = [
  "Jalan & Trotoar",
  "Penerangan Jalan",
  "Sampah",
  "Taman & Fasilitas",
  "Drainase & Saluran",
  "Lainnya",
] as const;

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
    a: "Pemerintah memeriksa laporan lebih dulu. Setelah dinyatakan valid, petugas dijadwalkan turun ke lokasi. Status laporan berubah di setiap tahap, jadi Anda tidak perlu bertanya.",
  },
  {
    q: "Foto seperti apa yang sebaiknya saya unggah?",
    a: "Foto yang jelas dan menunjukkan kerusakan beserta sekitarnya, supaya petugas mudah mengenali tempatnya. Format JPG atau PNG, maksimal 5 MB.",
  },
  {
    q: "Bagaimana kalau saya tidak tahu koordinat lokasinya?",
    a: "Tidak perlu. Pilih kecamatan dan tulis alamat atau patokan terdekat. Jika Anda sedang di lokasi, tekan “Gunakan lokasi saya” dan koordinat terisi otomatis.",
  },
  {
    q: "Mengapa laporan saya ditolak?",
    a: "Laporan bisa ditolak jika fotonya tidak menunjukkan kerusakan, lokasinya tidak jelas, atau sudah pernah dilaporkan orang lain. Anda bisa mengirim ulang dengan data yang lebih lengkap.",
  },
];
