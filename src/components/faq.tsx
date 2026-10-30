import { FAQS } from "@/lib/data";
import { ChevronIcon } from "./icons";

export function Faq() {
  return (
    <section id="faq" aria-labelledby="judul-faq" className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 2xl:px-16 md:py-24">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.45fr] lg:gap-14">
        <div>
          <p className="text-[13px] font-extrabold tracking-[0.2em] text-black uppercase">
            Pertanyaan umum
          </p>
              <h2
            className="mt-5 text-2xl leading-[1.15] font-extrabold tracking-[-0.03em] text-black text-balance sm:text-3xl"
          >
            Yang dapat anda ketahui
            <br />
            Sebelum melapor :
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-6 text-muted">
            Kami menyediakan ruang sebagai tempat untuk menyalurkan pertanyaan.
          </p>
        </div>

        <div className="divide-y divide-line border-y border-line">
          {FAQS.map((f, i) => (
            <details key={f.q} open={i === 0} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-sm font-bold text-ink [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronIcon
                  width={20}
                  height={20}
                  className="shrink-0 rotate-90 transition-transform group-open:-rotate-90"
                />
              </summary>
              <p className="max-w-[40rem] pb-6 text-[13px] leading-6 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
