import { LogoMark } from "./icons";

const COLUMNS = [
  {
    title: "Produk",
    links: [
      { label: "Fitur", href: "#lapor" },
      { label: "Cara kerja", href: "#cara-kerja" },
    ],
  },
  {
    title: "Akses",
    links: [
      { label: "Warga", href: "/daftar" },
      { label: "Masuk", href: "/masuk" },
    ],
  },
  {
    title: "Bantuan & Legal",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Syarat & Ketentuan", href: "#" },
      { label: "Bantuan (support@laporkota.id)", href: "mailto:support@laporkota.id" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-12 px-6 py-14 sm:gap-x-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div className="col-span-2 lg:col-span-1">
          <a href="#beranda" className="flex items-center gap-3">
            <LogoMark size={40} />
            <span className="text-lg font-extrabold tracking-tight text-ink">TEDUHI</span>
          </a>
          <p className="mt-4 max-w-xs text-[13px] leading-6 text-muted">
            Suara warga, kota lebih baik. Lapor, pantau, dan lihat hasilnya.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-xs font-extrabold tracking-[0.14em] text-ink uppercase">{col.title}</h2>
            <ul className="mt-5 grid gap-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-[13px] leading-6 break-words text-muted hover:text-brand-dark">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-6 py-5 text-xs text-muted">
          © 2026 TEDUHI. Seluruh hak dilindungi.
        </p>
      </div>
    </footer>
  );
}
