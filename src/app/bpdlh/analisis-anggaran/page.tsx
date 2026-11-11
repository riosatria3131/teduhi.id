import { BudgetAllocations } from "../_components/BudgetAllocations";

export default function BudgetAnalysisPage() {
  return (
    <div className="mx-auto grid max-w-[1500px] gap-4">
      <header>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-blue-700">Keuangan BPDLH</p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight text-[#102a61] sm:text-2xl">Analisis Anggaran</h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">Kelola rincian alokasi pos anggaran krisis, pagu, realisasi, dan sisa saldo.</p>
      </header>
      <BudgetAllocations />
    </div>
  );
}
