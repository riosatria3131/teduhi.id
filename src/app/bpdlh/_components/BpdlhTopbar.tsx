import { BpdlhNotifications } from "./BpdlhNotifications";

export function BpdlhTopbar() {
  return (
    <header className="sticky top-0 z-20 flex min-h-[58px] items-center justify-between gap-3 border-b border-slate-100 bg-white/95 px-4 backdrop-blur sm:px-6 lg:h-[62px] lg:px-7">
      <span className="text-xs font-extrabold text-[#102a61] sm:hidden">BPDLH · Keuangan</span>
      <div className="ml-auto flex shrink-0 items-center gap-2.5 sm:gap-4">
        <BpdlhNotifications />
        <div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full bg-blue-100 text-[9px] font-extrabold text-blue-700">AD</span><span className="hidden text-[10px] font-bold text-[#102a61] sm:inline">Admin Keuangan</span></div>
      </div>
    </header>
  );
}
