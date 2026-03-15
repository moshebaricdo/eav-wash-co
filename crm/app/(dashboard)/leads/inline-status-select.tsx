"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "./actions";
import { LEAD_STATUS_LABELS, LEAD_STATUSES } from "@/lib/db/schema";
import type { LeadStatus } from "@/lib/db/schema";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
  quoted: "bg-purple-100 text-purple-800 border-purple-200",
  scheduled: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  lost: "bg-gray-100 text-gray-500 border-gray-200",
};

export function InlineStatusSelect({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: LeadStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={(e) => {
        startTransition(() => {
          updateLeadStatus(leadId, e.target.value as LeadStatus);
        });
      }}
      className={`appearance-none rounded-full border px-2.5 py-0.5 pr-6 font-body text-xs font-medium outline-none cursor-pointer disabled:opacity-50 ${
        STATUS_COLORS[currentStatus] ?? STATUS_COLORS.new
      }`}
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>
          {LEAD_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
