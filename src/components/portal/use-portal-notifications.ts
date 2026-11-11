"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

const READ_KEY = "laporkota:demo-read-notifications";
const DISMISSED_KEY = "laporkota:dismissed-notifications";
const READ_CHANGED = "laporkota:notifications-read-changed";
type StatusNotification = {
  id: string;
  reportId: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
};

let cachedStatusNotifications: { userId: string; data: StatusNotification[]; fetchedAt: number } | null = null;
let statusNotificationsRequest: { userId: string; promise: Promise<StatusNotification[]> } | null = null;

async function loadStatusNotifications(userId: string): Promise<StatusNotification[]> {
  if (cachedStatusNotifications?.userId === userId && Date.now() - cachedStatusNotifications.fetchedAt < 15000) {
    return cachedStatusNotifications.data;
  }
  if (statusNotificationsRequest?.userId === userId) return statusNotificationsRequest.promise;

  const promise = (async () => {
    const supabase = getSupabaseClient();
    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select("id")
      .eq("user_id", userId);
    if (reportsError) throw reportsError;

    const reportIds = (reports ?? []).map((report) => report.id);
    if (reportIds.length === 0) {
      cachedStatusNotifications = { userId, data: [], fetchedAt: Date.now() };
      return [];
    }

    const { data, error } = await supabase
      .from("report_notifications")
      .select("id, report_id, title, message, is_read, created_at")
      .eq("user_id", userId)
      .in("report_id", reportIds)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const latestByReport = new Map<string, StatusNotification>();
    for (const item of data ?? []) {
      const reportId = String(item.report_id);
      if (latestByReport.has(reportId)) continue;
      latestByReport.set(reportId, {
        id: `status:${item.id}`,
        reportId,
        title: item.title,
        detail: item.message,
        time: new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at)),
        unread: !item.is_read,
      });
    }
    const notifications = Array.from(latestByReport.values());
    cachedStatusNotifications = { userId, data: notifications, fetchedAt: Date.now() };
    return notifications;
  })();
  statusNotificationsRequest = { userId, promise };
  try {
    return await promise;
  } finally {
    if (statusNotificationsRequest?.promise === promise) statusNotificationsRequest = null;
  }
}

function getReadIds() {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(READ_KEY);
    return saved ? JSON.parse(saved) as string[] : [];
  } catch {
    return [];
  }
}

function getDismissedIds() {
  if (typeof window === "undefined") return [];
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function usePortalNotifications() {
  const [read, setRead] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [statusNotifications, setStatusNotifications] = useState<StatusNotification[]>([]);
  const [notificationError, setNotificationError] = useState("");

  const refreshStatusNotifications = useCallback(async () => {
    const supabase = getSupabaseClient();
    // Reading the cached session avoids an extra network request to auth on each refresh.
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;
    const user = session?.user;
    if (!user) {
      setStatusNotifications([]);
      setNotificationError("Masuk ke akun warga untuk melihat notifikasi.");
      return;
    }

    const notifications = await loadStatusNotifications(user.id);
    setStatusNotifications(notifications);
    setNotificationError("");
  }, []);

  useEffect(() => {
    let inFlight = false;
    const syncState = () => {
      setRead(getReadIds());
      setDismissed(getDismissedIds());
    };
    const refresh = () => {
      if (inFlight || document.visibilityState !== "visible") return;
      inFlight = true;
      void refreshStatusNotifications()
        .catch((error: unknown) => {
          setNotificationError(error instanceof Error ? error.message : "Notifikasi laporan gagal dimuat.");
        })
        .finally(() => {
          inFlight = false;
        });
    };
    syncState();
    refresh();
    window.addEventListener(READ_CHANGED, syncState);
    window.addEventListener("storage", syncState);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener(READ_CHANGED, syncState);
      window.removeEventListener("storage", syncState);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [refreshStatusNotifications]);

  // Only surface unread notifications. Applying the local read state before
  // rendering prevents stale responses from bringing opened messages back.
  const notifications = statusNotifications.filter(
    (item) => item.unread && !read.includes(item.id) && !dismissed.includes(item.id),
  );

  const unreadCount = notifications.length;

  function markRead(id: string) {
    const next = read.includes(id) ? read : [...read, id];
    setRead(next);
    if (id.startsWith("status:")) {
      const notificationId = id.slice("status:".length);
      void getSupabaseClient().auth.getSession().then(({ data, error }) => {
        if (error) throw error;
        if (!data.session?.user) return;
        return getSupabaseClient()
          .from("report_notifications")
          .update({ is_read: true })
          .eq("id", notificationId)
          .eq("user_id", data.session.user.id);
      }).then((result) => {
        if (result?.error) throw result.error;
      }).catch((error: unknown) => {
        setNotificationError(error instanceof Error ? error.message : "Status baca notifikasi gagal disimpan.");
      });
      setStatusNotifications((current) => {
        const nextNotifications = current.map((item) => item.id === id ? { ...item, unread: false } : item);
        if (cachedStatusNotifications) cachedStatusNotifications = { ...cachedStatusNotifications, data: nextNotifications };
        return nextNotifications;
      });
    }
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(READ_CHANGED));
    } catch {
      // UI tetap berfungsi jika penyimpanan lokal tidak tersedia.
    }
  }

  function markAllRead() {
    const next = notifications.map((item) => item.id);
    setRead(next);
    const notificationIds = next
      .filter((id) => id.startsWith("status:"))
      .map((id) => id.slice("status:".length));
    if (notificationIds.length > 0) {
      void getSupabaseClient().auth.getSession().then(({ data, error }) => {
        if (error) throw error;
        if (!data.session?.user) return;
        return getSupabaseClient()
          .from("report_notifications")
          .update({ is_read: true })
          .in("id", notificationIds)
          .eq("user_id", data.session.user.id);
      }).then((result) => {
        if (result?.error) throw result.error;
      }).catch((error: unknown) => {
        setNotificationError(error instanceof Error ? error.message : "Status baca notifikasi gagal disimpan.");
      });
    }
    setStatusNotifications((current) => {
      const nextNotifications = current.map((item) => ({ ...item, unread: false }));
      if (cachedStatusNotifications) cachedStatusNotifications = { ...cachedStatusNotifications, data: nextNotifications };
      return nextNotifications;
    });
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(READ_CHANGED));
    } catch {
      // UI tetap berfungsi jika penyimpanan lokal tidak tersedia.
    }
  }

  function dismiss(id: string) {
    const next = [...new Set([...getDismissedIds(), id])];
    setDismissed(next);
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(READ_CHANGED));
    } catch {
      // UI tetap berfungsi jika penyimpanan lokal tidak tersedia.
    }
  }

  return { notifications, unreadCount, read, notificationError, markRead, markAllRead, dismiss };
}
