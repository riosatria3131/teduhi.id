import type { ReactNode } from "react";
import { PortalBottomNav } from "@/components/portal/PortalBottomNav";
import { PortalMobileHeader } from "@/components/portal/PortalMobileHeader";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { PortalAccessGuard } from "@/components/portal/PortalAccessGuard";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7faff]">
      <PortalSidebar />
      <PortalAccessGuard>
        <div className="lg:pl-64">
          <PortalTopbar />
          <PortalMobileHeader />
          <main className="mx-auto w-full max-w-[1500px] px-5 pb-32 pt-2 sm:px-7 sm:pt-6 lg:px-8 lg:pb-10">{children}</main>
        </div>
        <PortalBottomNav />
      </PortalAccessGuard>
    </div>
  );
}