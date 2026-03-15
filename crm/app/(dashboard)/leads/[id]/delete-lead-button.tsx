"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteLead } from "../actions";

export function DeleteLeadButton({ leadId }: { leadId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        startTransition(async () => {
          await deleteLead(leadId);
          router.push("/leads");
        });
      }}
      className="rounded-md border border-red-300 bg-eav-white px-3 py-1.5 font-body text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 cursor-pointer"
    >
      {isPending ? "Deleting..." : "Delete Lead"}
    </button>
  );
}
