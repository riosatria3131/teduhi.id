"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

const TABLE = "bpdlh_notification_preferences";
const CHANGE_EVENT = "teduhi:bpdlh-notification-preference-changed";
const LOAD_ERROR = "Preferensi notifikasi BPDLH gagal dimuat. Terapkan migrasi Supabase terbaru.";

export type BpdlhNotificationPreferences = {
  newSubmissionsEnabled: boolean;
  statusChangesEnabled: boolean;
};

const DEFAULT_PREFERENCES: BpdlhNotificationPreferences = {
  newSubmissionsEnabled: true,
  statusChangesEnabled: true,
};

type PreferenceRow = {
  new_submissions_enabled: boolean;
  status_changes_enabled: boolean;
};

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await getSupabaseClient().auth.getUser();
  if (error || !data.user) throw new Error(error?.message || "Sesi admin BPDLH tidak ditemukan.");
  return data.user.id;
}

export async function getBpdlhNotificationPreferences(): Promise<BpdlhNotificationPreferences> {
  const userId = await getCurrentUserId();
  const { data, error } = await getSupabaseClient()
    .from(TABLE)
    .select("new_submissions_enabled,status_changes_enabled")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return DEFAULT_PREFERENCES;
  const row = data as PreferenceRow;
  return {
    newSubmissionsEnabled: row.new_submissions_enabled,
    statusChangesEnabled: row.status_changes_enabled,
  };
}

export async function saveBpdlhNotificationPreferences(preferences: BpdlhNotificationPreferences): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await getSupabaseClient().from(TABLE).upsert({
    user_id: userId,
    new_submissions_enabled: preferences.newSubmissionsEnabled,
    status_changes_enabled: preferences.statusChangesEnabled,
  }, { onConflict: "user_id" });
  if (error) throw error;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useBpdlhNotificationPreferences() {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [draft, setDraft] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const sync = useCallback(async () => {
    try {
      const current = await getBpdlhNotificationPreferences();
      setPreferences(current);
      setDraft(current);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let channel: ReturnType<ReturnType<typeof getSupabaseClient>["channel"]> | null = null;
    const refresh = () => {
      if (active) void sync();
    };
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener(CHANGE_EVENT, refresh);
    void getCurrentUserId().then((userId) => {
      if (!active) return;
      const supabase = getSupabaseClient();
      channel = supabase
        .channel(`bpdlh-notification-preferences-${userId}`)
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: TABLE,
          filter: `user_id=eq.${userId}`,
        }, refresh)
        .subscribe((status) => {
          if (status === "SUBSCRIBED") refresh();
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setError("Koneksi realtime preferensi notifikasi terputus.");
          }
        });
    }).catch((loadError: unknown) => {
      if (active) setError(loadError instanceof Error ? loadError.message : LOAD_ERROR);
    });
    return () => {
      active = false;
      window.clearTimeout(timer);
      window.removeEventListener(CHANGE_EVENT, refresh);
      if (channel) void getSupabaseClient().removeChannel(channel);
    };
  }, [sync]);

  const save = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await saveBpdlhNotificationPreferences(draft);
      setPreferences(draft);
      setSaved(true);
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Preferensi notifikasi gagal disimpan.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [draft]);

  function updateDraft(key: keyof BpdlhNotificationPreferences, value: boolean) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  return { preferences, draft, loading, saving, saved, error, updateDraft, save };
}
