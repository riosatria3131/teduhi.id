import { getSupabaseClient } from "@/lib/supabaseClient";
import { INDONESIAN_ISLANDS, type IndonesianIsland } from "@/lib/admin/island-region";

export type BudgetAllocation = {
  id: string;
  name: string;
  description: string;
  budget: number;
  spent: number;
};

export type BudgetPayoutItem = {
  name: string;
  unitPrice?: number;
  quantity: number;
  unit: string;
  subtotal: number;
};

export type BudgetPayout = {
  id: string;
  allocationId: string;
  allocationName: string;
  applicationId: string;
  application: string;
  amount: number;
  purpose: string;
  status: "Processing" | "Success" | "Failed";
  createdAt: string;
  receiptName?: string;
  items?: BudgetPayoutItem[];
};

export type ApprovedBudgetApplication = { id: string; title: string };
export type BudgetIslandUsage = Record<IndonesianIsland, number> & { unknown: number };
export type BudgetPeriodUsageRecord = {
  periodType: "monthly" | "yearly";
  periodStart: string;
  island: IndonesianIsland | "unknown";
  spentTotal: number;
};

type AllocationRecord = {
  id: string;
  name: string;
  description: string;
  budget: number | string;
  spent: number | string;
};

type PayoutRecord = {
  id: string;
  allocation_id: string;
  allocation_name: string;
  application_id: string;
  application: string;
  amount: number | string;
  purpose: string;
  status: BudgetPayout["status"];
  created_at: string;
  items: { name: string; unit_price: number | string; quantity: number; unit: string; subtotal: number | string }[];
};

export function subscribeToBudgetChanges(onChange: () => void): () => void {
  const supabase = getSupabaseClient();
  const channel = supabase.channel(`bpdlh-budget-${crypto.randomUUID()}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "bpdlh_budget_allocations" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "bpdlh_budget_payouts" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "bpdlh_budget_payout_items" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "bpdlh_report_submissions" }, onChange)
    .subscribe();
  return () => { void supabase.removeChannel(channel); };
}

export async function getBudgetAllocations(): Promise<BudgetAllocation[]> {
  const { data, error } = await getSupabaseClient()
    .from("bpdlh_budget_allocations")
    .select("id, name, description, budget, spent")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as AllocationRecord[]).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    budget: Number(item.budget),
    spent: Number(item.spent),
  }));
}

export async function saveBudgetAllocation(allocation: BudgetAllocation): Promise<void> {
  if (!Number.isSafeInteger(allocation.budget) || allocation.budget <= 0
    || !Number.isSafeInteger(allocation.spent) || allocation.spent < 0 || allocation.spent > allocation.budget) {
    throw new Error("Pagu dan realisasi harus berupa angka rupiah bulat, dan realisasi tidak boleh melebihi pagu.");
  }
  const supabase = getSupabaseClient();
  const payload = {
    id: allocation.id,
    name: allocation.name.trim(),
    description: allocation.description.trim(),
    budget: allocation.budget,
    spent: allocation.spent,
  };
  const result = allocation.id.startsWith("pos-")
    ? await supabase.from("bpdlh_budget_allocations").insert(payload).select("id").maybeSingle()
    : await supabase.from("bpdlh_budget_allocations").update(payload).eq("id", allocation.id).select("id").maybeSingle();
  if (result.error) throw result.error;
  if (!result.data) throw new Error("Perubahan pos anggaran tidak tersimpan. Periksa akses akun dan coba muat ulang.");
}

export async function deleteBudgetAllocation(id: string): Promise<void> {
  const { data, error } = await getSupabaseClient().from("bpdlh_budget_allocations").delete().eq("id", id).select("id").maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Pos anggaran tidak ditemukan atau akun tidak memiliki izin untuk menghapusnya.");
}

export async function getApprovedBudgetApplications(): Promise<ApprovedBudgetApplication[]> {
  const { data, error } = await getSupabaseClient()
    .from("bpdlh_report_submissions")
    .select("report_id, reports(title)")
    .eq("status", "Disetujui")
    .order("reviewed_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).flatMap((record) => {
    const report = Array.isArray(record.reports) ? record.reports[0] : record.reports;
    return report?.title ? [{ id: record.report_id, title: report.title }] : [];
  });
}

export async function getBudgetPayouts(): Promise<BudgetPayout[]> {
  const { data, error } = await getSupabaseClient()
    .from("bpdlh_budget_payouts")
    .select("id, allocation_id, allocation_name, application_id, application, amount, purpose, status, created_at, items:bpdlh_budget_payout_items(name, unit_price, quantity, unit, subtotal)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as PayoutRecord[]).map(toBudgetPayout);
}

export async function getBudgetPayoutsForApplication(applicationId: string): Promise<BudgetPayout[]> {
  const { data, error } = await getSupabaseClient()
    .from("bpdlh_budget_payouts")
    .select("id, allocation_id, allocation_name, application_id, application, amount, purpose, status, created_at, items:bpdlh_budget_payout_items(name, unit_price, quantity, unit, subtotal)")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as PayoutRecord[]).map(toBudgetPayout);
}

function toBudgetPayout(item: PayoutRecord): BudgetPayout {
  return {
    id: item.id,
    allocationId: item.allocation_id,
    allocationName: item.allocation_name,
    applicationId: item.application_id,
    application: item.application,
    amount: Number(item.amount),
    purpose: item.purpose,
    status: item.status,
    createdAt: item.created_at,
    items: item.items.map((detail) => ({
      name: detail.name,
      unitPrice: Number(detail.unit_price),
      quantity: detail.quantity,
      unit: detail.unit,
      subtotal: Number(detail.subtotal),
    })),
  };
}

export async function getBudgetUsageByIsland(): Promise<BudgetIslandUsage> {
  const { data, error } = await getSupabaseClient()
    .from("bpdlh_public_budget_island_usage")
    .select("island, spent_total");
  if (error) throw error;
  const totals = { ...Object.fromEntries(INDONESIAN_ISLANDS.map((island) => [island, 0])), unknown: 0 } as BudgetIslandUsage;
  for (const row of data ?? []) {
    if (row.island === "Tidak terpetakan") totals.unknown = Number(row.spent_total);
    else if (INDONESIAN_ISLANDS.includes(row.island as IndonesianIsland)) {
      totals[row.island as IndonesianIsland] = Number(row.spent_total);
    }
  }
  return totals;
}

export async function getBudgetUsageByPeriod(): Promise<BudgetPeriodUsageRecord[]> {
  const { data, error } = await getSupabaseClient()
    .from("bpdlh_public_budget_period_usage")
    .select("period_type, period_start, island, spent_total");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    periodType: row.period_type as BudgetPeriodUsageRecord["periodType"],
    periodStart: String(row.period_start),
    island: row.island === "Tidak terpetakan" ? "unknown" : row.island as IndonesianIsland,
    spentTotal: Number(row.spent_total),
  }));
}

export async function recordBudgetPayout(input: {
  allocationId: string;
  applicationId: string;
  amount: number;
  items: (BudgetPayoutItem & { unitPrice: number })[];
}): Promise<string> {
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) {
    throw new Error("Nominal pencairan harus berupa angka rupiah bulat yang lebih besar dari nol.");
  }
  const { data, error } = await getSupabaseClient().rpc("record_bpdlh_budget_payout", {
    p_allocation_id: input.allocationId,
    p_application_id: input.applicationId,
    p_amount: input.amount,
    p_items: input.items.map(({ name, unitPrice, quantity, unit, subtotal }) => ({
      name: name.trim(), unitPrice, quantity, unit: unit.trim(), subtotal,
    })),
  });
  if (error) throw error;
  if (typeof data !== "string") throw new Error("Database tidak mengembalikan nomor transaksi pencairan.");
  return data;
}
