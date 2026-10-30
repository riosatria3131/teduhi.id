"use client";

import { useLandingPageContent } from "@/lib/landing-page-content";

export function Cta() {
  const content = useLandingPageContent();
  return (
    <section className="mx-auto mt-4 mb-16 w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 2xl:px-16">
      <div className="flex flex-col items-start justify-between gap-7 rounded-2xl bg-[#f1f4fa] px-6 py-8 text-ink sm:px-8 md:flex-row md:items-center md:px-10 md:py-9">
        <div>
          <h2 className="max-w-xl text-base font-extrabold tracking-tight text-balance">
            {content.ctaHeading}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">{content.ctaDescription}</p>
        </div>
      </div>
    </section>
  );
}
