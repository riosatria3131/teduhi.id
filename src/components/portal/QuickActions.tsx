import Link from "next/link";
import { ArrowRightIcon, ClipboardIcon, ClockIcon, PinIcon } from "@/components/icons";

const actions = [
  { href: "/portal/buat-laporan", title: "Buat Laporan", text: "Laporkan kerusakan di sekitar Anda", Icon: ClipboardIcon, tone: "blue" },
  { href: "https://www.google.com/maps/search/kerusakan+fasilitas+umum+Bogor", title: "Peta Laporan", text: "Peta kota eksternal; pin laporan belum tersedia", Icon: PinIcon, tone: "green", external: true },
  { href: "/portal/riwayat", title: "Riwayat", text: "Cek laporan yang pernah Anda kirim", Icon: ClockIcon, tone: "purple" },
];

export function QuickActions() {
  return (
    <section aria-labelledby="quick-title">
      <div className="mb-3"><h2 id="quick-title" className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">Layanan Warga</h2><p className="mt-0.5 text-sm text-muted">Lakukan aksi cepat untuk lingkungan yang lebih baik</p></div>
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {actions.map(({ href, title, text, Icon, tone, external }) => (
          <Link key={title} href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="group flex min-h-[176px] min-w-0 flex-col rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_4px_18px_-14px_rgba(16,39,92,0.35)] transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-[190px] sm:p-5">
            <span className={`mb-3 grid size-11 place-items-center rounded-2xl sm:size-14 ${tone === "green" ? "bg-emerald-100 text-emerald-600" : tone === "purple" ? "bg-violet-100 text-violet-600" : "bg-blue-100 text-blue-600"}`}><Icon width={23} height={23} /></span>
            <span className="block text-[12px] leading-tight font-extrabold text-[#102a61] sm:text-base">{title}</span>
            <span className="mt-1.5 line-clamp-3 block text-[10px] leading-snug text-slate-500 sm:text-sm">{text}</span>
            <ArrowRightIcon width={19} height={19} className={`mt-auto pt-2 transition-transform group-hover:translate-x-1 ${tone === "green" ? "text-emerald-500" : tone === "purple" ? "text-violet-500" : "text-blue-600"}`} />
          </Link>
        ))}
      </div>
    </section>
  );
}