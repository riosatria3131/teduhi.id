"use client";

import Image from "next/image";
import { useLandingPageContent } from "@/lib/landing-page-content";

export function ProfileSection() {
  const content = useLandingPageContent();
  return (
    <section
      id="profil"
      aria-labelledby="judul-profil"
      className="scroll-mt-24 overflow-hidden border-y border-line bg-[#f5f8ff]"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20 2xl:px-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.85fr] lg:gap-12">
          <div>
            <p className="text-[13px] font-extrabold tracking-[0.2em] text-brand uppercase">
              Profil TEDUHI
            </p>
            <h2
              id="judul-profil"
              className="mt-4 max-w-xl text-3xl leading-tight font-extrabold tracking-[-0.03em] text-[#102a61] text-balance sm:text-4xl"
            >
              {content.profileHeading}
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted sm:text-base">
              {content.profileDescription}
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[250px] sm:max-w-[290px] lg:max-w-[320px]">
              <Image
                src="/mobile.png"
                alt="Pratinjau tampilan TEDUHI pada ponsel untuk melihat riwayat laporan bencana"
                width={1024}
                height={1536}
                sizes="(max-width: 640px) 250px, (max-width: 1024px) 290px, 320px"
                className="block h-auto w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}