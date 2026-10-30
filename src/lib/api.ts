import { saveLocalReport } from "@/lib/portal-store";

export type ReportPayload = {
  title: string;
  category: string;
  description: string;
  district: string;
  address: string;
  latitude: string;
  longitude: string;
  photo: File;
};

export async function submitReport(
  payload: ReportPayload,
): Promise<{ ticket: string }> {
  const report = await saveLocalReport(payload);
  return { ticket: report.id };
}

/**
 * Placeholder proses masuk.
 * Ganti isi fungsi ini dengan pemanggilan autentikasi Anda
 * (Server Action, Route Handler, NextAuth, dll.).
 */
export async function signIn(credentials: {
  identifier: string;
  password: string;
}): Promise<{ ok: boolean; message: string }> {
  void credentials;
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { ok: false, message: "Layanan masuk belum tersedia. Silakan coba lagi nanti." };
}

/**
 * Placeholder pendaftaran akun.
 * Ganti isi fungsi ini dengan pemanggilan backend Anda.
 */
export async function register(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ ok: boolean; message: string }> {
  void data;
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { ok: false, message: "Layanan pendaftaran belum tersedia. Silakan coba lagi nanti." };
}
