"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createContact } from "./actions";
import { AddressAutocompleteInput } from "@/components/address-autocomplete-input";

const SOURCES = [
  { id: "manual", label: "Manual Entry" },
  { id: "phone", label: "Phone Call" },
  { id: "referral", label: "Referral" },
];

const SURFACES = [
  { id: "driveway", label: "Driveway" },
  { id: "patio-deck", label: "Patio / Deck" },
  { id: "walkways", label: "Walkways" },
  { id: "other", label: "Other" },
];

const TIMELINES = [
  { id: "asap", label: "ASAP" },
  { id: "1-2-weeks", label: "1–2 Weeks" },
  { id: "flexible", label: "Flexible" },
];

type PropertyOption = {
  id: string;
  name: string | null;
  address: string;
};

export function NewContactForm({ properties }: { properties: PropertyOption[] }) {
  const [state, formAction, pending] = useActionState(createContact, {
    error: "",
  });
  const [addLead, setAddLead] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [propertyMode, setPropertyMode] = useState<"existing" | "new">(
    properties.length > 0 ? "existing" : "new",
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState("");

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
            <AddressAutocompleteInput
              name="address"
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

      {/* Optional lead toggle */}
      <div className="rounded-lg border border-eav-border bg-eav-white p-5">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="addLead"
            checked={addLead}
            onChange={(e) => setAddLead(e.target.checked)}
            className="h-4 w-4 rounded border-eav-border text-eav-orange accent-eav-orange"
          />
          <span className="font-body text-sm font-medium text-eav-black">
            Also create a lead for this contact
          </span>
        </label>
      </div>

      {addLead && (
        <div className="rounded-lg border border-eav-border bg-eav-white p-5">
          <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-eav-black">
            Lead Details
          </h2>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block font-body text-xs font-medium text-eav-muted">
                  Property <span className="text-eav-orange">*</span>
                </label>
                {properties.length > 0 && (
                  <div className="flex rounded-md border border-eav-border text-xs font-body font-medium">
                    <button
                      type="button"
                      onClick={() => setPropertyMode("existing")}
                      className={`rounded-l-md px-3 py-1.5 transition-colors ${
                        propertyMode === "existing"
                          ? "bg-eav-orange text-eav-white"
                          : "text-eav-muted hover:text-eav-black"
                      }`}
                    >
                      Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPropertyMode("new");
                        setSelectedPropertyId("");
                      }}
                      className={`rounded-r-md px-3 py-1.5 transition-colors ${
                        propertyMode === "new"
                          ? "bg-eav-orange text-eav-white"
                          : "text-eav-muted hover:text-eav-black"
                      }`}
                    >
                      New
                    </button>
                  </div>
                )}
              </div>

              {propertyMode === "existing" && properties.length > 0 ? (
                <>
                  <input
                    type="hidden"
                    name="existingPropertyId"
                    value={selectedPropertyId}
                  />
                  <select
                    required
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="w-full cursor-pointer rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange"
                  >
                    <option value="">Select a property...</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name ? `${p.name} - ${p.address}` : p.address}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <AddressAutocompleteInput
                  name="propertyAddress"
                  required
                  placeholder="123 Main St, Atlanta, GA"
                  className="w-full rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange"
                />
              )}
            </div>

            <div>
              <label className="mb-2 block font-body text-xs font-medium text-eav-muted">
                Services Requested
              </label>
              <div className="flex flex-wrap gap-2">
                {SURFACES.map((s) => (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md border-2 border-eav-border px-3 py-2 transition-colors has-[:checked]:border-eav-orange has-[:checked]:bg-eav-orange/5"
                  >
                    <input
                      type="checkbox"
                      name="surfaces"
                      value={s.id}
                      onChange={(e) => {
                        if (s.id === "other") setShowOther(e.target.checked);
                      }}
                      className="h-3.5 w-3.5 accent-eav-orange"
                    />
                    <span className="font-body text-sm text-eav-black">
                      {s.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {showOther && (
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-xs font-medium text-eav-muted">
                  Other Details
                </label>
                <input
                  name="otherDetails"
                  type="text"
                  placeholder="What else needs cleaning?"
                  className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block font-body text-xs font-medium text-eav-muted">
                Timeline
              </label>
              <div className="flex flex-wrap gap-2">
                {TIMELINES.map((t) => (
                  <label
                    key={t.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md border-2 border-eav-border px-3 py-2 transition-colors has-[:checked]:border-eav-orange has-[:checked]:bg-eav-orange/5"
                  >
                    <input
                      type="radio"
                      name="timeline"
                      value={t.id}
                      className="h-3.5 w-3.5 accent-eav-orange"
                    />
                    <span className="font-body text-sm text-eav-black">
                      {t.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-xs font-medium text-eav-muted">
                  Estimated Value ($)
                </label>
                <input
                  name="estimatedValue"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-medium text-eav-muted">
                Lead Notes
              </label>
              <textarea
                name="leadNotes"
                rows={2}
                placeholder="Notes specific to this lead..."
                className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange resize-none"
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-md bg-eav-orange font-body text-sm font-semibold text-eav-white transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {pending
          ? "Creating..."
          : addLead
            ? "Create Contact & Lead"
            : "Create Contact"}
      </button>
    </form>
  );
}
