"use client";

import { useActionState, useState } from "react";
import { linkPropertyToContact } from "../actions";

type PropertyOption = {
  id: string;
  name: string | null;
  address: string;
};

export function ContactPropertyForm({
  contactId,
  properties,
}: {
  contactId: string;
  properties: PropertyOption[];
}) {
  const [mode, setMode] = useState<"existing" | "new">(
    properties.length > 0 ? "existing" : "new",
  );
  const [state, formAction, pending] = useActionState(
    async (_prev: { saved: boolean }, formData: FormData) => {
      await linkPropertyToContact(contactId, {
        existingPropertyId: formData.get("existingPropertyId") as string,
        propertyAddress: formData.get("propertyAddress") as string,
        propertyName: formData.get("propertyName") as string,
        role:
          (formData.get("role") as
            | "owner"
            | "tenant"
            | "manager"
            | "onsite_contact"
            | "other") || "other",
      });
      return { saved: true };
    },
    { saved: false },
  );

  return (
    <form
      action={formAction}
      className="rounded-lg border border-eav-border bg-eav-white p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-eav-black">
          Link Property
        </h2>
        {properties.length > 0 && (
          <div className="flex rounded-md border border-eav-border text-xs font-body font-medium">
            <button
              type="button"
              onClick={() => setMode("existing")}
              className={`rounded-l-md px-3 py-1.5 transition-colors ${
                mode === "existing"
                  ? "bg-eav-orange text-eav-white"
                  : "text-eav-muted hover:text-eav-black"
              }`}
            >
              Existing
            </button>
            <button
              type="button"
              onClick={() => setMode("new")}
              className={`rounded-r-md px-3 py-1.5 transition-colors ${
                mode === "new"
                  ? "bg-eav-orange text-eav-white"
                  : "text-eav-muted hover:text-eav-black"
              }`}
            >
              New
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {mode === "existing" && properties.length > 0 ? (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="font-body text-xs font-medium text-eav-muted">
              Property
            </label>
            <select
              name="existingPropertyId"
              required
              className="cursor-pointer rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange"
            >
              <option value="">Select a property...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name ? `${p.name} - ${p.address}` : p.address}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-body text-xs font-medium text-eav-muted">
                Property Address
              </label>
              <input
                name="propertyAddress"
                type="text"
                required
                placeholder="123 Main St, Atlanta, GA"
                className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-body text-xs font-medium text-eav-muted">
                Property Nickname (optional)
              </label>
              <input
                name="propertyName"
                type="text"
                placeholder="e.g. Oakridge Rental"
                className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange"
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs font-medium text-eav-muted">
            Relationship
          </label>
          <select
            name="role"
            defaultValue="other"
            className="cursor-pointer rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange"
          >
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
            <option value="tenant">Tenant</option>
            <option value="onsite_contact">On-site Contact</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-eav-black px-4 py-2 font-body text-sm font-semibold text-eav-white transition-all hover:bg-eav-gray active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Linking..." : "Link Property"}
        </button>
        {state.saved && (
          <span className="font-body text-xs text-emerald-600">Linked</span>
        )}
      </div>
    </form>
  );
}
