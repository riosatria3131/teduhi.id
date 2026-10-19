import type { ComponentType, ReactNode, SVGProps } from "react";

export function SectionTitle({
  icon: Icon, title, subtitle, id, children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  subtitle: string;
  id?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand text-white">
          <Icon width={18} height={18} />
        </span>
        <div>
          <h2 id={id} className="text-[17px] font-extrabold text-ink">{title}</h2>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
