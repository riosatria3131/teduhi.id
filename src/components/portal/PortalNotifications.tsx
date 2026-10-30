"use client";

import Link from "next/link";
import { usePortalNotifications } from "./use-portal-notifications";
import { BellIcon, CheckIcon } from "@/components/icons";

export function PortalNotifications() {
    const { notifications, unreadCount, read, saved, notificationError, markRead, markAllRead } = usePortalNotifications();
    const informationItems = [...notifications]
        .filter((item) => saved.includes(item.id))
        .sort((first, second) => {
            const firstIsLocal = first.id.startsWith("local:");
            const secondIsLocal = second.id.startsWith("local:");
            if (firstIsLocal !== secondIsLocal) return firstIsLocal ? -1 : 1;
            return 0;
        });

    return (
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted">{unreadCount} belum dibaca</p><button type="button" onClick={markAllRead} className="rounded-lg px-3 py-2 text-xs font-bold text-brand-dark hover:bg-brand-soft">Tandai semua dibaca</button></div>
            {notificationError && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Notifikasi gagal dimuat: {notificationError}</p>}
            <div className="divide-y divide-line">
                {informationItems.length === 0 && <p className="rounded-xl bg-paper px-4 py-6 text-center text-sm text-muted">Belum ada informasi tersimpan. Pilih notifikasi untuk menyimpannya di sini.</p>}
                {informationItems.map((item) => {
                    const isRead = !item.unread || read.includes(item.id);
                    return <article key={item.id} className={`flex gap-3 py-4 first:pt-1 last:pb-1 ${isRead ? "opacity-70" : ""}`}>
                        <span className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl ${isRead ? "bg-paper text-muted" : "bg-brand-soft text-brand-dark"}`}>{isRead ? <CheckIcon width={19} height={19} /> : <BellIcon width={19} height={19} />}</span>
                        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-bold text-ink">{item.title}</h2>{!isRead && <span className="size-2 rounded-full bg-teal-500" />}</div><p className="mt-1 text-sm text-muted">{item.detail}</p><p className="mt-1.5 text-xs text-muted">{item.time}</p><Link href={`/portal/riwayat/${encodeURIComponent(item.reportId)}`} onClick={() => markRead(item.id)} className="mt-2 inline-flex text-xs font-bold text-brand-dark hover:underline">Buka laporan</Link></div>
                        {!isRead && <button type="button" onClick={() => markRead(item.id)} className="self-center text-xs font-semibold text-brand-dark hover:underline">Tandai dibaca</button>}
                    </article>;
                })}
            </div>
        </section>
    );
}