"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDemoDashboardPath, getDemoSession } from "@/lib/demo-auth";
import { useLandingPageContent } from "@/lib/landing-page-content";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";

const HERO_SLIDES = [
  { image: "/kebakaran.png.webp", alt: "Kebakaran hutan" },
  { image: "/longsor.png.webp", alt: "Bencana tanah longsor" },
  { image: "/banjir.png", alt: "Bencana banjir" },
  { image: "/tsunami.png.avif", alt: "Bencana tsunami" },
];

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [sessionRole, setSessionRole] = useState<string | undefined>();
  const content = useLandingPageContent();

  useEffect(() => {
    const refreshSession = () => setSessionRole(getDemoSession()?.role);
    refreshSession();
    window.addEventListener("laporkota:session-changed", refreshSession);
    window.addEventListener("storage", refreshSession);
    return () => {
      window.removeEventListener("laporkota:session-changed", refreshSession);
      window.removeEventListener("storage", refreshSession);
    };
  }, []);

  function showSlide(direction: number) {
    setActiveSlide((current) => (current + direction + HERO_SLIDES.length) % HERO_SLIDES.length);
  }

  return (
    <section
      id="beranda"
      aria-label="Banner utama"
      className="relative isolate overflow-hidden bg-night"
    >
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={slide.image}
          aria-hidden="true"
          className={`absolute inset-0 -z-10 bg-cover bg-center transition-opacity duration-700 motion-reduce:transition-none ${index === activeSlide ? "opacity-100" : "opacity-0"}`}
          style={{ backgroundImage: `url('${slide.image}')` }}
        />
      ))}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#081736]/90 via-[#081736]/65 to-[#081736]/20"
      />
      <div className="mx-auto flex min-h-[34rem] max-w-[1440px] items-start px-5 pt-10 pb-32 sm:px-8 lg:px-12 2xl:px-16 md:min-h-[40rem] md:pt-14 md:pb-36">
        <div className="relative z-10 max-w-2xl">
          <p className="inline-block rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {content.heroBadge}
          </p>
          <h1 className="mt-5 text-2xl leading-[1.08] font-extrabold tracking-tight text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.2)] sm:text-4xl lg:text-6xl">
            <span className="block">{content.heroLineOne}</span>
            <span className="block">{content.heroLineTwo}</span>
            <span className="mt-1 block text-3xl sm:text-5xl lg:text-7xl">{content.heroEmphasis}</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-white/90 sm:text-base">
            {content.heroSubtitle}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href={sessionRole ? getDemoDashboardPath(sessionRole) : "/daftar"}
              className="rounded-full border border-white/35 bg-white/10 px-5 py-3 text-xs font-bold text-white shadow-lg backdrop-blur-sm transition-[transform,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white/20 hover:shadow-xl active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none"
            >
              {sessionRole ? "Masuk ke dashboard" : "Mulai melapor"}
            </Link>
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label="Tampilkan banner sebelumnya"
        onClick={() => showSlide(-1)}
        className="absolute bottom-24 left-4 z-20 grid size-11 place-items-center rounded-full bg-orange-400/90 text-white shadow-lg transition hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:bottom-28 sm:left-6 sm:size-14"
      >
        <ArrowLeftIcon width={24} height={24} />
      </button>
      <button
        type="button"
        aria-label="Tampilkan banner berikutnya"
        onClick={() => showSlide(1)}
        className="absolute right-4 bottom-24 z-20 grid size-11 place-items-center rounded-full bg-orange-400/90 text-white shadow-lg transition hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:bottom-28 sm:right-6 sm:size-14"
      >
        <ArrowRightIcon width={24} height={24} />
      </button>
      <div className="absolute right-0 bottom-[41px] left-0 z-20 flex justify-center gap-2 sm:bottom-[51px]" aria-label="Pilih banner">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            aria-label={`Tampilkan banner ${index + 1}`}
            aria-current={index === activeSlide ? "true" : undefined}
            onClick={() => setActiveSlide(index)}
            className={`h-2.5 rounded-full transition-all ${index === activeSlide ? "w-7 bg-white" : "w-2.5 bg-white/60 hover:bg-white"}`}
          />
        ))}
      </div>
    </section>
  );
}
