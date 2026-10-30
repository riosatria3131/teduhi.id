"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { fundingRequests } from "../_data";
import { getBudgetState, initialBudgetAllocations, recordBudgetPayout, saveBudgetAllocations, subscribeToBudgetChanges, type BudgetAllocation, type BudgetPayoutItem } from "@/lib/bpdlh-budget-store";

type PayoutItemDraft = BudgetPayoutItem & { key: string };

const currency = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
const integerCurrency = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
function formatAmount(amount: number) {
  if (amount >= 1_000_000_000) return `Rp ${currency.format(amount / 1_000_000_000)} M`;
  if (amount >= 1_000_000) return `Rp ${currency.format(amount / 1_000_000)} jt`;
  return `Rp ${currency.format(amount)}`;
}

function parseRupiahInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function formatRupiahInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? integerCurrency.format(Number(digits)) : "";
}

function createPayoutItem(): PayoutItemDraft {
  return { key: crypto.randomUUID(), name: "", quantity: 1, unit: "pcs", subtotal: 0 };
}

function getHealth(spent: number, budget: number) {
  const ratio = budget > 0 ? spent / budget : 1;
  if (ratio >= 0.9) return { label: "Critical", description: "Realisasi hampir mencapai pagu", className: "bg-rose-50 text-rose-700", dotClassName: "bg-rose-500", icon: "!" };
  if (ratio >= 0.7) return { label: "Warning", description: "Pantau sisa anggaran pos ini", className: "bg-amber-50 text-amber-700", dotClassName: "bg-amber-500", icon: "⚠" };
  return { label: "Safe", description: "Alokasi masih mencukupi", className: "bg-emerald-50 text-emerald-700", dotClassName: "bg-emerald-500", icon: "✓" };
}

export function BudgetAllocations() {
  const [allocations, setAllocations] = useState<BudgetAllocation[]>(initialBudgetAllocations);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState<BudgetAllocation | null>(null);
  const [formError, setFormError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [payoutTarget, setPayoutTarget] = useState<BudgetAllocation | null>(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutItems, setPayoutItems] = useState<PayoutItemDraft[]>([]);
  const [payoutError, setPayoutError] = useState("");
  const [payoutPending, setPayoutPending] = useState(false);
  const [payoutNotice, setPayoutNotice] = useState("");

  useEffect(() => {
    const refresh = () => {
      const state = getBudgetState();
      setAllocations(state.allocations);
      setReady(true);
    };
    const timer = window.setTimeout(refresh, 0);
    const unsubscribe = subscribeToBudgetChanges(refresh);
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const totalBudget = useMemo(() => allocations.reduce((total, item) => total + item.budget, 0), [allocations]);

  function openEditor(allocation?: BudgetAllocation) {
    setEditing(allocation ?? { id: "", name: "", description: "", budget: 0, spent: 0 });
    setFormError("");
    setOpenMenuId(null);
  }

  function saveAllocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const budget = Number(formData.get("budget"));
    const spent = Number(formData.get("spent"));
    if (!name || !description || !Number.isFinite(budget) || budget <= 0 || !Number.isFinite(spent) || spent < 0) {
      setFormError("Isi nama, deskripsi, pagu, dan realisasi dengan nilai yang valid.");
      return;
    }

    const saved: BudgetAllocation = { id: editing.id || `pos-${crypto.randomUUID()}`, name, description, budget, spent };
    const nextAllocations = editing.id
      ? allocations.map((item) => item.id === editing.id ? saved : item)
      : [...allocations, saved];
    saveBudgetAllocations(nextAllocations);
    setAllocations(nextAllocations);
    setEditing(null);
    setFormError("");
  }

  function removeAllocation(allocation: BudgetAllocation) {
    if (!window.confirm(`Hapus pos anggaran “${allocation.name}”?`)) return;
    const nextAllocations = allocations.filter((item) => item.id !== allocation.id);
    saveBudgetAllocations(nextAllocations);
    setAllocations(nextAllocations);
    setOpenMenuId(null);
  }

  async function sendPayout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!payoutTarget) return;
    const formData = new FormData(event.currentTarget);
    setPayoutPending(true);
    setPayoutError("");
    try {
      const receipt = formData.get("receipt");
      if (!(receipt instanceof File) || receipt.size === 0) throw new Error("Unggah foto nota asli sebelum mengirim pencairan.");
      const amount = parseRupiahInput(payoutAmount);
      const itemsTotal = payoutItems.reduce((total, item) => total + item.subtotal, 0);
      if (itemsTotal !== amount) throw new Error(`Total rincian barang (${formatAmount(itemsTotal)}) harus sama dengan Nominal Pencairan (${formatAmount(amount)}).`);
      const payout = await recordBudgetPayout({
        allocationId: payoutTarget.id,
        application: String(formData.get("application") ?? ""),
        amount,
        items: payoutItems.map(({ name, quantity, unit, subtotal }) => ({ name, quantity, unit, subtotal })),
        receipt,
      });
      setAllocations(getBudgetState().allocations);
      setPayoutTarget(null);
      setPayoutNotice(`Instruksi ${payout.id} tercatat di Gerbang Pembayaran dengan status Processing.`);
    } catch (error) {
      setPayoutError(error instanceof Error ? error.message : "Pencairan gagal dicatat.");
    } finally {
      setPayoutPending(false);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-700"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-[18px]"><path d="M4 20V8l8-4 8 4v12H4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M8 20v-7h8v7M8 9h.01M12 9h.01M16 9h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg></span>
            <div><h2 className="text-sm font-extrabold text-[#102a61]">Rincian Alokasi Pos Anggaran Krisis</h2><p className="mt-1 text-[10px] text-slate-500">Pagu, dana yang sudah keluar, dan saldo setiap pos anggaran.</p></div>
          </div>
          <button type="button" onClick={() => openEditor()} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-[10px] font-bold text-blue-700 transition hover:bg-blue-50"><span className="text-base leading-none">＋</span>Tambah Pos Baru</button>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-[10px] sm:text-xs">
            <thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3 font-bold sm:px-5">Nama Pos Anggaran</th><th className="px-4 py-3 font-bold">Pagu Anggaran</th><th className="px-4 py-3 font-bold">Realisasi (Uang Keluar)</th><th className="px-4 py-3 font-bold">Sisa Saldo</th><th className="px-4 py-3 font-bold">Status</th><th className="w-16 px-4 py-3 text-center font-bold">Aksi</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {allocations.map((allocation) => {
                const remaining = allocation.budget - allocation.spent;
                const health = getHealth(allocation.spent, allocation.budget);
                return <tr key={allocation.id} className="transition hover:bg-blue-50/30">
                  <td className="px-4 py-3.5 sm:px-5"><div className="flex min-w-56 items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4"><path d="M12 3.5 20 7v5.3c0 4.2-3.4 7.1-8 8.7-4.6-1.6-8-4.5-8-8.7V7l8-3.5Z" stroke="currentColor" strokeWidth="1.6"/><path d="M8.5 12h7M12 8.5v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg></span><span className="min-w-0"><span className="block font-bold text-[#102a61]">{allocation.name}</span><span className="mt-1 block max-w-64 truncate text-[9px] text-slate-500">{allocation.description}</span></span></div></td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-700">{formatAmount(allocation.budget)}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-700">{formatAmount(allocation.spent)}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-700">{formatAmount(remaining)}</td>
                  <td className="px-4 py-3.5"><span title={health.description} className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-bold ${health.className}`}><span aria-hidden="true" className={`grid size-3.5 place-items-center rounded-full text-[8px] text-white ${health.dotClassName}`}>{health.icon}</span>{health.label}</span></td>
                  <td className="px-4 py-3.5 text-center"><div className="relative inline-block"><button type="button" aria-label={`Aksi untuk ${allocation.name}`} aria-expanded={openMenuId === allocation.id} onClick={() => setOpenMenuId((current) => current === allocation.id ? null : allocation.id)} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50">•••</button>{openMenuId === allocation.id && <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-slate-100 bg-white p-1 text-left shadow-lg"><button type="button" onClick={() => { setPayoutTarget(allocation); setPayoutAmount(""); setPayoutItems([createPayoutItem()]); setPayoutError(""); setPayoutNotice(""); setOpenMenuId(null); }} className="w-full rounded-md px-2.5 py-2 text-left text-[10px] font-semibold text-blue-700 hover:bg-blue-50">Kirim Dana</button><button type="button" onClick={() => openEditor(allocation)} className="w-full rounded-md px-2.5 py-2 text-left text-[10px] font-semibold text-slate-700 hover:bg-blue-50">Ubah pos</button><button type="button" onClick={() => removeAllocation(allocation)} className="w-full rounded-md px-2.5 py-2 text-left text-[10px] font-semibold text-rose-600 hover:bg-rose-50">Hapus pos</button></div>}</div></td>
                </tr>;
              })}
              {allocations.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-xs text-slate-500">Belum ada pos anggaran. Tambahkan pos baru untuk memulai.</td></tr>}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-[9px] text-slate-500 sm:px-5"><span>{allocations.length} pos anggaran · Total pagu {formatAmount(totalBudget)}</span><span>{ready ? "Pencairan dan transaksi tersimpan pada browser ini; belum terhubung ke bank." : "Memuat data anggaran…"}</span></footer>
      </section>

      {payoutNotice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">{payoutNotice} <a href="/bpdlh/pembayaran" className="ml-1 font-extrabold underline">Lihat pembayaran</a></p>}

      {editing && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4" onClick={() => setEditing(null)}>
        <section role="dialog" aria-modal="true" aria-labelledby="allocation-form-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
          <div className="flex items-start justify-between gap-3"><div><h2 id="allocation-form-title" className="text-base font-extrabold text-[#102a61]">{editing.id ? "Ubah Pos Anggaran" : "Tambah Pos Anggaran"}</h2><p className="mt-1 text-xs text-slate-500">Masukkan pagu dan nilai realisasi untuk pos ini.</p></div><button type="button" aria-label="Tutup" onClick={() => setEditing(null)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100">×</button></div>
          <form onSubmit={saveAllocation} className="mt-5 grid gap-3">
            <label className="grid gap-1.5 text-xs font-bold text-slate-700">Nama Pos Anggaran<input name="name" required maxLength={100} defaultValue={editing.name} placeholder="Contoh: Logistik & Sembako Darurat" className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-400" /></label>
            <label className="grid gap-1.5 text-xs font-bold text-slate-700">Keterangan<input name="description" required maxLength={160} defaultValue={editing.description} placeholder="Keterangan penggunaan pos" className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-400" /></label>
            <div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1.5 text-xs font-bold text-slate-700">Pagu Anggaran (Rp)<input name="budget" required type="number" min="1" step="1" defaultValue={editing.budget || ""} placeholder="50000000000" className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-400" /></label><label className="grid gap-1.5 text-xs font-bold text-slate-700">Realisasi / Uang Keluar (Rp)<input name="spent" required type="number" min="0" step="1" defaultValue={editing.spent || 0} placeholder="35000000000" className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-400" /></label></div>
            {formError && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{formError}</p>}
            <p className="text-[10px] leading-relaxed text-slate-500">Status dihitung dari persentase realisasi: Safe di bawah 70%, Warning mulai 70%, dan Critical mulai 90%.</p>
            <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setEditing(null)} className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">Batal</button><button type="submit" className="h-9 rounded-lg bg-blue-700 px-4 text-xs font-bold text-white hover:bg-blue-800">Simpan Pos</button></div>
          </form>
        </section>
      </div>}

      {payoutTarget && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" onClick={() => { if (!payoutPending) setPayoutTarget(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="budget-payout-title" onClick={(event) => event.stopPropagation()} className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-wide text-blue-700">Pencairan dari {payoutTarget.name}</p><h2 id="budget-payout-title" className="mt-1 text-base font-extrabold text-[#102a61]">Kirim Dana</h2><p className="mt-1 text-xs text-slate-500">Sisa saldo: <strong>{formatAmount(payoutTarget.budget - payoutTarget.spent)}</strong></p></div><button type="button" disabled={payoutPending} aria-label="Tutup" onClick={() => setPayoutTarget(null)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-50">×</button></div>
          <form onSubmit={sendPayout} className="mt-5 grid gap-3">
            <label className="grid gap-1.5 text-xs font-bold text-slate-700">Kejadian Bencana<select name="application" required defaultValue="" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-blue-400"><option value="" disabled>Pilih laporan bencana</option>{fundingRequests.map((request) => <option key={request.id} value={`${request.title} · ${request.org}`}>{request.title} · {request.org}</option>)}</select></label>
            <label className="grid gap-1.5 text-xs font-bold text-slate-700">Nominal Pencairan (Rp)<input name="amount" type="text" inputMode="numeric" autoComplete="off" required value={payoutAmount} onChange={(event) => setPayoutAmount(formatRupiahInput(event.target.value))} placeholder="15.000.000" className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-400" /><span className="text-[10px] font-normal text-slate-500">Ketik nominal secara manual. Pemisah ribuan ditambahkan otomatis. Maksimal {formatAmount(payoutTarget.budget - payoutTarget.spent)}</span></label>
            <fieldset className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><legend className="text-xs font-bold text-slate-700">Rincian Nama Barang & Keperluan</legend><button type="button" onClick={() => setPayoutItems((current) => [...current, createPayoutItem()])} className="rounded-lg border border-blue-200 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 hover:bg-blue-50">＋ Tambah Barang</button></div>
              <div className="grid gap-2">
                {payoutItems.map((item, index) => <div key={item.key} className="grid gap-2 rounded-lg bg-slate-50 p-2.5 sm:grid-cols-[minmax(0,1.5fr)_90px_100px_minmax(130px,1fr)_32px] sm:items-end sm:bg-transparent sm:p-0">
                  <label className="grid gap-1 text-[10px] font-semibold text-slate-600">Nama Barang<input required maxLength={120} value={item.name} onChange={(event) => setPayoutItems((current) => current.map((entry) => entry.key === item.key ? { ...entry, name: event.target.value } : entry))} placeholder={index === 0 ? "Mi Instan" : "Nama barang"} className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-normal outline-none focus:border-blue-400" /></label>
                  <label className="grid gap-1 text-[10px] font-semibold text-slate-600">Jumlah<input required type="number" min="1" step="1" value={item.quantity} onChange={(event) => setPayoutItems((current) => current.map((entry) => entry.key === item.key ? { ...entry, quantity: Number(event.target.value) } : entry))} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-normal outline-none focus:border-blue-400" /></label>
                  <label className="grid gap-1 text-[10px] font-semibold text-slate-600">Satuan<input required maxLength={20} value={item.unit} onChange={(event) => setPayoutItems((current) => current.map((entry) => entry.key === item.key ? { ...entry, unit: event.target.value } : entry))} placeholder="dus" className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-normal outline-none focus:border-blue-400" /></label>
                  <label className="grid gap-1 text-[10px] font-semibold text-slate-600">Subtotal (Rp)<input required type="text" inputMode="numeric" autoComplete="off" value={formatRupiahInput(String(item.subtotal || ""))} onChange={(event) => { const subtotal = parseRupiahInput(event.target.value); setPayoutItems((current) => current.map((entry) => entry.key === item.key ? { ...entry, subtotal } : entry)); }} placeholder="10.000.000" className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-normal outline-none focus:border-blue-400" /></label>
                  <button type="button" disabled={payoutItems.length === 1} onClick={() => setPayoutItems((current) => current.filter((entry) => entry.key !== item.key))} aria-label={`Hapus item ${index + 1}`} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-40">×</button>
                </div>)}
              </div>
              <p className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-2 text-[10px] text-slate-600"><span>Jumlah subtotal barang</span><strong className="text-[#102a61]">{formatAmount(payoutItems.reduce((total, item) => total + item.subtotal, 0))}</strong></p>
            </fieldset>
            <label className="grid gap-1.5 text-xs font-bold text-slate-700">Foto Bukti Nota<input name="receipt" type="file" accept="image/*" required className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-[10px] file:font-bold file:text-blue-700" /><span className="text-[10px] font-normal text-slate-500">Wajib foto kuitansi/nota asli, maksimal 8 MB (JPG, PNG, atau format gambar lain).</span></label>
            {payoutError && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{payoutError}</p>}
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-[10px] leading-relaxed text-amber-800">Kirim akan mengurangi saldo dan mencatat instruksi berstatus Processing. Transfer belum dikirim ke bank karena integrasi bank belum tersedia.</p>
            <div className="mt-1 flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" disabled={payoutPending} onClick={() => setPayoutTarget(null)} className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Batal</button><button type="submit" disabled={payoutPending} className="h-9 rounded-lg bg-blue-700 px-4 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-60">{payoutPending ? "Mengirim…" : "Kirim"}</button></div>
          </form>
        </section>
      </div>}
    </>
  );
}
