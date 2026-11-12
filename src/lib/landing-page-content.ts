"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

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
  howItWorksEyebrow: string;
  howItWorksHeading: string;
  howItWorksDescription: string;
  howItWorksSteps: LandingStepItem[];
  faqEyebrow: string;
  faqHeading: string;
  faqDescription: string;
  faqs: LandingFaqItem[];
  contactHeading: string;
  supportEmail: string;
  whatsappUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  ctaHeading: string;
  ctaDescription: string;
  news: LandingNewsItem[];
};

export type LandingStepItem = { title: string; text: string };
export type LandingFaqItem = { q: string; a: string };
export type LandingPageSettings = Omit<LandingPageContent, "news">;

export type LandingNewsItem = {
  id: string;
  title: string;
  sourceUrl: string;
  photo: string;
  description: string;
  createdAt: string;
};

export const DEFAULT_LANDING_PAGE_CONTENT: LandingPageContent = {
  heroBadge: "Aplikasi lapor bencana",
  heroLineOne: "Hadapi bersama",
  heroLineTwo: "Dengan lapor bencana,",
  heroEmphasis: "SEGERA!",
  heroSubtitle: "Mudah, cepat, dan transparan.",
  profileHeading: "Ruang bersama untuk melaporkan dan memantau bencana.",
  profileDescription: "Website TEDUHI dibuat sebagai sarana digital bagi warga untuk menyampaikan laporan bencana secara mudah dan terarah. Tujuannya adalah menghubungkan warga dengan pihak terkait, mempercepat penyampaian informasi dan tindak lanjut laporan, serta memberi ruang bagi warga untuk memantau perkembangannya secara transparan.",
  howItWorksEyebrow: "Dari foto menjadi laporan",
  howItWorksHeading: "Anda cukup memotret, dan beri deskripsi.",
  howItWorksDescription: "Foto bencana, tambah deskripsi dan beri lokasinya, lalu periksa sebelum dikirim.",
  howItWorksSteps: [
    { title: "Foto", text: "Ambil foto kerusakan, tulis patokan lokasinya, lalu periksa sebelum dikirim." },
    { title: "Verifikasi", text: "Pemerintah memeriksa validitas laporan di dasbor admin." },
    { title: "Perbaikan", text: "Petugas dinas turun ke lokasi untuk melakukan perbaikan." },
    { title: "Selesai", text: "Bukti hasil perbaikan diunggah dan status berubah menjadi transparan." },
  ],
  faqEyebrow: "Pertanyaan umum",
  faqHeading: "Yang dapat anda ketahui\nSebelum melapor :",
  faqDescription: "Kami menyediakan ruang sebagai tempat untuk menyalurkan pertanyaan.",
  faqs: [
    { q: "Siapa yang bisa membuat laporan?", a: "Semua warga. Cukup isi judul, kategori, foto bukti, deskripsi singkat, dan lokasi kerusakan." },
    { q: "Berapa lama laporan saya ditindaklanjuti?", a: "Admin memeriksa laporan lebih dulu. Setelah dinyatakan valid, petugas dijadwalkan turun ke lokasi. Status laporan berubah di setiap tahap, jadi Anda tidak perlu bertanya kembali." },
    { q: "Foto seperti apa yang sebaiknya saya unggah?", a: "Foto yang jelas dan menunjukkan kerusakan beserta sekitarnya, supaya petugas mudah mengenali tempatnya. Format JPG atau PNG, maksimal 5 MB." },
    { q: "Bagaimana kalau saya tidak tahu koordinat lokasinya?", a: "Tidak perlu. Ketik daerah dan tulis alamat atau patokan terdekat." },
    { q: "Mengapa laporan saya ditolak?", a: "Laporan bisa ditolak jika fotonya tidak menunjukkan bencana yang serius, lokasinya tidak jelas, atau sudah pernah dilaporkan orang lain." },
  ],
  contactHeading: "Social Media:",
  supportEmail: "support@teduhi.id",
  whatsappUrl: "https://wa.me/6289670265654",
  instagramUrl: "https://www.instagram.com/teduhi.id/",
  youtubeUrl: "https://youtube.com/@muhammadachdiamanggalamanggala?si=XZttslIu4I3yq_Jy",
  ctaHeading: "Masih hadapi bencana sendiri? Dapatkan pertolongan sekarang juga.",
  ctaDescription: "Satu laporan anda bisa selamatkan masyarakat yang lain.",
  news: [],
};

export function getLandingPageContent(): LandingPageContent {
  if (typeof window === "undefined") return DEFAULT_LANDING_PAGE_CONTENT;
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!stored || typeof stored !== "object") return DEFAULT_LANDING_PAGE_CONTENT;
    const savedContent = stored as Partial<LandingPageContent>;
    return {
      ...DEFAULT_LANDING_PAGE_CONTENT,
      ...savedContent,
      howItWorksSteps: Array.isArray(savedContent.howItWorksSteps) ? savedContent.howItWorksSteps : DEFAULT_LANDING_PAGE_CONTENT.howItWorksSteps,
      faqs: Array.isArray(savedContent.faqs) ? savedContent.faqs : DEFAULT_LANDING_PAGE_CONTENT.faqs,
      news: Array.isArray(savedContent.news) ? savedContent.news : [],
    };
  } catch {
    return DEFAULT_LANDING_PAGE_CONTENT;
  }
}

function normalizeLandingPageSettings(value: unknown): LandingPageSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return DEFAULT_LANDING_PAGE_CONTENT;
  }
  const savedContent = value as Partial<LandingPageSettings>;
  return {
    ...DEFAULT_LANDING_PAGE_CONTENT,
    ...savedContent,
    howItWorksSteps: Array.isArray(savedContent.howItWorksSteps) ? savedContent.howItWorksSteps : DEFAULT_LANDING_PAGE_CONTENT.howItWorksSteps,
    faqs: Array.isArray(savedContent.faqs) ? savedContent.faqs : DEFAULT_LANDING_PAGE_CONTENT.faqs,
  };
}

export async function getLandingPageSettings(): Promise<LandingPageSettings> {
  const { data, error } = await getSupabaseClient()
    .from("landing_page_content")
    .select("content")
    .eq("singleton", true)
    .single();
  if (error) throw error;

  const remoteContent = data?.content;
  if (remoteContent && typeof remoteContent === "object" && !Array.isArray(remoteContent) && Object.keys(remoteContent).length === 0) {
    return normalizeLandingPageSettings(getLandingPageContent());
  }
  return normalizeLandingPageSettings(remoteContent);
}

type LandingNewsRow = {
  id: string;
  title: string;
  source_url: string;
  photo: string;
  description: string;
  created_at: string;
};

function fromLandingNewsRow(row: LandingNewsRow): LandingNewsItem {
  return {
    id: row.id,
    title: row.title,
    sourceUrl: row.source_url,
    photo: row.photo,
    description: row.description,
    createdAt: row.created_at,
  };
}

export async function getLandingPageNews(): Promise<LandingNewsItem[]> {
  const { data, error } = await getSupabaseClient()
    .from("landing_page_news")
    .select("id,title,source_url,photo,description,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as LandingNewsRow[]).map(fromLandingNewsRow);
}

export async function saveLandingPageContent(content: LandingPageContent): Promise<void> {
  const { error } = await getSupabaseClient().rpc("replace_landing_page_news", {
    p_news: content.news,
  });
  if (error) throw error;
  window.dispatchEvent(new Event(CONTENT_CHANGED));
}

export async function saveLandingPageSettings(content: LandingPageContent): Promise<void> {
  const { news: _news, ...settings }: LandingPageContent = content;
  void _news;
  const pageSettings: LandingPageSettings = settings;
  for (const [label, value] of [["Instagram", settings.instagramUrl], ["YouTube", settings.youtubeUrl], ["WhatsApp", settings.whatsappUrl]] as const) {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new Error(`Tautan ${label} tidak valid.`);
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error(`Tautan ${label} harus menggunakan http:// atau https://.`);
    }
  }
  const { data, error } = await getSupabaseClient()
    .from("landing_page_content")
    .update({ content: pageSettings })
    .eq("singleton", true)
    .select("content")
    .single();
  if (error || !data) throw new Error(error?.message || "Konten landing page gagal disimpan ke Supabase.");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeLandingPageSettings(data.content)));
  window.dispatchEvent(new Event(CONTENT_CHANGED));
}

export function resetLandingPageContent(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CONTENT_CHANGED));
}

export function useLandingPageContent(): LandingPageContent {
  const [content, setContent] = useState(DEFAULT_LANDING_PAGE_CONTENT);

  useEffect(() => {
    let active = true;
    const syncFromDatabase = async () => {
      try {
        const [settings, news] = await Promise.all([getLandingPageSettings(), getLandingPageNews()]);
        if (active) setContent({ ...settings, news });
      } catch {
        // Keep the current/default content available if Supabase is temporarily unreachable.
      }
    };
    const sync = () => {
      setContent(getLandingPageContent());
      void syncFromDatabase();
    };
    sync();
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`landing-page-content-${crypto.randomUUID()}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "landing_page_content",
        filter: "singleton=eq.true",
      }, () => void syncFromDatabase())
      .subscribe();
    window.addEventListener(CONTENT_CHANGED, sync);
    window.addEventListener("storage", sync);
    return () => {
      active = false;
      void supabase.removeChannel(channel);
      window.removeEventListener(CONTENT_CHANGED, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return content;
}
