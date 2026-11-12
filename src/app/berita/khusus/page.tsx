import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PublicBudgetSummary } from "@/components/public-budget-summary";
import { PublicBudgetIslandChart } from "@/components/public-budget-island-chart";

export default function SpecialNewsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="min-h-[60vh] bg-[linear-gradient(180deg,#f7fcfa_0%,#ffffff_100%)] py-12 sm:py-16">
        <section aria-labelledby="special-news-title" className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 2xl:px-16">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-emerald-800 sm:text-xs">
            Berita TEDUHI
          </p>
          <h1 id="special-news-title" className="mt-4 text-3xl font-extrabold tracking-tight text-[#102a61] sm:text-4xl lg:text-5xl">Berita Khusus</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base sm:leading-7">Informasi khusus dari TEDUHI akan ditampilkan di halaman ini.</p>
          <PublicBudgetSummary />
          <PublicBudgetIslandChart />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
