"use client";

import { useEffect, useState } from "react";
import { ClockIcon } from "@/components/icons";

const DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const COMPACT_DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function LiveDate({ className = "" }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateDate = () => setNow(new Date());
    updateDate();
    const interval = window.setInterval(updateDate, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 ${className}`}>
      <ClockIcon width={13} height={13} className="shrink-0" />
      <time dateTime={now?.toISOString().slice(0, 10)}>
        {now ? <><span className="hidden sm:inline">{DATE_FORMAT.format(now)}</span><span className="sm:hidden">{COMPACT_DATE_FORMAT.format(now)}</span></> : "Memuat tanggal…"}
      </time>
    </span>
  );
}
