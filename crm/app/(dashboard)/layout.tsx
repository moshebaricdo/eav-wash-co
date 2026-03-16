import { Suspense } from "react";
import { Sidebar } from "./sidebar";
import { HeaderStats, HeaderStatsSkeleton } from "./header-stats";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center border-b border-eav-border bg-eav-white pl-14 pr-4 md:px-6">
          <Suspense fallback={<HeaderStatsSkeleton />}>
            <HeaderStats />
          </Suspense>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
