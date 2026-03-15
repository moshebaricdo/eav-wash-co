"use client";

import { useTransition } from "react";
import { updateJobStatus } from "../actions";
import type { JobStatus } from "@/lib/db/schema";
import { Play, CheckCircle, XCircle } from "lucide-react";

export function JobStatusActions({
  jobId,
  currentStatus,
}: {
  jobId: string;
  currentStatus: JobStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function handleStatus(status: JobStatus) {
    startTransition(() => updateJobStatus(jobId, status));
  }

  if (currentStatus === "completed" || currentStatus === "cancelled") {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleStatus("scheduled")}
        className="rounded-md border border-eav-border bg-eav-white px-4 py-2 font-body text-sm font-semibold text-eav-muted transition-all hover:bg-eav-surface active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        Reschedule
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      {currentStatus === "scheduled" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatus("in_progress")}
          className="inline-flex items-center gap-1.5 rounded-md bg-yellow-500 px-4 py-2 font-body text-sm font-semibold text-white transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <Play className="h-3.5 w-3.5" />
          Start
        </button>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleStatus("completed")}
        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 font-body text-sm font-semibold text-white transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        Complete
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleStatus("cancelled")}
        className="inline-flex items-center gap-1.5 rounded-md border border-eav-border bg-eav-white px-4 py-2 font-body text-sm font-semibold text-eav-muted transition-all hover:bg-eav-surface active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        <XCircle className="h-3.5 w-3.5" />
        Cancel
      </button>
    </div>
  );
}
