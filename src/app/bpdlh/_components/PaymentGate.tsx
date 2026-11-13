"use client";

import { useEffect, useMemo, useState } from "react";
import { FileIcon, SearchIcon, ShieldCheckIcon } from "@/components/icons";
import { getBudgetPayouts, subscribeToBudgetChanges, type BudgetPayout, type BudgetPayoutItem } from "@/lib/bpdlh-budget-store";

const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const formatAmount = (amount: number) => currency.format(amount).replace("Rp", "Rp ");
const PAGE_SIZE = 8;

function payoutItems(payout: BudgetPayout): BudgetPayoutItem[] {
  return payout.items?.length
    ? payout.items
    : [{ name: payout.purpose, quantity: 1, unit: "paket", subtotal: payout.amount }];
}

function itemUnitPrice(item: BudgetPayoutItem) {
  return item.unitPrice ?? Math.round(item.subtotal / item.quantity);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "—", time: "—" };
  return {
    date: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date),
    time: `${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date)} WIB`,
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function downloadPayoutNote(payout: BudgetPayout) {
  const items = payoutItems(payout);
  const rows = Array.from({ length: Math.max(10, items.length) }, (_, index) => {
    const item = items[index];
    if (!item) return `<tr><td>${index + 1}</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
    const date = index === 0 ? formatDateTime(payout.createdAt).date : "";
    const eventName = index === 0 ? payout.application : "";
    return `<tr><td>${index + 1}</td><td>${escapeHtml(date)}</td><td class="event-name">${escapeHtml(eventName)}</td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(formatAmount(itemUnitPrice(item)))}</td><td>${new Intl.NumberFormat("id-ID").format(item.quantity)} ${escapeHtml(item.unit)}</td><td>${escapeHtml(formatAmount(item.subtotal))}</td></tr>`;
  }).join("");
  const date = new Date(payout.createdAt);
  const noteDate = Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(date);

  const noteHtml = `<!doctype html>
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Nota Belanja ${escapeHtml(payout.id)}</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          * { box-sizing: border-box; }
          body { margin: 0; color: #111; font-family: Arial, Helvetica, sans-serif; font-size: 11pt; }
          .top { display: flex; justify-content: space-between; gap: 30px; margin: 0 8px 18px; }
          .top p { width: 48%; margin: 0; font-weight: 700; }
          .line { display: inline-block; min-width: 62%; border-bottom: 1px dotted #222; padding: 0 4px 3px; font-weight: 400; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { border: 1.5px solid #111; padding: 7px 5px; overflow-wrap: anywhere; }
          th { background: #991b1b; color: #fff; text-align: center; font-weight: 700; }
          td { height: 29px; text-align: center; }
          .event-name { white-space: nowrap; font-size: 8pt; }
          th:nth-child(1), td:nth-child(1) { width: 6%; }
          th:nth-child(2), td:nth-child(2) { width: 12%; }
          th:nth-child(3), td:nth-child(3) { width: 28%; }
          th:nth-child(4), td:nth-child(4) { width: 16%; }
          th:nth-child(5), td:nth-child(5) { width: 13%; }
          th:nth-child(6), td:nth-child(6) { width: 13%; }
          th:nth-child(7), td:nth-child(7) { width: 12%; }
          .bottom { display: grid; grid-template-columns: 2fr 1.15fr; gap: 10px; margin-top: 10px; }
          .notes, .total { min-height: 72px; border: 1.5px solid #111; }
          .notes { padding: 8px 10px; }
          .notes strong { display: block; margin-bottom: 6px; }
          .total { display: grid; grid-template-columns: 1fr 1fr; align-items: stretch; text-align: center; font-weight: 700; }
          .total strong, .total span { display: grid; place-items: center; padding: 8px; }
          .total span { border-left: 1.5px solid #111; }
          @media print { tr { break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="top">
          <p>No. Nota: <span class="line">${escapeHtml(payout.id)}</span></p>
          <p>Kepada Yth.: <span class="line">BPDLH</span></p>
        </div>
        <table>
          <thead><tr><th>No.</th><th>Tanggal</th><th>Nama Bencana</th><th>Produk</th><th>Harga Satuan</th><th>Jumlah<br />(pcs)</th><th>Subtotal</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="bottom">
          <div class="notes"><strong>Keterangan:</strong>${escapeHtml(payout.allocationName)} · ${escapeHtml(payout.application)} · ${escapeHtml(noteDate)}</div>
          <div class="total"><strong>TOTAL</strong><span>${escapeHtml(formatAmount(payout.amount))}</span></div>
        </div>
      </body>
    </html>`;

  const printFrame = document.createElement("iframe");
  printFrame.setAttribute("title", "Nota belanja untuk dicetak");
  printFrame.style.position = "fixed";
  printFrame.style.left = "-10000px";
  printFrame.style.bottom = "0";
  printFrame.style.width = "1px";
  printFrame.style.height = "1px";
  printFrame.style.border = "0";
  printFrame.onload = () => {
    const printWindow = printFrame.contentWindow;
    if (!printWindow) {
      printFrame.remove();
      return;
    }
    printWindow.addEventListener("afterprint", () => printFrame.remove(), { once: true });
    printWindow.focus();
    printWindow.print();
  };
  printFrame.srcdoc = noteHtml;
  document.body.appendChild(printFrame);
}

export function PaymentGate() {
  const [payouts, setPayouts] = useState<BudgetPayout[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const nextPayouts = await getBudgetPayouts();
        if (active) {
          setPayouts(nextPayouts);
          setError("");
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Riwayat pencairan gagal dimuat dari Supabase.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void refresh();
    const poll = window.setInterval(() => void refresh(), 30000);
    const unsubscribe = subscribeToBudgetChanges(() => void refresh());
    return () => {
      active = false;
      window.clearInterval(poll);
      unsubscribe();
    };
  }, []);

  const filtered = useMemo(() => payouts.filter((payout) => {
    const searchText = `${payout.id} ${payout.application} ${payout.allocationName} ${payout.purpose} ${payout.receiptName ?? ""}`.toLowerCase();
    return searchText.includes(query.trim().toLowerCase());
  }), [payouts, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalSpent = payouts.reduce((total, payout) => total + payout.amount, 0);

  return (
    <div className="mx-auto grid max-w-[1500px] gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><ShieldCheckIcon width={21} height={21} /></span>
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-700">Keuangan BPDLH</p><h1 className="mt-1 text-lg font-extrabold text-[#102a61] sm:text-xl">Riwayat Nota Belanja</h1><p className="mt-1 text-xs text-slate-500">Buku Kas Keluar · rincian setiap pencairan dana dan bukti nota.</p></div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-right shadow-sm"><p className="text-[10px] font-semibold text-slate-500">Total pengeluaran tercatat</p><p className="mt-0.5 text-base font-extrabold text-[#102a61]">{formatAmount(totalSpent)}</p><p className="text-[9px] text-slate-400">{payouts.length} transaksi</p></div>
      </header>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">Riwayat pencairan gagal dimuat dari database. Pastikan migrasi anggaran sudah diterapkan dan akun memiliki role BPDLH. {error}</p>}

      <section aria-label="Riwayat nota belanja" className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div><h2 className="text-sm font-extrabold text-[#102a61]">Tabel Riwayat Nota Belanja</h2><p className="mt-1 text-[10px] text-slate-500">Telusuri tanggal, kejadian, sumber anggaran, keperluan, dan bukti pengeluaran.</p></div>
          <label className="relative block w-full sm:max-w-xs"><span className="sr-only">Cari pengeluaran</span><SearchIcon width={15} height={15} className="absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari kejadian atau keperluan..." className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-blue-400" /></label>
        </div>

        <div className="overflow-x-auto px-3 sm:px-5">
          <table className="w-full min-w-[1050px] border-separate border-spacing-0 text-left text-[10px] sm:text-xs">
            <thead><tr className="bg-slate-50 text-slate-500"><th className="rounded-l-lg border-y border-l border-slate-100 px-3 py-3 font-bold">Tanggal & Waktu</th><th className="border-y border-slate-100 px-3 py-3 font-bold">Nama Bencana</th><th className="border-y border-slate-100 px-3 py-3 font-bold">Pos Anggaran</th><th className="border-y border-slate-100 px-3 py-3 font-bold">Total Pengeluaran</th><th className="rounded-r-lg border-y border-r border-slate-100 px-3 py-3 text-center font-bold">Bukti Nota</th></tr></thead>
            <tbody>
              {visible.map((payout) => {
                const date = formatDateTime(payout.createdAt);
                return <tr key={payout.id} className="transition hover:bg-blue-50/30">
                  <td className="whitespace-nowrap border-b border-slate-100 px-3 py-4 text-slate-600"><span className="block font-semibold">{date.date}</span><span className="mt-1 block text-[9px] text-slate-400">{date.time}</span></td>
                  <td className="border-b border-slate-100 px-3 py-4"><span className="block max-w-56 font-bold text-[#102a61]">{payout.application}</span><span className="mt-1 block text-[9px] text-slate-400">{payout.id}</span></td>
                  <td className="border-b border-slate-100 px-3 py-4 font-semibold text-slate-600">{payout.allocationName}</td>
                  <td className="whitespace-nowrap border-b border-slate-100 px-3 py-4 font-extrabold text-[#102a61]">{formatAmount(payout.amount)}</td>
                  <td className="border-b border-slate-100 px-3 py-4 text-center"><button type="button" onClick={() => downloadPayoutNote(payout)} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[9px] font-bold text-blue-700 transition hover:bg-blue-100"><FileIcon width={13} height={13} />Buka Nota</button></td>
                </tr>;
              })}
              {!loading && visible.length === 0 && <tr><td colSpan={5} className="px-4 py-14 text-center"><span className="mx-auto grid size-10 place-items-center rounded-xl bg-slate-50 text-slate-400"><FileIcon width={19} height={19} /></span><p className="mt-3 text-xs font-bold text-slate-600">{query ? "Tidak ada pengeluaran yang cocok." : "Belum ada nota belanja."}</p><p className="mt-1 text-[10px] text-slate-400">Pencairan yang dicatat dari Pos Anggaran akan muncul di buku kas keluar.</p></td></tr>}
              {loading && <tr><td colSpan={5} className="px-4 py-12 text-center text-xs text-slate-500">Memuat riwayat pengeluaran…</td></tr>}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3.5 sm:px-5"><p className="text-[10px] text-slate-500">Menampilkan {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length} pengeluaran</p><nav aria-label="Navigasi halaman buku kas keluar" className="flex items-center gap-1"><button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Halaman sebelumnya" className="grid size-8 place-items-center rounded-lg border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 disabled:opacity-40">‹</button><span className="px-2 text-[10px] font-bold text-blue-700">{page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Halaman berikutnya" className="grid size-8 place-items-center rounded-lg border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 disabled:opacity-40">›</button></nav></footer>
      </section>

    </div>
  );
}
