import type { ReportPayload } from "@/lib/api";
import { getDemoSession } from "@/lib/demo-auth";
import type { ReportStatus } from "@/components/portal/portal-data";

const DATABASE_NAME = "laporkota-local-demo";
const DATABASE_VERSION = 1;
const STORE_NAME = "reports";
const REPORTS_CHANGED = "laporkota:reports-changed";

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
  photo: Blob;
  photoName: string;
};

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("Browser ini tidak mendukung penyimpanan lokal."));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("ownerEmail", "ownerEmail", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Penyimpanan laporan tidak dapat dibuka."));
  });
}

function makeReportId() {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LK-DEMO-${time}-${random}`;
}

export async function saveLocalReport(payload: ReportPayload & { address: string }): Promise<LocalReport> {
  const session = getDemoSession();
  if (!session) throw new Error("Masuk ke akun demo sebelum menyimpan laporan lokal.");
  const report: LocalReport = {
    id: makeReportId(),
    title: payload.title.trim(),
    category: payload.category,
    description: payload.description.trim(),
    district: payload.district,
    address: payload.address.trim(),
    latitude: payload.latitude,
    longitude: payload.longitude,
    status: "Menunggu Verifikasi",
    createdAt: new Date().toISOString(),
    ownerEmail: session.email,
    photo: payload.photo,
    photoName: payload.photo.name,
  };

  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).add(report);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Laporan lokal gagal disimpan."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Penyimpanan laporan dibatalkan."));
    });
  } finally {
    database.close();
  }

  window.dispatchEvent(new Event(REPORTS_CHANGED));
  return report;
}

export async function getLocalReports(): Promise<LocalReport[]> {
  const session = getDemoSession();
  if (!session) return [];
  const database = await openDatabase();
  try {
    return await new Promise<LocalReport[]>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).index("ownerEmail").getAll(session.email);
      request.onsuccess = () => resolve((request.result as LocalReport[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      request.onerror = () => reject(request.error ?? new Error("Laporan lokal gagal dibaca."));
    });
  } finally {
    database.close();
  }
}

export function subscribeToLocalReports(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(REPORTS_CHANGED, onChange);
  return () => window.removeEventListener(REPORTS_CHANGED, onChange);
}

export async function getLocalReport(id: string): Promise<LocalReport | null> {
  const session = getDemoSession();
  if (!session) return null;
  const database = await openDatabase();
  try {
    return await new Promise<LocalReport | null>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id);
      request.onsuccess = () => {
        const report = request.result as LocalReport | undefined;
        resolve(report?.ownerEmail === session.email ? report : null);
      };
      request.onerror = () => reject(request.error ?? new Error("Detail laporan lokal gagal dibaca."));
    });
  } finally {
    database.close();
  }
}

export async function deleteLocalReport(id: string) {
  const session = getDemoSession();
  if (!session) throw new Error("Sesi demo tidak ditemukan.");
  const report = await getLocalReport(id);
  if (!report) throw new Error("Laporan lokal tidak ditemukan.");
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Laporan lokal gagal dihapus."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Penghapusan laporan dibatalkan."));
    });
  } finally {
    database.close();
  }
  window.dispatchEvent(new Event(REPORTS_CHANGED));
}