import type { ReactNode } from "react";
import { BpdlhSidebar } from "./_components/BpdlhSidebar";
import { BpdlhTopbar } from "./_components/BpdlhTopbar";

export default function BpdlhLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7faff]">
      <BpdlhSidebar />
      <div className="lg:pl-64">
        <BpdlhTopbar />
        <main className="mx-auto w-full max-w-[1600px] p-3 sm:p-4 lg:p-5">{children}</main>
      </div>
    </div>
  );
}
