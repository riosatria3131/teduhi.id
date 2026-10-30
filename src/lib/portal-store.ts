import type { ReportPayload } from "@/lib/api";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { ReportStatus } from "@/components/portal/portal-data";

const REPORTS_CHANGED = "laporkota:reports-changed";
const REPORT_ATTACHMENTS_BUCKET = "report-attachments";

export type LocalReport = {
  id: string;
  title: string;
  category: string;
  description: string;
  district: string;
  address: string;
  latitude: string;
  longitude: string;
  status: ReportStatus;
  createdAt: string;
  ownerEmail: string;
  reporterName?: string;
  photo: string;
  photoName: string;
};

export type AdminReport = LocalReport;

export type ReportStatusHistoryEntry = {
  status: ReportStatus;
  changedAt: string;
};

type ReportRow = {
  id: string;
  title: string;
  category: string;
  description: string;
  district: string;
  address: string;
  latitude: number | string | null;
  longitude: number | string | null;
  status: ReportStatus | "review";
  created_at: string;
  user_id: string;
  owner_email?: string | null;
  reporter?: { nama?: string | null; email?: string | null } | null;
  profiles?: { nama?: string | null; email?: string | null } | Array<{ nama?: string | null; email?: string | null }> | null;
  photo_path: string;
};

function toLocalReport(row: ReportRow): LocalReport {
  const photoName = decodeURIComponent(row.photo_path.split("/").pop()?.split("?")[0] ?? "foto-bukti");
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const reporter = row.reporter ?? profile;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    district: row.district,
    address: row.address,
    latitude: row.latitude == null ? "" : String(row.latitude),
    longitude: row.longitude == null ? "" : String(row.longitude),
    // Keep review as an internal admin inbox state; show it to the citizen as pending verification.
    status: row.status === "review" ? "Menunggu Verifikasi" : row.status,
    createdAt: row.created_at,
    ownerEmail: row.owner_email ?? reporter?.email ?? row.user_id,
    reporterName: reporter?.nama ?? undefined,
    photo: row.photo_path,
    photoName,
  };
}

async function getCurrentUser() {
  const { data, error } = await getSupabaseClient().auth.getUser();
  if (error || !data.user) throw new Error("Masuk ke akun sebelum mengelola laporan.");
  return data.user;
}

export async function saveLocalReport(payload: ReportPayload & { address: string }): Promise<LocalReport> {
  const supabase = getSupabaseClient();
  const user = await getCurrentUser();
  const safeFileName = payload.photo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${user.id}/${crypto.randomUUID()}-${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(REPORT_ATTACHMENTS_BUCKET)
    .upload(storagePath, payload.photo, {
      contentType: payload.photo.type,
      upsert: false,
    });
  if (uploadError) throw new Error(`Foto gagal diunggah: ${uploadError.message}`);

  const { data: publicUrlData } = supabase.storage
    .from(REPORT_ATTACHMENTS_BUCKET)
    .getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from("reports")
    .insert({
      user_id: user.id,
      title: payload.title.trim(),
      category: payload.category,
      description: payload.description.trim(),
      district: payload.district,
      address: payload.address.trim(),
      latitude: payload.latitude ? Number(payload.latitude) : null,
      longitude: payload.longitude ? Number(payload.longitude) : null,
      status: "review",
      photo_path: publicUrlData.publicUrl,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from(REPORT_ATTACHMENTS_BUCKET).remove([storagePath]);
    throw new Error(`Foto berhasil diunggah, tetapi laporan gagal disimpan: ${error.message}`);
  }

  window.dispatchEvent(new Event(REPORTS_CHANGED));
  return toLocalReport(data as ReportRow);
}

export async function getLocalReports(): Promise<LocalReport[]> {
  const { data: { session }, error: sessionError } = await getSupabaseClient().auth.getSession();
  if (sessionError || !session?.user) throw new Error("Masuk ke akun sebelum mengelola laporan.");
  const { data, error } = await getSupabaseClient()
    .from("reports")
    .select("id,title,category,description,district,address,latitude,longitude,status,created_at,user_id,photo_path")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ReportRow[]).map(toLocalReport);
}

export async function getAllLocalReports(): Promise<LocalReport[]> {
  const { data, error } = await getSupabaseClient()
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ReportRow[]).map(toLocalReport);
}

export async function updateLocalReportStatus(id: string, status: ReportStatus): Promise<void> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("reports")
    .update({ status })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Laporan tidak ditemukan atau Anda tidak memiliki izin untuk mengubahnya.");
  // Database trigger creates the owner notification atomically after a status transition.
  if (typeof window !== "undefined") window.dispatchEvent(new Event(REPORTS_CHANGED));
}

export function subscribeToLocalReports(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(REPORTS_CHANGED, onChange);
  return () => window.removeEventListener(REPORTS_CHANGED, onChange);
}

export async function getLocalReport(id: string): Promise<LocalReport | null> {
  const { data, error } = await getSupabaseClient()
    .from("reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toLocalReport(data as ReportRow) : null;
}

export async function deleteLocalReport(id: string) {
  const { data, error } = await getSupabaseClient()
    .from("reports")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Laporan tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya.");
  window.dispatchEvent(new Event(REPORTS_CHANGED));
}

/** Fetches reports with their citizen profile for the admin reports area. */
export async function getAdminReports(): Promise<AdminReport[]> {
  const { data, error } = await getSupabaseClient()
    .from("reports")
    .select("*, reporter:profiles!reports_user_id_profiles_fkey(nama,email)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as ReportRow[]).map(toLocalReport);
}

/** Fetches one report with its reporter profile for the admin detail page. */
export async function getAdminReport(id: string): Promise<AdminReport | null> {
  const { data, error } = await getSupabaseClient()
    .from("reports")
    .select("*, profiles(nama,email)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toLocalReport(data as unknown as ReportRow) : null;
}

export async function getAdminReportStatusHistory(id: string): Promise<ReportStatusHistoryEntry[]> {
  const { data, error } = await getSupabaseClient()
    .from("report_status_history")
    .select("status, changed_at")
    .eq("report_id", id)
    .order("changed_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((entry) => ({
    status: entry.status as ReportStatus,
    changedAt: entry.changed_at,
  }));
}