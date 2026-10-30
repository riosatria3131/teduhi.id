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
  profiles: { nama?: string | null } | Array<{ nama?: string | null }> | null;
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
      .select("id, title, category, description, address, district, photo_path, status, created_at, profiles(nama)")
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
    .select("report_id, status, admin_note, bpdlh_note, transfer_description, transfer_proof_path, transfer_proof_name, submitted_at, reviewed_at, reports(id,title,category,description,address,district,photo_path,status,created_at,profiles(nama))")
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
  transfer?: { description: string; proof: File },
): Promise<void> {
  const supabase = getSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Sesi admin BPDLH tidak ditemukan. Silakan masuk kembali.");
  if (status === "Disetujui" && (!transfer?.description.trim() || !transfer.proof)) {
    throw new Error("Lengkapi deskripsi dan bukti transfer sebelum menyetujui pengajuan.");
  }

  let uploadedPath: string | null = null;
  if (status === "Disetujui" && transfer) {
    const safeName = transfer.proof.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    uploadedPath = `${user.id}/bpdlh-transfer/${reportId}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from(TRANSFER_PROOF_BUCKET).upload(uploadedPath, transfer.proof, {
      contentType: transfer.proof.type || "application/octet-stream",
      upsert: false,
    });
    if (uploadError) throw new Error(`Bukti transfer gagal diunggah: ${uploadError.message}`);
  }

  const { data, error } = await supabase.from("bpdlh_report_submissions")
    .update({
      status,
      bpdlh_note: note.trim(),
      transfer_description: status === "Disetujui" ? transfer?.description.trim() ?? "" : "",
      transfer_proof_path: status === "Disetujui" ? uploadedPath : null,
      transfer_proof_name: status === "Disetujui" ? transfer?.proof.name ?? null : null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("report_id", reportId)
    .select("report_id")
    .maybeSingle();
  if (error || !data) {
    if (uploadedPath) await supabase.storage.from(TRANSFER_PROOF_BUCKET).remove([uploadedPath]);
    if (error) throw error;
    throw new Error("Pengajuan tidak ditemukan atau akun ini tidak memiliki izin untuk memberikan keputusan.");
  }
}