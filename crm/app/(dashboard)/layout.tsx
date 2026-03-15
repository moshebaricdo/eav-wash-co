import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { Sidebar } from "./sidebar";
import { logout } from "./actions";
import { HeaderStats, HeaderStatsSkeleton } from "./header-stats";

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
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-eav-border bg-eav-white px-6">
          <Suspense fallback={<HeaderStatsSkeleton />}>
            <HeaderStats />
          </Suspense>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 font-body text-xs text-eav-muted transition-colors hover:bg-eav-surface hover:text-eav-black cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </form>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
