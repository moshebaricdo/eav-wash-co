"use client";

import { useTransition } from "react";
import { toggleContactType } from "../actions";

export function PromoteButton({
  contactId,
  currentType,
}: {
  contactId: string;
  currentType: string;
}) {
  const [isPending, startTransition] = useTransition();

  const isClient = currentType === "client";

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(() => toggleContactType(contactId));
      }}
      className={`rounded-md border px-4 py-2 font-body text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer ${
        isClient
          ? "border-eav-border bg-eav-white text-eav-muted hover:bg-eav-surface"
          : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      }`}
    >
      {isPending
        ? "Updating..."
        : isClient
          ? "Demote to Lead"
          : "Promote to Client"}
    </button>
  );
}
