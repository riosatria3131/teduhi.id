import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — TEDUHI",
  description: "Ketentuan penggunaan TEDUHI untuk menyampaikan dan memantau laporan bencana.",
};

const terms = [
  {
    title: "1. Penggunaan TEDUHI",
    paragraphs: [
      "TEDUHI membantu warga menyampaikan informasi kejadian dan memantau perkembangan laporan. Dengan menggunakan layanan ini, Anda setuju mengikuti ketentuan pada halaman ini.",
    ],
  },
  {
    title: "2. Sampaikan laporan yang benar",
    paragraphs: [
      "Kirim laporan berdasarkan kejadian yang benar-benar Anda ketahui. Jangan mengirim laporan palsu, mengada-ada, atau sengaja menyesatkan. Isi lokasi, waktu, kategori, dan keterangan seakurat mungkin; jangan mengirim laporan berulang untuk kejadian yang sama kecuali ada perkembangan penting.",
    ],
  },
  {
    title: "3. Gunakan foto yang sesuai",
    paragraphs: [
      "Foto yang diunggah harus berkaitan dengan kejadian dan membantu menjelaskan kondisi di lokasi. Jangan mengirim foto aneh, tidak relevan, hasil manipulasi yang menyesatkan, atau berisi konten yang tidak pantas. Hindari menampilkan wajah, alamat, nomor kendaraan, atau informasi pribadi orang lain jika tidak diperlukan.",
    ],
  },
  {
    title: "4. Hormati pengguna lain",
    paragraphs: [
      "Jangan menggunakan TEDUHI untuk mengirim spam, ancaman, ujaran kebencian, menyamar sebagai orang lain, atau materi yang melanggar hukum. Pastikan keterangan laporan tetap sopan dan berfokus pada masalah yang dilaporkan.",
    ],
  },
  {
    title: "5. Verifikasi dan tindak lanjut",
    paragraphs: [
      "Laporan dapat diperiksa sebelum diteruskan kepada pihak terkait. Status dan waktu tindak lanjut bergantung pada proses verifikasi serta instansi yang berwenang; pengiriman laporan tidak menjamin penanganan pada waktu tertentu.",
      "TEDUHI bukan layanan tanggap darurat. Untuk keadaan yang mengancam keselamatan atau membutuhkan pertolongan segera, hubungi layanan darurat atau petugas resmi di wilayah Anda.",
    ],
  },
  {
    title: "6. Informasi pribadi",
    paragraphs: [
      "Cantumkan hanya informasi yang diperlukan untuk memahami dan menindaklanjuti laporan. Jangan mengirim kata sandi, data keuangan, atau informasi sensitif milik Anda maupun orang lain melalui kolom laporan.",
    ],
  },
  {
    title: "7. Penanganan penyalahgunaan",
    paragraphs: [
      "Laporan yang tidak sesuai, tidak relevan, atau terindikasi palsu dapat ditolak atau dibatasi. Penyalahgunaan layanan yang berulang dapat menyebabkan akses akun dibatasi sesuai kebutuhan pengelolaan layanan.",
    ],
  },
  {
    title: "8. Perubahan ketentuan dan bantuan",
    paragraphs: [
      "Ketentuan dapat diperbarui seiring perubahan layanan. Jika memiliki pertanyaan, hubungi support@teduhi.id.",
    ],
  },
];

export default function SyaratKetentuanPage() {
  return (
    <>
      <SiteHeader />
      <main id="top" className="flex-1 bg-[#f5f8ff] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <header className="mb-8 rounded-3xl bg-[#102a61] px-6 py-8 text-white sm:px-10 sm:py-10">
            <p className="text-xs font-extrabold tracking-[0.2em] text-sky-200 uppercase">TEDUHI</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Syarat &amp; Ketentuan</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
              Panduan penggunaan TEDUHI agar laporan bencana tetap jelas, relevan, dan dapat ditindaklanjuti.
            </p>
            <p className="mt-5 text-xs text-blue-200">Berlaku sejak 30 Oktober 2026</p>
          </header>

          <article className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-10">
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <strong>Mohon diperhatikan:</strong> jangan mengirim laporan palsu atau foto aneh/tidak relevan. Informasi yang akurat membantu pihak terkait memahami kondisi sebenarnya.
            </div>
            <div className="grid gap-8">
              {terms.map((section) => (
                <section key={section.title}>
                  <h2 className="text-lg font-extrabold text-[#102a61]">{section.title}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="mt-2 text-sm leading-7 text-muted">{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>
          </article>
          <div className="mt-8 flex justify-center">
            <Link href="/#beranda" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#102a61] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900">
              <span aria-hidden="true">←</span>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
