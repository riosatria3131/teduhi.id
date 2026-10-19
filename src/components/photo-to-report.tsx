import { ArrowDownIcon, CameraIcon, CheckIcon, SparkleIcon } from "./icons";

const STEPS = [
  { no: "01", title: "Foto", text: "Ambil foto kerusakan, tulis patokan lokasinya, lalu periksa sebelum dikirim." },
  { no: "02", title: "Verifikasi", text: "Pemerintah memeriksa validitas laporan di dasbor admin." },
  { no: "03", title: "Perbaikan", text: "Petugas dinas turun ke lokasi untuk melakukan perbaikan." },
  { no: "04", title: "Selesai", text: "Bukti hasil perbaikan diunggah dan status berubah menjadi transparan." },
];

export function PhotoToReport() {
  return (
    <section id="cara-kerja" aria-labelledby="judul-alur" className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="grid items-center gap-10 md:gap-12 lg:grid-cols-2">
        {/* Panel mockup */}
        <div
          aria-hidden="true"
          className="relative overflow-hidden rounded-2xl bg-night px-5 py-9 select-none sm:px-8 sm:py-10"
          style={{
            backgroundImage:
              "radial-gradient(70% 70% at 0% 0%, #1f3187 0%, transparent 62%), radial-gradient(70% 70% at 100% 100%, #0b4a52 0%, transparent 65%)",
          }}
        >
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-white">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-mint text-night">
              <CameraIcon width={22} height={22} />
            </span>
            <span className="leading-tight">
              <span className="block text-[11px] font-extrabold tracking-[0.16em] text-mint uppercase">Foto Anda</span>
              <span className="mt-1.5 block text-[15px] font-medium">Jalan berlubang di depan sekolah, Jl. Merdeka.</span>
            </span>
          </div>

          <ArrowDownIcon width={20} height={20} className="mx-auto my-5 text-white/50" />

          <div className="rounded-2xl bg-white p-5 sm:ml-10">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="text-[10px] font-extrabold tracking-[0.16em] text-muted uppercase">Hasil laporan</p>
                <p className="mt-1 text-lg font-bold text-ink">Laporan baru</p>
              </div>
              <span className="grid size-9 place-items-center rounded-full bg-ok-soft text-ok">
                <CheckIcon width={18} height={18} />
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-paper px-4 py-3">
                <p className="text-[11px] text-muted">Kategori</p>
                <p className="mt-0.5 text-sm font-bold text-ink">Jalan &amp; Trotoar</p>
              </div>
              <div className="rounded-xl bg-paper px-4 py-3">
                <p className="text-[11px] text-muted">Lokasi</p>
                <p className="mt-0.5 text-sm font-bold text-ink">Bogor Tengah</p>
              </div>
            </div>
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-white/60 sm:ml-10 sm:justify-start">
            <SparkleIcon width={14} height={14} className="text-mint" />
            Siap diperiksa sebelum dikirim
          </p>
        </div>

        {/* Teks */}
        <div>
          <p className="text-[13px] font-extrabold tracking-[0.2em] text-brand-dark uppercase">
            Dari foto menjadi laporan
          </p>
          <h2
            id="judul-alur"
            className="mt-4 text-2xl leading-[1.15] font-extrabold tracking-[-0.03em] text-ink text-balance sm:text-3xl"
          >
            Anda cukup memotret. Laporan ikut tersusun.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-6 text-muted">
            Tidak ada formulir panjang atau istilah rumit. Foto kerusakannya, tulis lokasinya, lalu periksa sebelum dikirim.
          </p>

          <ol className="mt-9 divide-y divide-line border-y border-line">
            {STEPS.map((s) => (
              <li key={s.no} className="flex gap-4 py-5.5">
                <span className="mt-0.5 grid h-8 w-11 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-extrabold text-brand-dark">
                  {s.no}
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink">{s.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
