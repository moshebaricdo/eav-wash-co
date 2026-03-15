"use client";

import { useActionState } from "react";
import { createJob } from "../actions";

export function ScheduleJobForm({
  contacts,
  prefilledContactId,
  prefilledLeadId,
  prefilledTitle,
  prefilledAddress,
  prefilledDate,
}: {
  contacts: { id: string; name: string }[];
  prefilledContactId: string | null;
  prefilledLeadId: string | null;
  prefilledTitle: string;
  prefilledAddress: string;
  prefilledDate: string | null;
}) {
  const [state, formAction, pending] = useActionState(createJob, {
    error: "",
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = prefilledDate ?? tomorrow.toISOString().split("T")[0];

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="font-body text-sm text-red-600">{state.error}</p>
        </div>
      )}

      {prefilledLeadId && (
        <input type="hidden" name="leadId" value={prefilledLeadId} />
      )}

      <div className="rounded-lg border border-eav-border bg-eav-white p-5">
        <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-eav-black">
          Job Details
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="font-body text-xs font-medium text-eav-muted">
              Contact <span className="text-eav-orange">*</span>
            </label>
            <select
              name="contactId"
              required
              defaultValue={prefilledContactId ?? ""}
              className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange cursor-pointer"
            >
              <option value="">Select a contact...</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="font-body text-xs font-medium text-eav-muted">
              Title <span className="text-eav-orange">*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              defaultValue={prefilledTitle}
              placeholder="e.g. Driveway + Patio cleaning"
              className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-eav-muted">
              Date <span className="text-eav-orange">*</span>
            </label>
            <input
              name="scheduledDate"
              type="date"
              required
              defaultValue={defaultDate}
              className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-eav-muted">
              Time
            </label>
            <input
              name="scheduledTime"
              type="time"
              defaultValue="09:00"
              className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-eav-muted">
              Duration (minutes)
            </label>
            <input
              name="estimatedDuration"
              type="number"
              min="0"
              step="15"
              placeholder="60"
              className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-eav-muted">
              Job Site Address
            </label>
            <input
              name="address"
              type="text"
              defaultValue={prefilledAddress}
              placeholder="123 Main St, Atlanta, GA"
              className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="font-body text-xs font-medium text-eav-muted">
              Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Special instructions, access notes, etc."
              className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange resize-none"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-md bg-eav-orange font-body text-sm font-semibold text-eav-white transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {pending ? "Scheduling..." : "Schedule Job"}
      </button>
    </form>
  );
}
