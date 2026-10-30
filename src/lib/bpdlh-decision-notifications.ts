export type BpdlhDecisionNotification = {
  id: string;
  requestId: string;
  requestTitle: string;
  decision: "Disetujui" | "Perlu Revisi" | "Ditolak";
  note: string;
  transferProofName?: string;
  transferDescription?: string;
  createdAt: string;
};

const NOTIFICATIONS_KEY = "teduhi:management-decision-notifications";
const READ_KEY = "teduhi:management-decision-notifications-read";
const CHANGED_EVENT = "teduhi:management-decision-notifications-changed";

export function getBpdlhDecisionNotifications(): BpdlhDecisionNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) ?? "[]");
    return Array.isArray(value) ? value as BpdlhDecisionNotification[] : [];
  } catch {
    return [];
  }
}

export function getReadDecisionNotificationIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(READ_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function publishBpdlhDecisionNotification(notification: BpdlhDecisionNotification): void {
  const existing = getBpdlhDecisionNotifications().filter((item) => item.id !== notification.id);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([notification, ...existing]));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function markDecisionNotificationsRead(ids: string[]): void {
  const allIds = new Set([...getReadDecisionNotificationIds(), ...ids]);
  localStorage.setItem(READ_KEY, JSON.stringify([...allIds]));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function subscribeToBpdlhDecisionNotifications(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(CHANGED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
