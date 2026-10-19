import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Svg(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width={20}
      height={20}
      {...props}
    />
  );
}

export const BuildingsIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 21h18M5 21V8l6-3v16M11 21V11l8 3v7M8 11h1M8 15h1M15 17h1" />
  </Svg>
);
export const SendIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13" />
  </Svg>
);
export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12 5 5L20 7" />
  </Svg>
);
export const FileIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5ZM14 3v5h5M9 13h6M9 17h4" />
  </Svg>
);
export const WrenchIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L3 17.7V21h3.3l6.3-6.3a4 4 0 0 0 5.1-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z" />
  </Svg>
);
export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);
export const BellIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
  </Svg>
);
export const CameraIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 8h3l2-3h6l2 3h3v11H4V8Z" />
    <circle cx="12" cy="13" r="3.5" />
  </Svg>
);
export const UploadIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 16V4m0 0L7 9m5-5 5 5M4 20h16" />
  </Svg>
);
export const PinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Svg>
);
export const ShieldCheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6l-8-3ZM8.5 12l2.5 2.5 4.5-5" />
  </Svg>
);
export const HardHatIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 18h18M5 18v-1a7 7 0 0 1 14 0v1M12 6v5M9.5 7.5v3.5M14.5 7.5v3.5" />
  </Svg>
);
export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);
export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const ChevronIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);
export const PlusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const CrosshairIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="7" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </Svg>
);
export const HomeIcon = (p: IconProps) => (
  <Svg {...p}><path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z" /></Svg>
);
export const ClockIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
);
export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></Svg>
);
export const UserIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Svg>
);
export const ArrowRightIcon = (p: IconProps) => (
  <Svg {...p}><path d="M5 12h14m-6-6 6 6-6 6" /></Svg>
);
export const ClipboardIcon = (p: IconProps) => (
  <Svg {...p}><path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1ZM8 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2M9 12h6M9 16h4" /></Svg>
);
export const ListIcon = (p: IconProps) => (
  <Svg {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></Svg>
);
export const RoadIcon = (p: IconProps) => (
  <Svg {...p}><path d="M7 3 4 21M17 3l3 18M12 4v3m0 4v3m0 4v3" /></Svg>
);
export const BulbIcon = (p: IconProps) => (
  <Svg {...p}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" /></Svg>
);
export const TrashIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Svg>
);
export const TreeIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 22v-6M12 16a5 5 0 0 1-4-8 4 4 0 0 1 8 0 5 5 0 0 1-4 8Z" /></Svg>
);
export const DropIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" /></Svg>
);
export const GridIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></Svg>
);

/** Logo TEDUHI: tiga gedung dengan nuansa biru. */
export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <rect x="3" y="22" width="14" height="22" rx="1.5" fill="#3b8bf5" />
      <rect x="15" y="5" width="18" height="39" rx="1.5" fill="#1868ea" />
      <rect x="31" y="17" width="14" height="27" rx="1.5" fill="#0f4fc4" />
      <g fill="#dbe9ff">
        <rect x="6" y="26" width="3" height="3" /><rect x="11" y="26" width="3" height="3" />
        <rect x="6" y="32" width="3" height="3" /><rect x="11" y="32" width="3" height="3" />
        <rect x="19" y="10" width="3" height="3" /><rect x="26" y="10" width="3" height="3" />
        <rect x="19" y="17" width="3" height="3" /><rect x="26" y="17" width="3" height="3" />
        <rect x="19" y="24" width="3" height="3" /><rect x="26" y="24" width="3" height="3" />
        <rect x="19" y="31" width="3" height="3" /><rect x="26" y="31" width="3" height="3" />
        <rect x="34" y="22" width="3" height="3" /><rect x="39" y="22" width="3" height="3" />
        <rect x="34" y="29" width="3" height="3" /><rect x="39" y="29" width="3" height="3" />
      </g>
      <rect x="1" y="43" width="46" height="2.5" rx="1.2" fill="#0f4fc4" />
    </svg>
  );
}

export const MailIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Svg>
);
export const LockIcon = (p: IconProps) => (
  <Svg {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Svg>
);
export const EyeIcon = (p: IconProps) => (
  <Svg {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Svg>
);
export const EyeOffIcon = (p: IconProps) => (
  <Svg {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /><path d="M4 4l16 16" /></Svg>
);
export const ArrowLeftIcon = (p: IconProps) => (
  <Svg {...p}><path d="M19 12H5m6-6-6 6 6 6" /></Svg>
);
export const LoginIcon = (p: IconProps) => (
  <Svg {...p}><path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l4 4-4 4M14 12H3" /></Svg>
);
export const LogOutIcon = (p: IconProps) => (
  <Svg {...p}><path d="M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></Svg>
);
export const SparkleIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" /></Svg>
);

export const ArrowDownIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 5v14m-6-6 6 6 6-6" /></Svg>
);
