import type { ReactNode } from "react";
import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/shell/AdminSidebar";
import { AdminTopbar } from "@/components/admin/shell/AdminTopbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7faff]">
      <Suspense fallback={<div className="hidden lg:block lg:w-64" aria-hidden="true" />}>
        <AdminSidebar />
      </Suspense>
      <div className="lg:pl-64">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-7 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}