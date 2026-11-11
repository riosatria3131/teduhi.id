"use client";

import { useEffect, type ReactNode } from "react";
import { ADMIN_THEME_CHANGED_EVENT, getAdminTheme, type AdminTheme } from "@/lib/admin-theme";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

function applyAdminTheme(root: HTMLElement, theme: AdminTheme, animate: boolean) {
  const resolvedTheme = theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    : theme;
  if (root.dataset.adminTheme === resolvedTheme) return;

  const update = () => {
    root.dataset.adminTheme = resolvedTheme;
  };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!animate || reduceMotion) {
    update();
    return;
  }

  root.classList.add("theme-transitioning");
  const transitionDocument = document as ViewTransitionDocument;
  if (transitionDocument.startViewTransition) {
    const transition = transitionDocument.startViewTransition(update);
    void transition.finished.then(
      () => root.classList.remove("theme-transitioning"),
      () => root.classList.remove("theme-transitioning"),
    );
  } else {
    update();
    window.setTimeout(() => root.classList.remove("theme-transitioning"), 700);
  }
}

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.getElementById("admin-theme-root");
    if (!root) return;

    const syncTheme = (animate: boolean) => applyAdminTheme(root, getAdminTheme(), animate);
    const initialTimer = window.setTimeout(() => syncTheme(false), 0);
    const onThemeChanged = () => syncTheme(true);
    const onSystemThemeChanged = () => {
      if (getAdminTheme() === "system") syncTheme(true);
    };

    window.addEventListener(ADMIN_THEME_CHANGED_EVENT, onThemeChanged);
    window.addEventListener("storage", onThemeChanged);
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    systemTheme.addEventListener("change", onSystemThemeChanged);

    return () => {
      window.clearTimeout(initialTimer);
      window.removeEventListener(ADMIN_THEME_CHANGED_EVENT, onThemeChanged);
      window.removeEventListener("storage", onThemeChanged);
      systemTheme.removeEventListener("change", onSystemThemeChanged);
    };
  }, []);

  return children;
}