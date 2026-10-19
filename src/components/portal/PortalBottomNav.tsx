"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, HomeIcon, ListIcon, PlusIcon, UserIcon } from "@/components/icons";

const items = [
  { href: "/portal", label: "Beranda", Icon: HomeIcon },
  { href: "/portal/riwayat", label: "Laporan", Icon: ListIcon },
  { href: "/portal/buat-laporan", label: "Buat", Icon: PlusIcon, primary: true },
  { href: "/portal/notifikasi", label: "Notifikasi", Icon: BellIcon },
  { href: "/portal/profil", label: "Profil", Icon: UserIcon },
];

export function PortalBottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigasi bawah" className="fixed inset-x-0 bottom-0 z-40 grid min-h-[76px] grid-cols-5 border-t border-slate-100 bg-white/95 px-1 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-2 backdrop-blur lg:hidden">
      {items.map(({ href, label, Icon, primary }) => {
        const active = href === "/portal" ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-semibold ${primary ? "-mt-8" : active ? "text-blue-600" : "text-slate-500"}`}>
            <span className={primary ? "grid size-14 place-items-center rounded-full border-[5px] border-[#f7faff] bg-linear-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-700/25" : "grid size-7 place-items-center"}><Icon width={primary ? 25 : 20} height={primary ? 25 : 20} /></span>
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}