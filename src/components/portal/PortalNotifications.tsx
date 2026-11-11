"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import { usePortalNotifications } from "./use-portal-notifications";
import { BellIcon, CheckIcon } from "@/components/icons";

type NotificationItemData = {
    id: string;
    reportId: string;
    title: string;
    detail: string;
    time: string;
};

function SwipeableNotification({
    item,
    isRead,
    onRead,
    onDismiss,
}: {
    item: NotificationItemData;
    isRead: boolean;
    onRead: () => void;
    onDismiss: () => void;
}) {
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const dismissTimer = useRef<number | null>(null);
    const [swipeX, setSwipeX] = useState(0);
    const [removing, setRemoving] = useState(false);

    useEffect(() => () => {
        if (dismissTimer.current !== null) window.clearTimeout(dismissTimer.current);
    }, []);

    function handleTouchStart(event: TouchEvent<HTMLElement>) {
        if (removing) return;
        const touch = event.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
    }

    function handleTouchMove(event: TouchEvent<HTMLElement>) {
        if (!touchStart.current || removing) return;
        const touch = event.touches[0];
        const deltaX = touch.clientX - touchStart.current.x;
        const deltaY = touch.clientY - touchStart.current.y;
        setSwipeX(deltaX > Math.abs(deltaY) ? Math.min(deltaX, 112) : 0);
    }

    function handleTouchEnd(event: TouchEvent<HTMLElement>) {
        if (!touchStart.current) return;
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStart.current.x;
        const deltaY = touch.clientY - touchStart.current.y;
        touchStart.current = null;
        if (deltaX >= 80 && deltaX > Math.abs(deltaY) * 1.25) {
            setRemoving(true);
            setSwipeX(window.innerWidth);
            dismissTimer.current = window.setTimeout(onDismiss, 320);
        } else {
            setSwipeX(0);
        }
    }

    return (
        <div className="relative overflow-hidden">
            <article
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={() => {
                    touchStart.current = null;
                    if (!removing) setSwipeX(0);
                }}
                style={{ transform: `translateX(${swipeX}px)`, opacity: removing ? 0 : undefined }}
                className={`relative flex touch-pan-y gap-3 bg-white py-4 ${removing ? "transition-all duration-300 ease-in-out motion-reduce:transition-none" : swipeX === 0 ? "transition-transform duration-150 ease-out" : ""} ${isRead ? "opacity-70" : ""}`}
            >
                <span className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl ${isRead ? "bg-paper text-muted" : "bg-brand-soft text-brand-dark"}`}>{isRead ? <CheckIcon width={19} height={19} /> : <BellIcon width={19} height={19} />}</span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-bold text-ink">{item.title}</h2>{!isRead && <span className="size-2 rounded-full bg-teal-500" />}</div>
                    <p className="mt-1 text-sm text-muted">{item.detail}</p>
                    <p className="mt-1.5 text-xs text-muted">{item.time}</p>
                    <Link href="/portal/notifikasi" onClick={onRead} className="mt-2 inline-flex text-xs font-bold text-brand-dark hover:underline">Buka pesan</Link>
                </div>
                <div className="flex shrink-0 flex-col items-end justify-center gap-2">
                    {!isRead && <button type="button" onClick={onRead} className="text-xs font-semibold text-brand-dark hover:underline">Tandai dibaca</button>}
                    <button type="button" onClick={onDismiss} aria-label={`Hapus informasi: ${item.title}`} className="text-xs font-semibold text-brand-dark hover:underline">Hapus</button>
                </div>
            </article>
        </div>
    );
}

export function PortalNotifications() {
    const { notifications, unreadCount, read, notificationError, markRead, markAllRead, dismiss } = usePortalNotifications();

    return (
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted">{unreadCount} belum dibaca</p><button type="button" onClick={markAllRead} className="rounded-lg px-3 py-2 text-xs font-bold text-brand-dark hover:bg-brand-soft">Tandai semua dibaca</button></div>
            <p className="-mt-2 mb-3 text-xs text-muted sm:hidden">Geser pesan ke kanan untuk menghapusnya.</p>
            {notificationError && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Notifikasi gagal dimuat: {notificationError}</p>}
            <div className="divide-y divide-line">
                {notifications.length === 0 && <p className="rounded-xl bg-paper px-4 py-6 text-center text-sm text-muted">Belum ada pesan terbaru.</p>}
                {notifications.map((item) => {
                    const isRead = !item.unread || read.includes(item.id);
                    return <SwipeableNotification
                        key={item.id}
                        item={item}
                        isRead={isRead}
                        onRead={() => markRead(item.id)}
                        onDismiss={() => dismiss(item.id)}
                    />;
                })}
            </div>
        </section>
    );
}