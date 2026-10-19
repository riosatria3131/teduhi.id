"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, ClipboardIcon, HomeIcon, ListIcon, UserIcon } from "@/components/icons";
import { Brand } from "@/components/auth-panel";

const links = [
  { href: "/portal", label: "Beranda", Icon: HomeIcon },
  { href: "/portal/buat-laporan", label: "Buat Laporan", Icon: ClipboardIcon },
  { href: "/portal/riwayat", label: "Riwayat Laporan", Icon: ListIcon },
  { href: "/portal/notifikasi", label: "Notifikasi", Icon: BellIcon },
  { href: "/portal/profil", label: "Profil", Icon: UserIcon },
];

export function PortalSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white px-5 py-7 lg:flex">
      <div className="px-2"><Brand /></div>
      <p className="mb-3 mt-10 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Menu utama</p>
      <nav aria-label="Navigasi portal" className="grid gap-1">
        {links.map(({ href, label, Icon }) => {
          const active = href === "/portal" ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${active ? "bg-brand-soft text-brand-dark" : "text-muted hover:bg-paper hover:text-ink"}`}>
              <Icon width={19} height={19} />{label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl bg-paper p-4">
        <p className="text-sm font-bold text-ink">Ada kendala?</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">Pusat bantuan TEDUHI siap membantu Anda.</p>
        <Link href="/portal/notifikasi" className="mt-3 inline-flex text-xs font-bold text-brand-dark hover:underline">Lihat bantuan</Link>
      </div>
    </aside>
  );
}