"use client";

import { useEffect, useState } from "react";
import { FileIcon } from "@/components/icons";
import { getBudgetPayoutsForApplication, subscribeToBudgetChanges, type BudgetPayout } from "@/lib/bpdlh-budget-store";
import { printBudgetPayoutNote } from "@/lib/bpdlh-budget-receipt";

const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const formatAmount = (amount: number) => currency.format(amount).replace("Rp", "Rp ");

export function AdminReportPayoutNotes({ reportId }: { reportId: string }) {
  const [payouts, setPayouts] = useState<BudgetPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const records = await getBudgetPayoutsForApplication(reportId);
        if (!active) return;
        setPayouts(records);
        setError("");
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Nota belanja gagal dimuat.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void refresh();
    const unsubscribe = subscribeToBudgetChanges(() => void refresh());
    return () => {
      active = false;
      unsubscribe();
    };
  }, [reportId]);

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)]">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><FileIcon width={17} height={17} /></span>
        <div><h2 className="text-sm font-extrabold text-[#102a61]">Nota Belanja BPDLH</h2><p className="mt-1 text-xs text-slate-500">Nota yang terkait dengan laporan ini, berdasarkan ID laporan.</p></div>
      </div>
      {loading && <p role="status" className="mt-4 rounded-lg bg-slate-50 px-3 py-3 text-xs text-slate-500">Memuat nota…</p>}
      {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-3 text-xs text-rose-700">Nota gagal dimuat. Pastikan migrasi akses rincian nota sudah diterapkan. {error}</p>}
      {!loading && !error && payouts.length === 0 && <p className="mt-4 rounded-lg bg-slate-50 px-3 py-3 text-xs leading-relaxed text-slate-500">Belum ada nota belanja yang tercatat untuk laporan ini.</p>}
      {payouts.length > 0 && <ul className="mt-4 grid gap-3">
        {payouts.map((payout) => <li key={payout.id} className="rounded-xl border border-slate-100 p-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0"><p className="text-xs font-bold text-[#102a61]">{payout.allocationName}</p><p className="mt-1 break-all text-[10px] text-slate-400">No. Nota: {payout.id}</p><p className="mt-1 text-[10px] text-slate-500">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(payout.createdAt))}</p></div>
            <span className="text-sm font-extrabold text-[#102a61]">{formatAmount(payout.amount)}</span>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-600">{payout.items?.map((item) => `${item.quantity} ${item.unit} ${item.name}`).join(" · ") || payout.purpose}</p>
          <button type="button" onClick={() => printBudgetPayoutNote(payout)} className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-bold text-blue-700 hover:bg-blue-100"><FileIcon width={13} height={13} />Buka / Cetak Nota</button>
        </li>)}
      </ul>}
    </section>
  );
}
