"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

const TABLE = "admin_notification_preferences";
const CHANGED_EVENT = "teduhi:admin-notification-preference-changed";
const MIGRATION_ERROR = "Preferensi notifikasi belum tersedia. Terapkan migrasi Supabase terbaru, lalu muat ulang halaman.";

export async function getAdminNotificationsEnabled(): Promise<boolean> {
  const { data, error } = await getSupabaseClient()
    .from(TABLE)
    .select("enabled")
    .eq("singleton", true)
    .maybeSingle();
  if (error || !data) throw new Error(error?.message || MIGRATION_ERROR);
  return Boolean(data.enabled);
}

export async function saveAdminNotificationsEnabled(enabled: boolean): Promise<boolean> {
  const { data, error } = await getSupabaseClient()
    .from(TABLE)
    .update({ enabled })
    .eq("singleton", true)
    .select("enabled")
    .single();
  if (error || !data) throw new Error(error?.message || MIGRATION_ERROR);
  window.dispatchEvent(new Event(CHANGED_EVENT));
  return Boolean(data.enabled);
}

function subscribeToAdminNotificationPreference(onChange: () => void, onError: (message: string) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const supabase = getSupabaseClient();
  const channel = supabase
    .channel(`admin-notification-preference-${crypto.randomUUID()}`)
    .on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: TABLE,
      filter: "singleton=eq.true",
    }, onChange)
    .subscribe((status) => {
      if (status === "SUBSCRIBED") onChange();
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        onError("Koneksi realtime preferensi notifikasi terputus. Periksa konfigurasi Supabase Realtime.");
      }
    });
  window.addEventListener(CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener(CHANGED_EVENT, onChange);
    void supabase.removeChannel(channel);
  };
}

export function useAdminNotificationPreference() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = useCallback(async (nextEnabled: boolean): Promise<boolean> => {
    setSaving(true);
    setError("");
    try {
      const savedEnabled = await saveAdminNotificationsEnabled(nextEnabled);
      setEnabled(savedEnabled);
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : MIGRATION_ERROR);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const sync = () => {
      void getAdminNotificationsEnabled().then((current) => {
        if (!active) return;
        setEnabled(current);
        setError("");
      }).catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : MIGRATION_ERROR);
      });
    };
    const timer = window.setTimeout(sync, 0);
    const unsubscribe = subscribeToAdminNotificationPreference(sync, (message) => {
      if (active) setError(message);
    });
    return () => {
      active = false;
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return { enabled, error, saving, save };
}