"use client";

import { useEffect, useState } from "react";
import { FileIcon } from "@/components/icons";
import { getBudgetPayoutsForApplication, subscribeToBudgetChanges, type BudgetPayout } from "@/lib/bpdlh-budget-store";
import { getResidentBpdlhTransferEvidence } from "@/lib/bpdlh-report-submissions";
import { printBudgetPayoutNote } from "@/lib/bpdlh-budget-receipt";

const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const formatAmount = (amount: number) => currency.format(amount).replace("Rp", "Rp ");

export function PortalReportPayoutNotes({ reportId }: { reportId: string }) {
  const [payouts, setPayouts] = useState<BudgetPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transferEvidence, setTransferEvidence] = useState<{ description: string; proofUrl: string; proofName: string } | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const records = await getBudgetPayoutsForApplication(reportId);
        const evidence = await getResidentBpdlhTransferEvidence(reportId);
        if (!active) return;
        setPayouts(records);
        setTransferEvidence(evidence);
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
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-dark"><FileIcon width={18} height={18} /></span>
        <div><h2 className="text-base font-extrabold text-ink">Nota Belanja Bantuan</h2><p className="mt-1 text-xs leading-relaxed text-muted">Nota yang terkait dengan laporan ini dari BPDLH.</p></div>
      </div>
      {loading && <p role="status" className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-muted">Memeriksa nota untuk laporan ini…</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">Nota belum dapat dimuat. Coba muat ulang halaman. {error}</p>}
      {!loading && !error && payouts.length === 0 && <p className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm leading-relaxed text-muted">Belum ada nota bantuan untuk laporan ini. Jika bantuan disetujui dan pencairan dicatat, rincian nota akan tampil di sini.</p>}
      {payouts.length > 0 && <ul className="mt-4 grid gap-3">
        {payouts.map((payout) => <li key={payout.id} className="rounded-xl border border-line p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0"><p className="text-sm font-bold text-ink">{payout.allocationName}</p><p className="mt-1 break-all text-xs text-muted">No. Nota: {payout.id}</p><p className="mt-1 text-xs text-muted">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(payout.createdAt))}</p></div>
            <span className="text-base font-extrabold text-brand-dark">{formatAmount(payout.amount)}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{payout.items?.map((item) => `${item.quantity} ${item.unit} ${item.name}`).join(" · ") || payout.purpose}</p>
          {transferEvidence && <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
            <p className="text-xs font-bold text-emerald-900">Informasi transfer dari BPDLH</p>
            {transferEvidence.description && <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-emerald-900">{transferEvidence.description}</p>}
            <a href={transferEvidence.proofUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50"><FileIcon width={15} height={15} />Lihat bukti transfer · {transferEvidence.proofName}</a>
          </div>}
          <button type="button" onClick={() => printBudgetPayoutNote(payout)} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-xs font-bold text-brand-dark transition hover:bg-brand-soft"><FileIcon width={15} height={15} />Lihat / Cetak Nota</button>
        </li>)}
      </ul>}
    </section>
  );
}
