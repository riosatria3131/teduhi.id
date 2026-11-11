"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardIcon, HomeIcon, ListIcon, MessageIcon, UserIcon } from "@/components/icons";
import { Brand } from "@/components/auth-panel";

const links = [
  { href: "/portal", label: "Beranda", Icon: HomeIcon },
  { href: "/portal/buat-laporan", label: "Buat Laporan", Icon: ClipboardIcon },
  { href: "/portal/riwayat", label: "Riwayat Laporan", Icon: ListIcon },
  { href: "/portal/notifikasi", label: "Pesan", Icon: MessageIcon },
  { href: "/portal/profil", label: "Profil", Icon: UserIcon },
];

export function PortalSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r-2 border-white/80 bg-white/75 px-5 py-7 backdrop-blur-xl lg:flex">
      <div className="px-2"><Brand /></div>
      <p className="mb-3 mt-10 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Menu utama</p>
      <nav aria-label="Navigasi portal" className="grid gap-1">
        {links.map(({ href, label, Icon }) => {
          const active = href === "/portal" ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${active ? "border border-blue-400/70 bg-white/45 text-blue-800 shadow-sm" : "text-[#4f6487] hover:bg-white/35 hover:text-[#102a61]"}`}>
              <Icon width={19} height={19} />{label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}