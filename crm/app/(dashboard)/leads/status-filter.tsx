"use client";

import Link from "next/link";
import { LEAD_STATUS_LABELS, LEAD_STATUSES } from "@/lib/db/schema";
import type { LeadStatus } from "@/lib/db/schema";

export function StatusFilter({ current }: { current?: LeadStatus }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/leads"
        className={`rounded-full px-3 py-1 font-body text-xs font-medium transition-colors ${
          !current
            ? "bg-eav-black text-eav-white"
            : "bg-eav-white text-eav-muted border border-eav-border hover:bg-eav-surface"
        }`}
      >
        All
      </Link>
      {LEAD_STATUSES.map((status) => (
        <Link
          key={status}
          href={`/leads?status=${status}`}
          className={`rounded-full px-3 py-1 font-body text-xs font-medium transition-colors ${
            current === status
              ? "bg-eav-black text-eav-white"
              : "bg-eav-white text-eav-muted border border-eav-border hover:bg-eav-surface"
          }`}
        >
          {LEAD_STATUS_LABELS[status]}
        </Link>
      ))}
    </div>
  );
}
