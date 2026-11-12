"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BuildingsIcon, FileIcon, HomeIcon, ListIcon, LogoMark, SettingsIcon } from "@/components/icons";

const navigation = [
  { label: "Dashboard", icon: HomeIcon, href: "/bpdlh" },
  { label: "Kotak Masuk Pengajuan", icon: FileIcon, href: "/bpdlh/pengajuan" },
  { label: "Riwayat Analisis", icon: ListIcon, href: "/bpdlh/audit" },
  { label: "Pos Anggaran", icon: BuildingsIcon, href: "/bpdlh/anggaran" },
  { label: "Analisis Anggaran", icon: BuildingsIcon, href: "/bpdlh/analisis-anggaran" },
  { label: "Pengaturan", icon: SettingsIcon, href: "/bpdlh/pengaturan" },
];

export function BpdlhSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-white/65 bg-white/75 px-4 py-3 backdrop-blur-xl lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-b-0 lg:px-3 lg:py-4">
      <Link href="/bpdlh" className="flex items-center gap-3 border-b border-slate-100 px-1 pb-4">
        <LogoMark size={52} />
        <span className="leading-tight">
          <span className="flex items-center gap-1 text-xl font-extrabold tracking-tight text-[#102a61]">
            Teduhi
            <span aria-hidden="true" className="ml-0.5 size-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-orange-500" />
          </span>
          <span className="mt-0.5 block whitespace-nowrap text-[11px] font-semibold">
            <span className="text-[#28577f]">Temukan, </span>
            <span className="text-orange-600">Edukasi </span>
            <span className="text-slate-500">dan </span>
            <span className="text-emerald-700">Hadapi</span>
          </span>
        </span>
      </Link>
      <div className="mt-3 hidden rounded-lg bg-blue-50 px-3 py-2 text-[10px] font-bold text-blue-700 lg:block">Management Keuangan</div>
      <nav aria-label="Navigasi admin BPDLH" className="mt-3 flex gap-1 overflow-x-auto pb-1 lg:mt-5 lg:grid lg:overflow-visible">
        {navigation.map(({ label, icon: Icon, href }) => {
          const active = pathname === href || (href !== "/bpdlh" && pathname.startsWith(`${href}/`));
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold transition lg:w-full ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"}`}>
              <Icon width={15} height={15} /><span className="flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
