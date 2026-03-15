"use client";

import { useActionState } from "react";
import { updateLeadDetails } from "../actions";

export function LeadDetailsForm({
  leadId,
  notes,
  estimatedValue,
  address,
}: {
  leadId: string;
  notes: string;
  estimatedValue: string;
  address: string;
}) {
  async function action(_prev: unknown, formData: FormData) {
    await updateLeadDetails(leadId, {
      notes: (formData.get("notes") as string) ?? "",
      estimatedValue: (formData.get("estimatedValue") as string) ?? "",
      address: (formData.get("address") as string) ?? "",
    });
    return { saved: true };
  }

  const [state, formAction, pending] = useActionState(action, { saved: false });

  return (
    <form
      action={formAction}
      className="rounded-lg border border-eav-border bg-eav-white p-5"
    >
      <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-eav-black">
        Lead Details
      </h2>

      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="estimatedValue"
            className="font-body text-xs font-medium text-eav-muted"
          >
            Estimated Value ($)
          </label>
          <input
            id="estimatedValue"
            name="estimatedValue"
            type="number"
            step="0.01"
            min="0"
            defaultValue={estimatedValue}
            placeholder="0.00"
            className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="address"
            className="font-body text-xs font-medium text-eav-muted"
          >
            Job Site Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            defaultValue={address}
            placeholder="123 Main St, Atlanta, GA"
            className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="notes"
            className="font-body text-xs font-medium text-eav-muted"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={notes}
            placeholder="Add notes about this lead..."
            className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange resize-none"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-eav-black px-4 py-2 font-body text-sm font-semibold text-eav-white transition-all hover:bg-eav-gray active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Saving..." : "Save Details"}
        </button>
        {state.saved && (
          <span className="font-body text-xs text-emerald-600">Saved</span>
        )}
      </div>
    </form>
  );
}
