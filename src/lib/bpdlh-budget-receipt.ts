import type { BudgetPayout, BudgetPayoutItem } from "@/lib/bpdlh-budget-store";

const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const formatAmount = (amount: number) => currency.format(amount).replace("Rp", "Rp ");

function payoutItems(payout: BudgetPayout): BudgetPayoutItem[] {
  return payout.items?.length
    ? payout.items
    : [{ name: payout.purpose, quantity: 1, unit: "paket", subtotal: payout.amount }];
}

function itemUnitPrice(item: BudgetPayoutItem) {
  return item.unitPrice ?? Math.round(item.subtotal / item.quantity);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(date);
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

export function printBudgetPayoutNote(payout: BudgetPayout) {
  const items = payoutItems(payout);
  const rows = Array.from({ length: Math.max(10, items.length) }, (_, index) => {
    const item = items[index];
    if (!item) return `<tr><td>${index + 1}</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
    const date = index === 0 ? formatDate(payout.createdAt) : "";
    const eventName = index === 0 ? payout.application : "";
    return `<tr><td>${index + 1}</td><td>${escapeHtml(date)}</td><td class="event-name">${escapeHtml(eventName)}</td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(formatAmount(itemUnitPrice(item)))}</td><td>${new Intl.NumberFormat("id-ID").format(item.quantity)} ${escapeHtml(item.unit)}</td><td>${escapeHtml(formatAmount(item.subtotal))}</td></tr>`;
  }).join("");
  const noteDate = formatDate(payout.createdAt);

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
          <p>Kepada Yth.: <span class="line">BPBD · ${escapeHtml(payout.application)}</span></p>
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
