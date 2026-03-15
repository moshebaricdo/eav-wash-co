"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  ChevronDown,
  Target,
  UserPlus,
  CalendarPlus,
} from "lucide-react";

const items = [
  { label: "New Lead", href: "/new", icon: Target },
  { label: "New Contact", href: "/contacts/new", icon: UserPlus },
  { label: "New Job", href: "/calendar/new", icon: CalendarPlus },
] as const;

export function NewDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md bg-eav-orange px-4 py-2 font-body text-sm font-semibold text-eav-white transition-all hover:brightness-95 active:scale-[0.98]"
      >
        <PlusCircle className="h-4 w-4" />
        Create
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-eav-border bg-eav-white shadow-lg">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 font-body text-sm text-eav-black transition-colors hover:bg-eav-surface"
            >
              <item.icon className="h-4 w-4 text-eav-muted" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
