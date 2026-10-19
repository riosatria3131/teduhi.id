/** Judul, subjudul, dan tab jenis akun di atas form masuk/daftar. */
export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <h2 className="mt-8 text-4xl font-extrabold tracking-[-0.03em] text-ink">{title}</h2>
      <p className="mt-3 text-muted">{subtitle}</p>

      <div className="mt-8 rounded-full border border-line bg-[#f3f5f9] p-1.5">
        <p
          aria-label="Jenis akun: Warga"
          className="rounded-full bg-white py-3.5 text-center text-sm font-extrabold tracking-wide text-brand-dark shadow-[0_1px_3px_rgba(16,39,92,0.14)]"
        >
          WARGA
        </p>
      </div>
    </>
  );
}
