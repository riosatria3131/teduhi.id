"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowDownIcon, FileIcon, SearchIcon, ShieldCheckIcon } from "@/components/icons";
import { getBudgetPayouts, getBudgetReceipt, subscribeToBudgetChanges, type BudgetPayout, type BudgetPayoutItem } from "@/lib/bpdlh-budget-store";

const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const formatAmount = (amount: number) => currency.format(amount).replace("Rp", "Rp ");
const PAGE_SIZE = 8;

function payoutItems(payout: BudgetPayout): BudgetPayoutItem[] {
  return payout.items?.length
    ? payout.items
    : [{ name: payout.purpose, quantity: 1, unit: "paket", subtotal: payout.amount }];
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "—", time: "—" };
  return {
    date: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date),
    time: `${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date)} WIB`,
  };
}

export function PaymentGate() {
  const [payouts, setPayouts] = useState<BudgetPayout[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BudgetPayout | null>(null);
  const [selectedItems, setSelectedItems] = useState<BudgetPayout | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState("");
  const [receiptError, setReceiptError] = useState("");
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setPayouts(getBudgetPayouts());
      setLoading(false);
    };
    const timer = window.setTimeout(refresh, 0);
    const unsubscribe = subscribeToBudgetChanges(refresh);
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  useEffect(() => () => {
    if (receiptUrl) URL.revokeObjectURL(receiptUrl);
  }, [receiptUrl]);

  const filtered = useMemo(() => payouts.filter((payout) => {
    const searchText = `${payout.id} ${payout.application} ${payout.allocationName} ${payout.purpose} ${payout.receiptName ?? ""}`.toLowerCase();
    return searchText.includes(query.trim().toLowerCase());
  }), [payouts, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalSpent = payouts.reduce((total, payout) => total + payout.amount, 0);

  async function openReceipt(payout: BudgetPayout) {
    setSelected(payout);
    setReceiptError("");
    setLoadingReceipt(true);
    setReceiptUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
    try {
      const receipt = await getBudgetReceipt(payout.id);
      if (!receipt) {
        setReceiptError("Foto nota tidak ditemukan di penyimpanan browser ini.");
        return;
      }
      setReceiptName(receipt.fileName);
      setReceiptUrl(URL.createObjectURL(receipt.file));
    } catch (error) {
      setReceiptError(error instanceof Error ? error.message : "Foto bukti nota gagal dibuka.");
    } finally {
      setLoadingReceipt(false);
    }
  }

  function closeReceipt() {
    setSelected(null);
    setReceiptError("");
    setReceiptUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
  }

  return (
    <div className="mx-auto grid max-w-[1500px] gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><ShieldCheckIcon width={21} height={21} /></span>
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-700">Keuangan BPDLH</p><h1 className="mt-1 text-lg font-extrabold text-[#102a61] sm:text-xl">Riwayat Nota Belanja</h1><p className="mt-1 text-xs text-slate-500">Buku Kas Keluar · rincian setiap pencairan dana dan bukti nota.</p></div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-right shadow-sm"><p className="text-[10px] font-semibold text-slate-500">Total pengeluaran tercatat</p><p className="mt-0.5 text-base font-extrabold text-[#102a61]">{formatAmount(totalSpent)}</p><p className="text-[9px] text-slate-400">{payouts.length} transaksi</p></div>
      </header>

      <section aria-label="Riwayat nota belanja" className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div><h2 className="text-sm font-extrabold text-[#102a61]">Tabel Riwayat Nota Belanja</h2><p className="mt-1 text-[10px] text-slate-500">Telusuri tanggal, kejadian, sumber anggaran, keperluan, dan bukti pengeluaran.</p></div>
          <label className="relative block w-full sm:max-w-xs"><span className="sr-only">Cari pengeluaran</span><SearchIcon width={15} height={15} className="absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari kejadian atau keperluan..." className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-blue-400" /></label>
        </div>

        <div className="overflow-x-auto px-3 sm:px-5">
          <table className="w-full min-w-[1050px] border-separate border-spacing-0 text-left text-[10px] sm:text-xs">
            <thead><tr className="bg-slate-50 text-slate-500"><th className="rounded-l-lg border-y border-l border-slate-100 px-3 py-3 font-bold">Tanggal & Waktu</th><th className="border-y border-slate-100 px-3 py-3 font-bold">Nama Bencana</th><th className="border-y border-slate-100 px-3 py-3 font-bold">Pos Anggaran</th><th className="border-y border-slate-100 px-3 py-3 font-bold">Nama Barang & Keperluan</th><th className="border-y border-slate-100 px-3 py-3 font-bold">Total Pengeluaran</th><th className="rounded-r-lg border-y border-r border-slate-100 px-3 py-3 text-center font-bold">Bukti Nota</th></tr></thead>
            <tbody>
              {visible.map((payout) => {
                const date = formatDateTime(payout.createdAt);
                return <tr key={payout.id} className="transition hover:bg-blue-50/30">
                  <td className="whitespace-nowrap border-b border-slate-100 px-3 py-4 text-slate-600"><span className="block font-semibold">{date.date}</span><span className="mt-1 block text-[9px] text-slate-400">{date.time}</span></td>
                  <td className="border-b border-slate-100 px-3 py-4"><span className="block max-w-56 font-bold text-[#102a61]">{payout.application}</span><span className="mt-1 block text-[9px] text-slate-400">{payout.id}</span></td>
                  <td className="border-b border-slate-100 px-3 py-4 font-semibold text-slate-600">{payout.allocationName}</td>
                  <td className="border-b border-slate-100 px-3 py-4 text-slate-600"><button type="button" onClick={() => setSelectedItems(payout)} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[9px] font-bold text-blue-700 transition hover:bg-blue-100">Lihat {payoutItems(payout).length} Item</button></td>
                  <td className="whitespace-nowrap border-b border-slate-100 px-3 py-4 font-extrabold text-[#102a61]">{formatAmount(payout.amount)}</td>
                  <td className="border-b border-slate-100 px-3 py-4 text-center">{payout.receiptName ? <button type="button" onClick={() => void openReceipt(payout)} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[9px] font-bold text-blue-700 transition hover:bg-blue-100"><FileIcon width={13} height={13} />Buka Nota</button> : <span className="text-[9px] font-semibold text-amber-700">Nota belum tersedia</span>}</td>
                </tr>;
              })}
              {!loading && visible.length === 0 && <tr><td colSpan={6} className="px-4 py-14 text-center"><span className="mx-auto grid size-10 place-items-center rounded-xl bg-slate-50 text-slate-400"><FileIcon width={19} height={19} /></span><p className="mt-3 text-xs font-bold text-slate-600">{query ? "Tidak ada pengeluaran yang cocok." : "Belum ada nota belanja."}</p><p className="mt-1 text-[10px] text-slate-400">Pencairan yang dicatat dari Pos Anggaran akan muncul di buku kas keluar.</p></td></tr>}
              {loading && <tr><td colSpan={6} className="px-4 py-12 text-center text-xs text-slate-500">Memuat riwayat pengeluaran…</td></tr>}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3.5 sm:px-5"><p className="text-[10px] text-slate-500">Menampilkan {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length} pengeluaran</p><nav aria-label="Navigasi halaman buku kas keluar" className="flex items-center gap-1"><button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Halaman sebelumnya" className="grid size-8 place-items-center rounded-lg border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 disabled:opacity-40">‹</button><span className="px-2 text-[10px] font-bold text-blue-700">{page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Halaman berikutnya" className="grid size-8 place-items-center rounded-lg border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 disabled:opacity-40">›</button></nav></footer>
        <p className="border-t border-slate-100 px-4 py-2.5 text-[9px] text-slate-400 sm:px-5">Nota disimpan pada browser yang digunakan untuk mencatat pencairan. Fitur ini belum tersambung ke database maupun sistem bank.</p>
      </section>

      {selectedItems && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" onClick={() => setSelectedItems(null)}>
        <section role="dialog" aria-modal="true" aria-labelledby="expense-items-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5"><div className="min-w-0"><p className="text-[9px] font-extrabold uppercase tracking-wide text-blue-700">Rincian pengeluaran · {selectedItems.id}</p><h2 id="expense-items-title" className="mt-1 text-sm font-extrabold text-[#102a61]">Nama Barang & Keperluan</h2><p className="mt-1 truncate text-[10px] text-slate-500">{selectedItems.application} · {selectedItems.allocationName}</p></div><button type="button" aria-label="Tutup rincian barang" onClick={() => setSelectedItems(null)} className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100">×</button></header>
          <div className="max-h-[55dvh] overflow-auto p-4 sm:p-5"><table className="w-full min-w-[480px] text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="rounded-l-lg px-3 py-2.5 font-bold">Nama Barang</th><th className="px-3 py-2.5 font-bold">Jumlah</th><th className="px-3 py-2.5 font-bold">Satuan</th><th className="rounded-r-lg px-3 py-2.5 text-right font-bold">Subtotal</th></tr></thead><tbody className="divide-y divide-slate-100">{payoutItems(selectedItems).map((item, index) => <tr key={`${selectedItems.id}-${index}`}><td className="px-3 py-3 font-semibold text-[#102a61]">{item.name}</td><td className="px-3 py-3 text-slate-600">{new Intl.NumberFormat("id-ID").format(item.quantity)}</td><td className="px-3 py-3 text-slate-600">{item.unit}</td><td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-slate-700">{formatAmount(item.subtotal)}</td></tr>)}</tbody><tfoot><tr className="border-t-2 border-slate-200"><th colSpan={3} className="px-3 py-3 text-left text-xs font-extrabold text-[#102a61]">Total Pengeluaran</th><td className="whitespace-nowrap px-3 py-3 text-right text-xs font-extrabold text-[#102a61]">{formatAmount(payoutItems(selectedItems).reduce((total, item) => total + item.subtotal, 0))}</td></tr></tfoot></table></div>
          <footer className="flex justify-end border-t border-slate-100 px-4 py-3 sm:px-5"><button type="button" onClick={() => setSelectedItems(null)} className="h-9 rounded-lg bg-blue-700 px-4 text-xs font-bold text-white hover:bg-blue-800">Tutup</button></footer>
        </section>
      </div>}

      {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" onClick={closeReceipt}>
        <section role="dialog" aria-modal="true" aria-labelledby="receipt-title" onClick={(event) => event.stopPropagation()} className="flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5"><div className="min-w-0"><h2 id="receipt-title" className="text-sm font-extrabold text-[#102a61]">Bukti Nota Belanja</h2><p className="mt-1 truncate text-[10px] text-slate-500">{selected.application} · {selected.allocationName} · {formatAmount(selected.amount)}</p></div><button type="button" aria-label="Tutup bukti nota" onClick={closeReceipt} className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100">×</button></header>
          <div className="grid min-h-64 flex-1 place-items-center overflow-auto bg-slate-50 p-4">{loadingReceipt ? <p role="status" className="text-xs text-slate-500">Membuka foto nota…</p> : receiptError ? <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-xs text-rose-700">{receiptError}</p> : receiptUrl ? <Image unoptimized src={receiptUrl} alt={`Foto nota untuk ${selected.purpose}`} width={1400} height={1000} className="max-h-[70dvh] max-w-full rounded-lg object-contain shadow-sm" /> : null}</div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:px-5"><p className="min-w-0 truncate text-[10px] text-slate-500">{receiptName}</p>{receiptUrl && <a href={receiptUrl} download={receiptName} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-700 px-3 text-[10px] font-bold text-white hover:bg-blue-800"><ArrowDownIcon width={14} height={14} />Unduh Nota</a>}</footer>
        </section>
      </div>}
    </div>
  );
}
