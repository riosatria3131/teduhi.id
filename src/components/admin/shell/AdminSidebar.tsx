"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BuildingsIcon, FileIcon, HomeIcon, LogOutIcon, LogoMark, PhoneIcon, SettingsIcon, UserIcon } from "@/components/icons";

const links = [
  { href: "/admin", label: "Dashboard", Icon: HomeIcon },
  { href: "/admin/laporan", label: "Kelola Laporan", Icon: FileIcon },
  { href: "/admin/warga", label: "Data Warga", Icon: UserIcon },
  { href: "/admin/kontak-petugas", label: "Kontak Petugas", Icon: PhoneIcon },
  { href: "/admin/pengajuan-bpdlh", label: "Pengajuan ke BPDLH", Icon: BuildingsIcon },
  { href: "/admin/pengaturan", label: "Pengaturan", Icon: SettingsIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-slate-100 bg-white px-4 py-4 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-b-0 lg:px-5 lg:py-7">
      <Link href="/admin" className="flex items-center gap-3 px-1 lg:px-0">
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
      <p className="mb-3 mt-8 hidden px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 lg:block">Menu admin</p>
      <nav aria-label="Navigasi admin" className="mt-4 flex gap-1 overflow-x-auto lg:mt-0 lg:grid lg:overflow-visible">
        {links.map(({ href, label, Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors lg:px-3.5 ${active ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-[#102a61]"}`}><Icon width={18} height={18} />{label}</Link>;
        })}
      </nav>
      <button type="button" onClick={() => window.dispatchEvent(new Event("teduhi:admin-logout"))} className="mt-3 hidden items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 lg:flex"><LogOutIcon width={18} height={18} />Keluar</button>
    </aside>
  );
}