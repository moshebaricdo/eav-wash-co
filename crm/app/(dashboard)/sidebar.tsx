"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, Users, CalendarDays, PlusCircle } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Target },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/new", label: "New Lead", icon: PlusCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-eav-border bg-eav-white md:flex md:flex-col">
      <div className="flex h-14 items-center border-b border-eav-border px-5">
        <Link href="/" className="font-heading text-sm font-bold uppercase tracking-wide text-eav-orange">
          EAV Wash Co.
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 font-body text-sm transition-colors ${
                isActive
                  ? "bg-eav-orange/10 font-medium text-eav-orange"
                  : "text-eav-muted hover:bg-eav-surface hover:text-eav-black"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
