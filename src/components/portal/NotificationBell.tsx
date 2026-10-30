"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BellIcon } from "@/components/icons";
import { usePortalNotifications } from "./use-portal-notifications";

export function NotificationBell({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, saved, notificationError, saveToInformation } = usePortalNotifications();
  const recentNotifications = notifications.filter((item) => item.unread && !saved.includes(item.id)).slice(0, 6);

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={unreadCount ? `${unreadCount} informasi belum dibaca` : "Buka notifikasi"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`relative grid place-items-center rounded-full text-slate-600 transition hover:bg-[#f4f7fc] ${compact ? "size-10" : "size-11 rounded-2xl"}`}
      >
        <BellIcon width={compact ? 23 : 20} height={compact ? 23 : 20} />
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      {open && <>
        <section aria-label="Daftar notifikasi" className={`absolute top-[calc(100%+12px)] z-50 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ${compact ? "right-[-58px]" : "right-0"}`}>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="font-bold text-[#102a61]">Notifikasi</h2>
            {unreadCount > 0 && <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-bold text-rose-600">{unreadCount} baru</span>}
          </div>
          <div className="max-h-[min(420px,65vh)] overflow-y-auto">
            {notificationError && <p role="alert" className="px-4 py-3 text-xs text-rose-700">Notifikasi gagal dimuat: {notificationError}</p>}
            {recentNotifications.length > 0 ? recentNotifications.map((item) => (
              <Link
                key={item.id}
                href={`/portal/riwayat/${encodeURIComponent(item.reportId)}`}
                onClick={() => {
                  saveToInformation(item.id);
                  setOpen(false);
                }}
                className="block border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-[#102a61]">{item.title}</span>
                    <span className="mt-1 block truncate text-xs text-slate-500">{item.detail}</span>
                    <span className="mt-1 block text-[11px] text-slate-400">{item.time}</span>
                  </span>
                  {item.unread && <span className="mt-1 size-2 shrink-0 rounded-full bg-rose-500" />}
                </span>
              </Link>
            )) : !notificationError && <p className="px-4 py-6 text-center text-sm text-slate-500">Tidak ada notifikasi baru.</p>}
          </div>
          <Link href="/portal/notifikasi" onClick={() => setOpen(false)} className="block px-4 py-3 text-center text-sm font-bold text-blue-600 hover:bg-blue-50">Lihat semua informasi</Link>
        </section>
      </>}
    </div>
  );
}
