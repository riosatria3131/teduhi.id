export type ReviewOutcome = "Disetujui" | "Perlu Revisi" | "Ditolak";

export type ReviewRecord = {
  status: ReviewOutcome;
  decision: string;
  note: string;
  transferProofName?: string;
  transferDescription?: string;
  updatedAt: string;
};

const STORAGE_KEY = "teduhi:bpdlh-review-decisions";
const REVIEW_CHANGED = "teduhi:bpdlh-review-changed";
const PROOF_DATABASE = "teduhi-bpdlh-review-proofs";
const PROOF_STORE = "transfer-proofs";

function openProofDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PROOF_DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(PROOF_STORE, { keyPath: "requestId" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Penyimpanan bukti transfer tidak dapat dibuka."));
  });
}

export function getReviewRecords(): Record<string, ReviewRecord> {
  if (typeof window === "undefined") return {};
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).map(([requestId, value]) => {
      const record = value as Omit<Partial<ReviewRecord>, "status"> & { status?: string };
      const status = record.decision === "Disetujui" || record.status === "Dokumen lengkap"
        ? "Disetujui"
        : record.decision === "Perlu Revisi" || record.status === "Perlu revisi"
          ? "Perlu Revisi"
          : record.status === "Ditolak"
            ? "Ditolak"
            : record.status;
      return [requestId, { ...record, status }];
    })) as Record<string, ReviewRecord>;
  } catch {
    return {};
  }
}

export async function saveReviewRecord(requestId: string, record: ReviewRecord, transferProof?: File): Promise<void> {
  if (transferProof) {
    const database = await openProofDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(PROOF_STORE, "readwrite");
        transaction.objectStore(PROOF_STORE).put({ requestId, file: transferProof, fileName: transferProof.name, mimeType: transferProof.type });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error("Bukti transfer gagal disimpan."));
        transaction.onabort = () => reject(transaction.error ?? new Error("Penyimpanan bukti transfer dibatalkan."));
      });
    } finally {
      database.close();
    }
  }
  const records = getReviewRecords();
  records[requestId] = record;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(REVIEW_CHANGED));
}

export async function getTransferProof(requestId: string): Promise<{ file: Blob; fileName: string; mimeType: string } | null> {
  const database = await openProofDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction(PROOF_STORE, "readonly").objectStore(PROOF_STORE).get(requestId);
      request.onsuccess = () => resolve(request.result ? request.result as { file: Blob; fileName: string; mimeType: string } : null);
      request.onerror = () => reject(request.error ?? new Error("Bukti transfer tidak dapat dibaca."));
    });
  } finally {
    database.close();
  }
}

export function subscribeToReviewRecords(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(REVIEW_CHANGED, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(REVIEW_CHANGED, onChange);
    window.removeEventListener("storage", onChange);
  };
}
