"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Users,
  CalendarDays,
  PlusCircle,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { logout } from "./actions";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Target },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/new", label: "New Lead", icon: PlusCircle },
];

const SIDEBAR_COLLAPSED_STORAGE_KEY = "crm-sidebar-collapsed";

function BrandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 251 158"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M247.034 0.12439H221.139C218.714 0.12439 217.437 2.99258 219.044 4.80144L222.965 9.19867L186.283 98.6423L149.6 9.19867L153.552 4.76147C155.149 2.9626 153.881 0.12439 151.476 0.12439H125.531C120.033 0.12439 120.172 4.68152 122.947 7.08L127.297 11.5272L174.607 125.275C175.166 126.625 176.484 127.504 177.95 127.504H194.635C196.092 127.504 197.409 126.625 197.978 125.275L245.278 11.5272L249.629 7.08C252.393 4.68152 250.697 0.12439 247.044 0.12439H247.034Z"
        fill="currentColor"
      />
      <path
        d="M175.256 146.072L127.946 32.3241C127.387 30.9749 126.07 30.0955 124.603 30.0955H107.918C106.461 30.0955 105.144 30.9749 104.575 32.3241L73.6308 106.717H28.6858V70.49H78.9197C80.167 70.49 81.2946 69.7305 81.7636 68.5712L89.3376 51.3021C89.7667 50.2428 88.9884 49.0835 87.8508 49.0835H28.6858V20.1318H99.5561L104.506 24.579C106.382 26.2579 109.355 24.9287 109.355 22.4103V3.14249C109.355 1.47354 108.008 0.12439 106.342 0.12439H2.9801C0.365629 0.12439 -0.871757 3.36235 1.07413 5.11124L7.03154 10.4579V117.031L0.934427 122.567C-0.981525 124.306 0.245882 127.494 2.83042 127.494H64.9791L57.2554 146.062L52.9046 150.51C50.1405 152.908 51.8369 157.465 55.4892 157.465H81.3844C83.8093 157.465 85.0866 154.597 83.48 152.788L79.5583 148.391L88.1302 127.504L96.6522 106.717L116.241 58.9573L135.829 106.717H106.92C105.364 106.717 103.957 107.657 103.358 109.106L96.9116 124.806C96.3828 126.095 97.3307 127.504 98.7178 127.504H144.351L152.923 148.391L148.972 152.828C147.375 154.627 148.642 157.465 151.047 157.465H176.992C180.655 157.465 182.351 152.908 179.577 150.51L175.226 146.062L175.256 146.072Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
    if (storedValue === "true") {
      setIsCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_COLLAPSED_STORAGE_KEY,
      String(isCollapsed),
    );
  }, [isCollapsed]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navLinks = (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex h-[38px] items-center rounded-md font-body text-sm transition-colors ${
              isCollapsed ? "justify-center px-0" : "gap-3 px-3"
            } ${
              isActive
                ? "bg-eav-orange/10 font-medium text-eav-orange"
                : "text-eav-muted hover:bg-eav-surface hover:text-eav-black"
            }`}
            aria-label={item.label}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && item.label}
            {isCollapsed && (
              <span className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-eav-border bg-eav-white px-2 py-1 text-xs text-eav-black opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );

  const mobileNavLinks = (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex h-[38px] items-center gap-3 rounded-md px-3 font-body text-sm transition-colors ${
              isActive
                ? "bg-eav-orange/10 font-medium text-eav-orange"
                : "text-eav-muted hover:bg-eav-surface hover:text-eav-black"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-3 z-40 flex h-9 w-9 items-center justify-center rounded-md text-eav-orange transition-colors hover:bg-eav-orange/10 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" strokeWidth={2.75} />
      </button>

      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity md:hidden ${
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-eav-border bg-eav-white transition-transform duration-200 md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center border-b border-eav-border px-3">
          <Link
            href="/"
            className="inline-flex items-center"
            aria-label="EAV Wash Co. home"
          >
            <Image
              src="/wordmark-black.svg"
              alt="EAV Wash Co."
              width={130}
              height={31}
              priority
              className="h-4"
            />
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-eav-muted transition-colors hover:bg-eav-surface hover:text-eav-black"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">{mobileNavLinks}</nav>

        <form action={logout} className="border-t border-eav-border p-3">
          <button
            type="submit"
            className="flex h-[38px] w-full items-center gap-3 rounded-md px-3 font-body text-sm text-eav-muted transition-colors hover:bg-eav-surface hover:text-eav-black"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </form>
      </aside>

      <aside
        className={`hidden shrink-0 border-r border-eav-border bg-eav-white transition-[width] duration-200 md:flex md:flex-col ${
          isCollapsed ? "w-16" : "w-56"
        }`}
      >
        <div className="flex h-14 items-center border-b border-eav-border px-3">
          {isCollapsed ? (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="group relative mx-auto flex h-8 w-8 items-center justify-center rounded-md text-eav-orange transition-colors hover:bg-eav-surface"
              aria-label="Expand sidebar"
            >
              <BrandIcon className="h-5 w-auto transition-opacity group-hover:opacity-0" />
              <PanelLeftOpen className="text-eav-black absolute h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ) : (
            <>
              <Link
                href="/"
                className="inline-flex items-center"
                aria-label="EAV Wash Co. home"
              >
                <Image
                  src="/wordmark-black.svg"
                  alt="EAV Wash Co."
                  width={130}
                  height={31}
                  priority
                  className="h-4"
                />
              </Link>
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-eav-muted transition-colors hover:bg-eav-surface hover:text-eav-black"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">{navLinks}</nav>

        <form action={logout} className="border-t border-eav-border p-3">
          <button
            type="submit"
            className={`group relative flex h-[38px] w-full items-center rounded-md font-body text-sm text-eav-muted transition-colors hover:bg-eav-surface hover:text-eav-black ${
              isCollapsed ? "justify-center px-0" : "gap-3 px-3"
            }`}
            aria-label="Sign Out"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && "Sign Out"}
            {isCollapsed && (
              <span className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-eav-border bg-eav-white px-2 py-1 text-xs text-eav-black opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                Sign Out
              </span>
            )}
          </button>
        </form>
      </aside>
    </>
  );
}
