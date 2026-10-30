"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "teduhi:landing-page-content";
const CONTENT_CHANGED = "teduhi:landing-page-content-changed";

export type LandingPageContent = {
  heroBadge: string;
  heroLineOne: string;
  heroLineTwo: string;
  heroEmphasis: string;
  heroSubtitle: string;
  profileHeading: string;
  profileDescription: string;
  ctaHeading: string;
  ctaDescription: string;
};

export const DEFAULT_LANDING_PAGE_CONTENT: LandingPageContent = {
  heroBadge: "Aplikasi lapor bencana",
  heroLineOne: "Hadapi bersama",
  heroLineTwo: "Dengan lapor bencana,",
  heroEmphasis: "SEGERA!",
  heroSubtitle: "Mudah, cepat, dan transparan.",
  profileHeading: "Ruang bersama untuk melaporkan dan memantau bencana.",
  profileDescription: "Website TEDUHI dibuat sebagai sarana digital bagi warga untuk menyampaikan laporan bencana secara mudah dan terarah. Tujuannya adalah menghubungkan warga dengan pihak terkait, mempercepat penyampaian informasi dan tindak lanjut laporan, serta memberi ruang bagi warga untuk memantau perkembangannya secara transparan.",
  ctaHeading: "Masi hadapi bencana sendiri? dapatkan pertolongan sekarang juga.",
  ctaDescription: "Satu laporan anda bisa selamatkan masyarakat yang lain.",
};

export function getLandingPageContent(): LandingPageContent {
  if (typeof window === "undefined") return DEFAULT_LANDING_PAGE_CONTENT;
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!stored || typeof stored !== "object") return DEFAULT_LANDING_PAGE_CONTENT;
    return { ...DEFAULT_LANDING_PAGE_CONTENT, ...stored } as LandingPageContent;
  } catch {
    return DEFAULT_LANDING_PAGE_CONTENT;
  }
}

export function saveLandingPageContent(content: LandingPageContent): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  window.dispatchEvent(new Event(CONTENT_CHANGED));
}

export function resetLandingPageContent(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CONTENT_CHANGED));
}

export function useLandingPageContent(): LandingPageContent {
  const [content, setContent] = useState(DEFAULT_LANDING_PAGE_CONTENT);

  useEffect(() => {
    const sync = () => setContent(getLandingPageContent());
    sync();
    window.addEventListener(CONTENT_CHANGED, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CONTENT_CHANGED, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return content;
}
