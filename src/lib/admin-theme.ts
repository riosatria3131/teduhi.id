export type AdminTheme = "light" | "dark" | "system";

const STORAGE_KEY = "teduhi:admin-theme";
const CHANGED_EVENT = "teduhi:admin-theme-changed";

export function getAdminTheme(): AdminTheme {
  if (typeof window === "undefined") return "light";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "dark" || saved === "system" ? saved : "light";
  } catch {
    return "light";
  }
}

export function saveAdminTheme(theme: AdminTheme): void {
  window.localStorage.setItem(STORAGE_KEY, theme);
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export const ADMIN_THEME_CHANGED_EVENT = CHANGED_EVENT;