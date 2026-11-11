"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getDemoSessionName } from "@/lib/demo-auth";
import { getPortalPageHeading } from "./portal-page-heading";

export function PortalMobilePageIntro() {
  const pathname = usePathname();
  const [name, setName] = useState("Warga");
  const isHome = pathname === "/portal";
  const heading = getPortalPageHeading(pathname);

  useEffect(() => {
    if (!isHome) return;
    const refreshName = () => setName(getDemoSessionName() ?? "Warga");
    refreshName();
    window.addEventListener("laporkota:session-changed", refreshName);
    return () => window.removeEventListener("laporkota:session-changed", refreshName);
  }, [isHome]);

  const firstName = name.trim().split(/\s+/)[0] || "Warga";
  const greetingName = `${firstName[0].toUpperCase()}${firstName.slice(1)}`;
  if (!isHome && !heading.eyebrow && !heading.title && !heading.subtitle) return null;

  return (
    <section className="mb-5 lg:hidden">
      {isHome ? <>
        <h1 className="text-xl font-extrabold tracking-tight text-[#102a61]">Halo, {greetingName}!</h1>
        <p className="mt-0.5 text-sm text-[#31547f]">Ada bencana? Segera tindak lanjuti!</p>
      </> : <>
        {heading.eyebrow && <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-dark">{heading.eyebrow}</p>}
        {heading.title && <h1 className="mt-1 text-2xl font-extrabold leading-tight text-[#102a61]">{heading.title}</h1>}
        {heading.subtitle && <p className="mt-1 text-sm leading-relaxed text-[#31547f]">{heading.subtitle}</p>}
      </>}
    </section>
  );
}
