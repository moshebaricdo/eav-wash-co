"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function MonthNav({ year, month }: { year: number; month: number }) {
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  const label = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const now = new Date();
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth();

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/calendar?year=${prevYear}&month=${prevMonth + 1}`}
        className="rounded-md border border-eav-border bg-eav-white p-1.5 transition-colors hover:bg-eav-surface"
      >
        <ChevronLeft className="h-4 w-4 text-eav-muted" />
      </Link>

      <span className="min-w-[160px] text-center font-heading text-base font-bold uppercase tracking-wide text-eav-black">
        {label}
      </span>

      <Link
        href={`/calendar?year=${nextYear}&month=${nextMonth + 1}`}
        className="rounded-md border border-eav-border bg-eav-white p-1.5 transition-colors hover:bg-eav-surface"
      >
        <ChevronRight className="h-4 w-4 text-eav-muted" />
      </Link>

      {!isCurrentMonth && (
        <Link
          href="/calendar"
          className="ml-2 rounded-md border border-eav-border bg-eav-white px-3 py-1 font-body text-xs font-medium text-eav-muted transition-colors hover:bg-eav-surface hover:text-eav-black"
        >
          Today
        </Link>
      )}
    </div>
  );
}
