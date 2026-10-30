# TEDUHI

**Temukan, Edukasi, dan Hadapi**

> Kontribusi saja tidak cukup, sebagai bukti dari tanggung jawab yang harus dilakukan, BPDLH & BNPB perlu tergabung dalam satu wadah yang responsif, solutif, dan transparan bagi masyarakat. Dengan ini kami bangun sebuah website yang mencakup semua kebutuhan tersebut, TEDUHI.

TEDUHI adalah platform untuk menyampaikan dan memantau laporan bencana serta kondisi fasilitas umum, sekaligus menghubungkan masyarakat dengan pihak terkait.

## Teknologi yang digunakan

- **Next.js 16** — framework aplikasi web dengan App Router.
- **React 19** — pustaka untuk membangun antarmuka.
- **TypeScript** — JavaScript dengan pemeriksaan tipe.
- **Tailwind CSS 4** — styling antarmuka responsif.
- **Supabase** (`@supabase/supabase-js`) — autentikasi dan akses data.
- **ESLint 9** — pemeriksaan kualitas kode.

## Menjalankan project

### Persiapan

- Instal [Node.js](https://nodejs.org/) versi LTS yang menyertakan npm.
- Siapkan project Supabase dan nilai **Project URL** serta **anon/public key**.

### Instalasi

1. Clone repository dan masuk ke folder project:

   ```bash
   git clone https://github.com/riosatria3131/teduhi.id.git
   cd teduhi.id
   ```

2. Instal dependensi:

   ```bash
   npm install
   ```

3. Buat file `.env.local` di root project dan isi dengan konfigurasi Supabase:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=URL_PROJECT_SUPABASE
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ANON_PUBLIC_KEY_SUPABASE
   ```

   Jangan masukkan secret atau file `.env.local` ke repository. Pengaturan provider Google OAuth dilakukan melalui Supabase Authentication dan Google Cloud Console.

4. Jalankan server pengembangan:

   ```bash
   npm run dev
   ```

5. Buka [http://localhost:3000](http://localhost:3000).

### Perintah lain

```bash
npm run lint    # Periksa kode dengan ESLint
npm run build   # Buat build untuk produksi
npm run start   # Jalankan build produksi
```

## Progres project

- Halaman landing page: **selesai**.
- Halaman login: **selesai**.
- Halaman pengguna/warga: **selesai**.
- Halaman admin: **selesai**.
- Tahap berikutnya: **penambahan fitur baru**.