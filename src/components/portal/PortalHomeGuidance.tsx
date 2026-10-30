import Link from "next/link";
import { ArrowRightIcon, CameraIcon, ClockIcon, FileIcon, PinIcon, ShieldCheckIcon } from "@/components/icons";

const guidanceItems = [
  {
    title: "Ambil foto yang jelas",
    description: "Tunjukkan kondisi dan area sekitar agar petugas lebih mudah memahami situasi.",
    Icon: CameraIcon,
    tone: "bg-sky-50 text-sky-700",
  },
  {
    title: "Jelaskan lokasi",
    description: "Tandai lokasi pada peta dan tambahkan alamat atau patokan terdekat.",
    Icon: PinIcon,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Ceritakan kondisi",
    description: "Sampaikan jenis kejadian, waktu diketahui, dan dampak yang terlihat secara singkat.",
    Icon: FileIcon,
    tone: "bg-violet-50 text-violet-700",
  },
];

export function PortalHomeGuidance() {
  return (
    <section aria-labelledby="resident-information-title" className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)] sm:rounded-3xl sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><ShieldCheckIcon width={21} height={21} /></span>
        <div className="min-w-0">
          <h2 id="resident-information-title" className="text-base font-extrabold text-[#102a61] sm:text-lg">Informasi untuk Warga</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">Panduan singkat agar laporan lebih jelas dan mudah ditindaklanjuti.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {guidanceItems.map(({ title, description, Icon, tone }) => (
          <article key={title} className="flex min-w-0 gap-3 rounded-xl border border-slate-100 bg-[#fbfdff] p-3.5 sm:p-4">
            <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tone}`}><Icon width={18} height={18} /></span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#102a61]">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
            </div>
          </article>
        ))}
        <Link href="/portal/riwayat" className="flex min-w-0 gap-3 rounded-xl border border-slate-100 bg-[#fbfdff] p-3.5 transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700"><ClockIcon width={18} height={18} /></span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-[#102a61]">Pantau perkembangan</span>
            <span className="mt-1 block text-xs leading-relaxed text-slate-500">Cek status dan tindak lanjut laporan Anda kapan saja.</span>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-700">Lihat riwayat <ArrowRightIcon width={14} height={14} /></span>
          </span>
        </Link>
      </div>

      <p className="mt-4 rounded-xl bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-900">
        Utamakan keselamatan. Untuk keadaan darurat, hubungi layanan darurat setempat.
      </p>
    </section>
  );
}