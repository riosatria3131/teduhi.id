import Link from "next/link";
import { BudgetAllocations } from "../_components/BudgetAllocations";
import { financeMetrics, realizationTrend } from "../_data";

export default function BudgetPage() {
  return (
    <div className="mx-auto grid max-w-[1500px] gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-blue-700">Keuangan BPDLH</p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-[#102a61] sm:text-2xl">Pos Anggaran</h1>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">Pantau pagu, realisasi, dan saldo setiap alokasi anggaran krisis.</p>
        </div>
        <Link href="/bpdlh/pembayaran" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-800">Lihat pembayaran</Link>
      </header>

      <section aria-label="Ringkasan anggaran" className="grid gap-3 sm:grid-cols-2">
        {financeMetrics.map((metric) => (
          <article key={metric.label} className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)] sm:p-5">
            <p className="text-xs font-bold text-slate-500">{metric.label}</p>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#102a61]">{metric.value}</p>
            <p className="mt-2 text-xs font-semibold text-emerald-700">{metric.note}</p>
            <p className="mt-1 text-[10px] text-slate-400">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_5px_20px_-18px_rgba(16,39,92,0.45)] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div><h2 className="text-sm font-extrabold text-[#102a61]">Tren realisasi anggaran</h2><p className="mt-1 text-[10px] text-slate-500">Persentase realisasi tahunan</p></div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700">Target 2026: 80%</span>
        </div>
        <div className="mt-5 grid grid-cols-5 items-end gap-3 sm:gap-6" aria-label="Grafik tren realisasi anggaran">
          {realizationTrend.map((item) => (
            <div key={item.year} className="grid justify-items-center gap-2">
              <span className="text-[10px] font-bold text-slate-600">{item.value}%</span>
              <div className="flex h-36 w-full max-w-16 items-end overflow-hidden rounded-t-lg bg-slate-100">
                <div className="w-full rounded-t-lg bg-blue-600" style={{ height: `${item.value}%` }} aria-label={`${item.year}: ${item.value}%`} />
              </div>
              <span className="text-[10px] font-semibold text-slate-500">{item.year}</span>
            </div>
          ))}
        </div>
      </section>

      <BudgetAllocations />
    </div>
  );
}
