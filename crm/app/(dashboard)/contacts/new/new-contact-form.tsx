"use client";

import { useActionState } from "react";
import { createContact } from "./actions";

const SOURCES = [
  { id: "manual", label: "Manual Entry" },
  { id: "phone", label: "Phone Call" },
  { id: "referral", label: "Referral" },
];

export function NewContactForm() {
  const [state, formAction, pending] = useActionState(createContact, {
    error: "",
  });

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="font-body text-sm text-red-600">{state.error}</p>
        </div>
      )}

      <div className="rounded-lg border border-eav-border bg-eav-white p-5">
        <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-eav-black">
          Contact Information
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-eav-muted">
              Name <span className="text-eav-orange">*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="John Smith"
              className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-eav-muted">
              Phone
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="(470) 555-1234"
              className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange"
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="font-body text-xs font-medium text-eav-muted">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="john@email.com"
              className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange"
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="font-body text-xs font-medium text-eav-muted">
              Address
            </label>
            <input
              name="address"
              type="text"
              placeholder="123 Main St, Atlanta, GA"
              className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-eav-muted">
              Source
            </label>
            <select
              name="source"
              className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange cursor-pointer"
            >
              {SOURCES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="font-body text-xs font-medium text-eav-muted">
              Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="General notes about this contact..."
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
        {pending ? "Creating..." : "Create Contact"}
      </button>
    </form>
  );
}
