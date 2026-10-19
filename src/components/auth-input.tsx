"use client";

import { useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

type Props = {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  placeholder: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  error?: string;
  extra?: ReactNode;
};

const base =
  "h-14 w-full rounded-2xl border border-line bg-white pr-4 pl-12 text-base text-ink placeholder:text-muted/70 aria-[invalid=true]:border-danger";

export function AuthInput({ id, label, icon: Icon, placeholder, type = "text", autoComplete, error, extra }: Props) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-bold text-ink">{label}</label>
        {extra}
      </div>
      <div className="relative">
        <Icon width={20} height={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
        <input
          id={id} name={id} type={isPassword && show ? "text" : type} autoComplete={autoComplete}
          placeholder={placeholder} className={`${base} ${isPassword ? "pr-12" : ""}`}
          aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}
        />
        {isPassword && (
          <button
            type="button" onClick={() => setShow((v) => !v)}
            aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} aria-pressed={show}
            className="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-paper"
          >
            {show ? <EyeOffIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
          </button>
        )}
      </div>
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}
