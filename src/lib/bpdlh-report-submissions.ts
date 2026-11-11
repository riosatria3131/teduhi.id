import { getSupabaseClient } from "@/lib/supabaseClient";

const TRANSFER_PROOF_BUCKET = "dokumen";

export type BpdlhSubmissionStatus = "Belum Diajukan" | "Menunggu Review" | "Disetujui" | "Perlu Revisi" | "Ditolak";

export type BpdlhReportSubmission = {
  reportId: string;
  title: string;
  category: string;
  description: string;
  address: string;
  district: string;
  photoUrl: string | null;
  createdAt: string;
  reporter: string;
  reporterPhone: string;
  reportStatus: string;
  submissionStatus: BpdlhSubmissionStatus;
  adminNote: string;
  bpdlhNote: string;
  transferDescription: string;
  transferProofUrl: string | null;
  transferProofName: string | null;
  submittedAt: string;
  reviewedAt: string | null;
};

type ReportRecord = {
  id: string;
  title: string | null;
  category: string | null;
  description: string | null;
  address: string | null;
  district: string | null;
  photo_path: string | null;
  status: string | null;
  created_at: string | null;
  profiles: { nama?: string | null; no_telepon?: string | null } | Array<{ nama?: string | null; no_telepon?: string | null }> | null;
};

type SubmissionRecord = {
  report_id: string;
  status: BpdlhSubmissionStatus;
  admin_note: string | null;
  bpdlh_note: string | null;
  transfer_description: string | null;
  transfer_proof_path: string | null;
  transfer_proof_name: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reports: ReportRecord | ReportRecord[] | null;
};

function toSubmission(record: SubmissionRecord): BpdlhReportSubmission | null {
  const report = Array.isArray(record.reports) ? record.reports[0] : record.reports;
  if (!report) return null;
  const profile = Array.isArray(report.profiles) ? report.profiles[0] : report.profiles;
  return {
    reportId: record.report_id,
    title: report.title || "Laporan tanpa judul",
    category: report.category || "Tanpa kategori",
    description: report.description || "Deskripsi tidak tersedia.",
    address: report.address || "Lokasi belum dicantumkan",
    district: report.district || "",
    photoUrl: report.photo_path,
    createdAt: report.created_at || record.submitted_at,
    reporter: profile?.nama?.trim() || "Warga",
    reporterPhone: profile?.no_telepon?.trim() || "",
    reportStatus: report.status || "Tidak diketahui",
    submissionStatus: record.status,
    adminNote: record.admin_note || "",
    bpdlhNote: record.bpdlh_note || "",
    transferDescription: record.transfer_description || "",
    transferProofUrl: null,
    transferProofName: record.transfer_proof_name || null,
    submittedAt: record.submitted_at,
    reviewedAt: record.reviewed_at,
  };
}

export async function getMainAdminBpdlhSubmissions(): Promise<BpdlhReportSubmission[]> {
  const supabase = getSupabaseClient();
  const [{ data: reportData, error: reportError }, { data: submissionData, error: submissionError }] = await Promise.all([
    supabase.from("reports")
      .select("id, title, category, description, address, district, photo_path, status, created_at, profiles(nama,no_telepon)")
      .order("created_at", { ascending: false }),
    supabase.from("bpdlh_report_submissions")
      .select("report_id, status, admin_note, bpdlh_note, transfer_description, transfer_proof_path, transfer_proof_name, submitted_at, reviewed_at"),
  ]);
  if (reportError) throw reportError;
  if (submissionError) throw submissionError;

  const reports = (reportData ?? []) as unknown as ReportRecord[];
  const submissions = (submissionData ?? []) as unknown as Omit<SubmissionRecord, "reports">[];
  const submissionByReportId = new Map(submissions.map((submission) => [submission.report_id, submission]));
  const submissionsForAdmin = reports.map((report) => {
    const submission = submissionByReportId.get(report.id);
    const profile = Array.isArray(report.profiles) ? report.profiles[0] : report.profiles;
    return {
      reportId: report.id,
      title: report.title || "Laporan tanpa judul",
      category: report.category || "Tanpa kategori",
      description: report.description || "Deskripsi tidak tersedia.",
      address: report.address || "Lokasi belum dicantumkan",
      district: report.district || "",
      photoUrl: report.photo_path,
      createdAt: report.created_at || "",
      reporter: profile?.nama?.trim() || "Warga",
      reporterPhone: profile?.no_telepon?.trim() || "",
      reportStatus: report.status || "Tidak diketahui",
      submissionStatus: submission?.status ?? "Belum Diajukan",
      adminNote: submission?.admin_note || "",
      bpdlhNote: submission?.bpdlh_note || "",
      transferDescription: submission?.transfer_description || "",
      transferProofUrl: null,
      transferProofName: submission?.transfer_proof_name || null,
      submittedAt: submission?.submitted_at ?? report.created_at ?? "",
      reviewedAt: submission?.reviewed_at ?? null,
    };
  });
  return Promise.all(submissionsForAdmin.map(async (submission) => {
    const path = submissionByReportId.get(submission.reportId)?.transfer_proof_path;
    if (!path) return submission;
    const { data, error } = await supabase.storage.from(TRANSFER_PROOF_BUCKET).createSignedUrl(path, 60 * 60);
    if (error) return submission;
    return { ...submission, transferProofUrl: data.signedUrl };
  }));
}

export async function getBpdlhReportSubmissions(): Promise<BpdlhReportSubmission[]> {
  const { data, error } = await getSupabaseClient()
    .from("bpdlh_report_submissions")
    .select("report_id, status, admin_note, bpdlh_note, transfer_description, transfer_proof_path, transfer_proof_name, submitted_at, reviewed_at, reports(id,title,category,description,address,district,photo_path,status,created_at,profiles(nama,no_telepon))")
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  const supabase = getSupabaseClient();
  const submissions = ((data ?? []) as unknown as SubmissionRecord[]).map(toSubmission).filter((item): item is BpdlhReportSubmission => item !== null);
  return Promise.all(submissions.map(async (submission) => {
    const path = ((data ?? []) as unknown as SubmissionRecord[]).find((record) => record.report_id === submission.reportId)?.transfer_proof_path;
    if (!path) return submission;
    const { data: signedData, error: signedError } = await supabase.storage.from(TRANSFER_PROOF_BUCKET).createSignedUrl(path, 60 * 60);
    if (signedError) return submission;
    return { ...submission, transferProofUrl: signedData.signedUrl };
  }));
}

export async function submitReportToBpdlh(reportId: string, adminNote = ""): Promise<void> {
  if (adminNote.trim().length < 10) throw new Error("Deskripsi laporan minimal 10 karakter dan wajib diisi sebelum dikirim ke BPDLH.");
  const supabase = getSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Sesi admin tidak ditemukan. Silakan masuk kembali.");
  const { data: existing, error: lookupError } = await supabase.from("bpdlh_report_submissions")
    .select("status")
    .eq("report_id", reportId)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing?.status === "Perlu Revisi") {
    const { data, error } = await supabase.from("bpdlh_report_submissions")
      .update({ status: "Menunggu Review", admin_note: adminNote.trim(), submitted_at: new Date().toISOString() })
      .eq("report_id", reportId)
      .select("report_id")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Pengajuan revisi tidak ditemukan atau akun admin tidak memiliki izin untuk mengirim ulang.");
    return;
  }
  if (existing) throw new Error("Laporan ini sudah dikirim ke BPDLH dan tidak dapat dikirim ulang pada status saat ini.");
  const { error } = await supabase.from("bpdlh_report_submissions").insert({
    report_id: reportId,
    status: "Menunggu Review",
    admin_note: adminNote.trim(),
    submitted_by: user.id,
  });
  if (error) throw error;
}

export async function reviewBpdlhReport(
  reportId: string,
  status: Exclude<BpdlhSubmissionStatus, "Belum Diajukan" | "Menunggu Review">,
  note: string,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Sesi admin BPDLH tidak ditemukan. Silakan masuk kembali.");

  const { data: current, error: lookupError } = await supabase
    .from("bpdlh_report_submissions")
    .select("status")
    .eq("report_id", reportId)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (!current) throw new Error("Pengajuan tidak ditemukan. Muat ulang kotak masuk BPDLH.");
  // Another tab/admin may have completed the same decision while this dialog was open.
  // Treat the same result as success so a repeated click is safe and idempotent.
  if (current.status === status) return;
  if (current.status !== "Menunggu Review") {
    throw new Error(`Status pengajuan sudah berubah menjadi “${current.status}”. Muat ulang kotak masuk sebelum memberi keputusan lain.`);
  }

  const update = {
    status,
    bpdlh_note: note.trim(),
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
    ...(status !== "Disetujui" ? { transfer_description: "", transfer_proof_path: null, transfer_proof_name: null } : {}),
  };
  const { data, error } = await supabase.from("bpdlh_report_submissions").update(update)
    .eq("report_id", reportId)
    .eq("status", "Menunggu Review")
    .select("report_id")
    .maybeSingle();
  if (error) throw error;
  if (data) return;

  // Re-read to distinguish a concurrent successful decision from an RLS/role denial.
  const { data: latest, error: latestError } = await supabase
    .from("bpdlh_report_submissions")
    .select("status")
    .eq("report_id", reportId)
    .maybeSingle();
  if (latestError) throw latestError;
  if (latest?.status === status) return;
  if (latest && latest.status !== "Menunggu Review") {
    throw new Error(`Status pengajuan berubah menjadi “${latest.status}” sebelum keputusan tersimpan. Muat ulang kotak masuk.`);
  }
  throw new Error("Keputusan belum tersimpan. Pastikan akun memiliki role BPDLH (admin_bpdlh, admin_keuangan, atau bpdlh), lalu coba lagi.");
}

export async function saveBpdlhTransferEvidence(reportId: string, description: string, proof: File): Promise<void> {
  const trimmedDescription = description.trim();
  if (!trimmedDescription) throw new Error("Deskripsi transfer wajib diisi.");
  if (!proof) throw new Error("Pilih bukti transfer sebelum mengirim pencairan.");

  const supabase = getSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Sesi admin BPDLH tidak ditemukan. Silakan masuk kembali.");

  const safeName = proof.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uploadedPath = `${user.id}/bpdlh-transfer/${reportId}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from(TRANSFER_PROOF_BUCKET).upload(uploadedPath, proof, {
    contentType: proof.type || "application/octet-stream",
    upsert: false,
  });
  if (uploadError) throw new Error(`Bukti transfer gagal diunggah: ${uploadError.message}`);

  const { data: previousPath, error } = await supabase.rpc("save_bpdlh_transfer_evidence", {
    p_report_id: reportId,
    p_description: trimmedDescription,
    p_proof_path: uploadedPath,
    p_proof_name: proof.name,
  });
  if (error) {
    await supabase.storage.from(TRANSFER_PROOF_BUCKET).remove([uploadedPath]);
    throw new Error(`Bukti transfer gagal disimpan: ${error.message}`);
  }
  if (typeof previousPath === "string" && previousPath && previousPath !== uploadedPath) {
    await supabase.storage.from(TRANSFER_PROOF_BUCKET).remove([previousPath]);
  }
}

export async function getAdminBpdlhTransferProofUrl(reportId: string): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("bpdlh_report_submissions")
    .select("transfer_proof_path")
    .eq("report_id", reportId)
    .eq("status", "Disetujui")
    .maybeSingle();
  if (error) throw error;
  if (!data?.transfer_proof_path) throw new Error("Bukti transfer belum tersedia untuk pengajuan ini.");

  const { data: signedData, error: signedError } = await supabase.storage
    .from(TRANSFER_PROOF_BUCKET)
    .createSignedUrl(data.transfer_proof_path, 60 * 5);
  if (signedError) throw signedError;
  return signedData.signedUrl;
}

export async function getResidentBpdlhTransferEvidence(reportId: string): Promise<{
  description: string;
  proofUrl: string;
  proofName: string;
} | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_resident_bpdlh_transfer_evidence", {
    p_report_id: reportId,
  });
  if (error) throw error;
  const evidence = Array.isArray(data) ? data[0] : data;
  if (!evidence?.transfer_proof_path) return null;

  const { data: signedData, error: signedError } = await supabase.storage
    .from(TRANSFER_PROOF_BUCKET)
    .createSignedUrl(evidence.transfer_proof_path, 60 * 60);
  if (signedError) throw signedError;
  return {
    description: evidence.transfer_description || "",
    proofUrl: signedData.signedUrl,
    proofName: evidence.transfer_proof_name || "Bukti transfer",
  };
}