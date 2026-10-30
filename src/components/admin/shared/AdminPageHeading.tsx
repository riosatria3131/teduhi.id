type AdminPageHeadingProps = { eyebrow: string; title: string; description: string };

export function AdminPageHeading({ eyebrow, title, description }: AdminPageHeadingProps) {
  return <header><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">{eyebrow}</p><h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#102a61] sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">{description}</p></header>;
}