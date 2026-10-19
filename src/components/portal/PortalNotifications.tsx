"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BellIcon, CheckIcon } from "@/components/icons";
import { MOCK_NOTIFICATIONS } from "./portal-data";
import { usePortalReports } from "./use-portal-reports";

const READ_KEY = "laporkota:demo-read-notifications";

export function PortalNotifications() {
    const [read, setRead] = useState<string[]>([]);
    const [ready, setReady] = useState(false);
    const { reports } = usePortalReports();
    const notifications = useMemo(() => [
        ...reports.filter((report) => report.localOnly).map((report) => ({
            id: `local:${report.id}`,
            reportId: report.id,
            title: "Laporan demo tersimpan di browser",
            detail: `${report.title} · ${report.location}`,
            time: report.date,
            unread: true,
        })),
        ...MOCK_NOTIFICATIONS,
    ], [reports]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(READ_KEY);
            if (saved) setRead(JSON.parse(saved) as string[]);
        } catch {
            setRead([]);
        } finally {
            setReady(true);
        }
    }, []);

    useEffect(() => {
        if (ready) localStorage.setItem(READ_KEY, JSON.stringify(read));
    }, [read, ready]);

    const unreadCount = notifications.filter((item) => !read.includes(item.id) && item.unread).length;
    function markRead(id: string) {
        setRead((current) => current.includes(id) ? current : [...current, id]);
    }

    return (
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted">{unreadCount} belum dibaca · notifikasi lokal dan contoh</p><button type="button" onClick={() => setRead(notifications.map((item) => item.id))} className="rounded-lg px-3 py-2 text-xs font-bold text-brand-dark hover:bg-brand-soft">Tandai semua dibaca</button></div>
            <div className="divide-y divide-line">
                {notifications.map((item) => {
                    const isRead = !item.unread || read.includes(item.id);
                    return <article key={item.id} className={`flex gap-3 py-4 first:pt-1 last:pb-1 ${isRead ? "opacity-70" : ""}`}>
                        <span className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl ${isRead ? "bg-paper text-muted" : "bg-brand-soft text-brand-dark"}`}>{isRead ? <CheckIcon width={19} height={19} /> : <BellIcon width={19} height={19} />}</span>
                        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-bold text-ink">{item.title}</h2>{!isRead && <span className="size-2 rounded-full bg-teal-500" />}</div><p className="mt-1 text-sm text-muted">{item.detail}</p><p className="mt-1.5 text-xs text-muted">{item.time}</p><Link href={`/portal/riwayat/${encodeURIComponent(item.reportId)}`} className="mt-2 inline-flex text-xs font-bold text-brand-dark hover:underline">Buka laporan</Link></div>
                        {!isRead && <button type="button" onClick={() => markRead(item.id)} className="self-center text-xs font-semibold text-brand-dark hover:underline">Tandai dibaca</button>}
                    </article>;
                })}
            </div>
            <p className="mt-5 rounded-xl bg-paper px-4 py-3 text-xs leading-relaxed text-muted">Status baca contoh disimpan lokal di browser. Notifikasi laporan demo tidak berarti laporan diterima atau diproses instansi.</p>
        </section>
    );
}