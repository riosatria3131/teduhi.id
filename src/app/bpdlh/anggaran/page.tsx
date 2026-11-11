import Link from "next/link";
import { BudgetOverview } from "../_components/BudgetOverview";

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

      <BudgetOverview />
    </div>
  );
}
