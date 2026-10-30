export type BudgetAllocation = {
  id: string;
  name: string;
  description: string;
  budget: number;
  spent: number;
};

export type BudgetPayoutItem = {
  name: string;
  quantity: number;
  unit: string;
  subtotal: number;
};

export type BudgetPayout = {
  id: string;
  allocationId: string;
  allocationName: string;
  application: string;
  amount: number;
  purpose: string;
  status: "Processing";
  createdAt: string;
  receiptName?: string;
  items?: BudgetPayoutItem[];
};

type StoredReceipt = { id: string; file: Blob; fileName: string; mimeType: string };

type BudgetState = { allocations: BudgetAllocation[]; payouts: BudgetPayout[] };

const STORAGE_KEY = "teduhi:bpdlh-budget-state";
const LEGACY_ALLOCATIONS_KEY = "teduhi:bpdlh-budget-allocations";
const CHANGED_EVENT = "teduhi:bpdlh-budget-data-changed";
const RECEIPT_DATABASE = "teduhi-bpdlh-receipts";
const RECEIPT_STORE = "receipts";

export const initialBudgetAllocations: BudgetAllocation[] = [
  { id: "logistik-darurat", name: "Logistik & Sembako Darurat", description: "Pemenuhan kebutuhan dasar korban bencana", budget: 50_000_000_000, spent: 35_000_000_000 },
  { id: "kesehatan-medis", name: "Kesehatan & Obat-obatan Medis", description: "Layanan kesehatan dan obat-obatan untuk korban", budget: 30_000_000_000, spent: 12_000_000_000 },
  { id: "operasional-sar", name: "Operasional & Evaluasi Tim SAR", description: "Operasional tim SAR dan evaluasi korban", budget: 25_000_000_000, spent: 24_500_000_000 },
];

function isAllocation(value: unknown): value is BudgetAllocation {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<BudgetAllocation>;
  return typeof item.id === "string" && typeof item.name === "string"
    && typeof item.description === "string" && typeof item.budget === "number"
    && Number.isFinite(item.budget) && typeof item.spent === "number" && Number.isFinite(item.spent);
}

function isPayout(value: unknown): value is BudgetPayout {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<BudgetPayout>;
  return typeof item.id === "string" && typeof item.allocationId === "string"
    && typeof item.allocationName === "string" && typeof item.application === "string"
    && typeof item.amount === "number" && typeof item.purpose === "string"
    && item.status === "Processing" && typeof item.createdAt === "string"
    && (item.receiptName === undefined || typeof item.receiptName === "string")
    && (item.items === undefined || (Array.isArray(item.items) && item.items.every((entry) =>
      Boolean(entry) && typeof entry.name === "string" && typeof entry.quantity === "number"
      && typeof entry.unit === "string" && typeof entry.subtotal === "number")));
}

function openReceiptDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(RECEIPT_DATABASE, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(RECEIPT_STORE)) database.createObjectStore(RECEIPT_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Penyimpanan bukti nota tidak tersedia."));
  });
}

async function saveBudgetReceipt(id: string, file: File): Promise<void> {
  const database = await openReceiptDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(RECEIPT_STORE, "readwrite");
      transaction.objectStore(RECEIPT_STORE).put({ id, file, fileName: file.name, mimeType: file.type } satisfies StoredReceipt);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Bukti nota gagal disimpan."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Penyimpanan bukti nota dibatalkan."));
    });
  } finally {
    database.close();
  }
}

export async function getBudgetReceipt(id: string): Promise<StoredReceipt | null> {
  const database = await openReceiptDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction(RECEIPT_STORE, "readonly").objectStore(RECEIPT_STORE).get(id);
      request.onsuccess = () => resolve(request.result ? request.result as StoredReceipt : null);
      request.onerror = () => reject(request.error ?? new Error("Foto bukti nota tidak dapat dibuka."));
    });
  } finally {
    database.close();
  }
}

async function removeBudgetReceipt(id: string): Promise<void> {
  const database = await openReceiptDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(RECEIPT_STORE, "readwrite");
      transaction.objectStore(RECEIPT_STORE).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Bukti nota gagal dibersihkan."));
    });
  } finally {
    database.close();
  }
}

export function getBudgetState(): BudgetState {
  if (typeof window === "undefined") return { allocations: initialBudgetAllocations, payouts: [] };
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        const state = parsed as { allocations?: unknown; payouts?: unknown };
        return {
          allocations: Array.isArray(state.allocations) && state.allocations.every(isAllocation) ? state.allocations : initialBudgetAllocations,
          payouts: Array.isArray(state.payouts) ? state.payouts.filter(isPayout) : [],
        };
      }
    }
    const legacy = window.localStorage.getItem(LEGACY_ALLOCATIONS_KEY);
    if (legacy) {
      const parsed: unknown = JSON.parse(legacy);
      if (Array.isArray(parsed) && parsed.every(isAllocation)) return { allocations: parsed, payouts: [] };
    }
  } catch {
    // Use sample data if local storage is unavailable or invalid.
  }
  return { allocations: initialBudgetAllocations, payouts: [] };
}

function saveBudgetState(state: BudgetState) {
  if (typeof window === "undefined") throw new Error("Penyimpanan anggaran hanya tersedia di browser.");
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function saveBudgetAllocations(allocations: BudgetAllocation[]) {
  const current = getBudgetState();
  saveBudgetState({ ...current, allocations });
}

export function getBudgetPayouts(): BudgetPayout[] {
  return getBudgetState().payouts;
}

export function subscribeToBudgetChanges(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(CHANGED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export async function recordBudgetPayout(input: {
  allocationId: string;
  application: string;
  amount: number;
  items: BudgetPayoutItem[];
  receipt: File;
}): Promise<BudgetPayout> {
  const state = getBudgetState();
  const allocation = state.allocations.find((item) => item.id === input.allocationId);
  if (!allocation) throw new Error("Pos anggaran tidak ditemukan. Muat ulang halaman lalu coba kembali.");
  const remaining = allocation.budget - allocation.spent;
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) throw new Error("Nominal pencairan harus berupa angka rupiah bulat yang lebih besar dari nol.");
  if (input.amount > remaining) throw new Error("Nominal pencairan melebihi sisa saldo pos anggaran.");
  if (!input.application.trim()) throw new Error("Pilih kejadian bencana.");
  if (input.items.length === 0 || input.items.some((item) => !item.name.trim() || !item.unit.trim()
    || !Number.isSafeInteger(item.quantity) || item.quantity <= 0
    || !Number.isSafeInteger(item.subtotal) || item.subtotal < 0)) {
    throw new Error("Lengkapi nama barang, jumlah, satuan, dan subtotal setiap item.");
  }
  const itemsTotal = input.items.reduce((total, item) => total + item.subtotal, 0);
  if (itemsTotal !== input.amount) throw new Error("Jumlah subtotal barang harus sama dengan Nominal Pencairan.");
  if (!input.receipt.type.startsWith("image/") || input.receipt.size === 0) throw new Error("Lampirkan foto nota dalam format gambar.");
  if (input.receipt.size > 8 * 1024 * 1024) throw new Error("Ukuran foto nota maksimal 8 MB.");

  const payout: BudgetPayout = {
    id: `TRX-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    allocationId: allocation.id,
    allocationName: allocation.name,
    application: input.application.trim(),
    amount: input.amount,
    purpose: input.items.map((item) => `${item.quantity} ${item.unit} ${item.name.trim()}`).join("; "),
    status: "Processing",
    createdAt: new Date().toISOString(),
    receiptName: input.receipt.name,
    items: input.items.map((item) => ({ ...item, name: item.name.trim(), unit: item.unit.trim() })),
  };
  await saveBudgetReceipt(payout.id, input.receipt);
  try {
    saveBudgetState({
      allocations: state.allocations.map((item) => item.id === allocation.id ? { ...item, spent: item.spent + input.amount } : item),
      payouts: [payout, ...state.payouts],
    });
  } catch (error) {
    await removeBudgetReceipt(payout.id);
    throw error;
  }
  return payout;
}
