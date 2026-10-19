import { MOCK_ACTIVITY } from "./portal-data";

export function ActivityChart() {
    return (
        <section aria-labelledby="activity-title" className="mt-5">
            <div className="mb-2"><h2 id="activity-title" className="text-sm font-bold text-white">Aktivitas Laporan</h2><p className="mt-0.5 text-[11px] text-white/75">7 hari terakhir · data contoh</p></div>
            <div className="flex h-24 items-end justify-between gap-2 border-b border-white/25 px-1 sm:h-28">
                {MOCK_ACTIVITY.map(({ label, value }) => (
                    <div key={label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                        <div role="img" aria-label={`${value} laporan pada ${label}`} className="w-full max-w-8 rounded-t-md bg-linear-to-t from-cyan-300/70 to-cyan-200" style={{ height: `${Math.max(24, value * 0.65)}px` }} />
                        <span className="pb-1 text-[9px] font-medium text-white/80 sm:text-[10px]">{label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}