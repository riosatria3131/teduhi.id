import { getSupabaseClient } from "@/lib/supabaseClient";

const READ_KEY = "teduhi:admin-notification-read-ids";

export function getLocalAdminNotificationReadIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(READ_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function saveLocalAdminNotificationReadIds(ids: string[]) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...new Set(ids)]));
    window.dispatchEvent(new Event("teduhi:management-decision-notifications-changed"));
    window.dispatchEvent(new Event("teduhi:bpdlh-notification-reads-changed"));
  } catch {
    // Persisted Supabase state remains available if browser storage is disabled.
  }
}

export async function loadAdminNotificationReadIds(): Promise<string[]> {
  const localIds = getLocalAdminNotificationReadIds();
  const supabase = getSupabaseClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session?.user) return localIds;

  const { data, error } = await supabase
    .from("admin_notification_reads")
    .select("notification_id")
    .eq("user_id", session.user.id);
  if (error) throw error;

  const ids = [...new Set([...localIds, ...(data ?? []).map((item) => item.notification_id)])];
  if (localIds.length > 0) {
    const { error: saveError } = await supabase.from("admin_notification_reads").upsert(
      localIds.map((notificationId) => ({ user_id: session.user.id, notification_id: notificationId })),
      { onConflict: "user_id,notification_id", ignoreDuplicates: true },
    );
    if (saveError) throw saveError;
  }
  saveLocalAdminNotificationReadIds(ids);
  return ids;
}

export function markAdminNotificationReadIds(ids: string[]): void {
  if (ids.length === 0) return;
  const allIds = [...new Set([...getLocalAdminNotificationReadIds(), ...ids])];
  saveLocalAdminNotificationReadIds(allIds);

  const supabase = getSupabaseClient();
  void supabase.auth.getSession().then(({ data, error }) => {
    if (error) throw error;
    const user = data.session?.user;
    if (!user) return;
    return supabase.from("admin_notification_reads").upsert(
      ids.map((notificationId) => ({ user_id: user.id, notification_id: notificationId })),
      { onConflict: "user_id,notification_id", ignoreDuplicates: true },
    ).then(({ error: saveError }) => {
      if (saveError) throw saveError;
    });
  }).catch(() => {
    // Keep local read state if the migration or network is temporarily unavailable.
  });
}
