"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useActionState } from "react";
import { Search } from "lucide-react";
import { createLeadManually } from "./actions";
import { AddressAutocompleteInput } from "@/components/address-autocomplete-input";

type ContactOption = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

type PropertyOption = {
  id: string;
  name: string | null;
  address: string;
};

const SURFACES = [
  { id: "driveway", label: "Driveway" },
  { id: "patio-deck", label: "Patio / Deck" },
  { id: "walkways", label: "Walkways" },
  { id: "other", label: "Other" },
];

const SOURCES = [
  { id: "manual", label: "Manual Entry" },
  { id: "phone", label: "Phone Call" },
  { id: "referral", label: "Referral" },
];

const TIMELINES = [
  { id: "asap", label: "ASAP" },
  { id: "1-2-weeks", label: "1–2 Weeks" },
  { id: "flexible", label: "Flexible" },
];

export function NewLeadForm({
  contacts,
  properties,
  propertyLinks,
}: {
  contacts: ContactOption[];
  properties: PropertyOption[];
  propertyLinks: { contactId: string; propertyId: string }[];
}) {
  const [state, formAction, pending] = useActionState(createLeadManually, {
    error: "",
  });
  const [showOther, setShowOther] = useState(false);
  const [mode, setMode] = useState<"new" | "existing">(
    contacts.length > 0 ? "existing" : "new",
  );
  const [selectedContact, setSelectedContact] = useState<ContactOption | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [propertyMode, setPropertyMode] = useState<"existing" | "new">(
    "new",
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  const filtered =
    search.length > 0
      ? contacts.filter((c) => {
          const q = search.toLowerCase();
          return (
            c.name.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.phone?.includes(q)
          );
        })
      : contacts;

  useEffect(() => {
    if (!pickerOpen) return;
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [pickerOpen]);

  const selectedContactId = mode === "existing" ? selectedContact?.id ?? "" : "";
  const linkedPropertyIds = useMemo(
    () =>
      new Set(
        propertyLinks
          .filter((link) => link.contactId === selectedContactId)
          .map((link) => link.propertyId),
      ),
    [propertyLinks, selectedContactId],
  );
  const filteredProperties = useMemo(
    () => properties.filter((property) => linkedPropertyIds.has(property.id)),
    [linkedPropertyIds, properties],
  );
  const hasLinkedProperties = filteredProperties.length > 0;
  const canChooseProperty = mode === "new" || selectedContact !== null;

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="font-body text-sm text-red-600">{state.error}</p>
        </div>
      )}

      {/* Contact section */}
      <div className="rounded-lg border border-eav-border bg-eav-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-eav-black">
            Contact
          </h2>
          {contacts.length > 0 && (
            <div className="flex rounded-md border border-eav-border text-xs font-body font-medium">
              <button
                type="button"
                onClick={() => {
                  setMode("existing");
                  setSelectedPropertyId("");
                  setPropertyMode("new");
                }}
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
                onClick={() => {
                  setMode("new");
                  setSelectedContact(null);
                  setSelectedPropertyId("");
                  setPropertyMode("new");
                }}
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

        {mode === "existing" ? (
          <>
            <input
              type="hidden"
              name="existingContactId"
              value={selectedContact?.id ?? ""}
            />

            {selectedContact ? (
              <div className="flex items-center justify-between rounded-md border-2 border-eav-orange/30 bg-eav-orange/5 px-4 py-3">
                <div>
                  <p className="font-body text-sm font-medium text-eav-black">
                    {selectedContact.name}
                  </p>
                  <p className="font-body text-xs text-eav-muted">
                    {[selectedContact.email, selectedContact.phone]
                      .filter(Boolean)
                      .join(" · ") || "No email or phone"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedContact(null);
                    setSearch("");
                    setSelectedPropertyId("");
                    setPropertyMode("new");
                  }}
                  className="font-body text-xs font-medium text-eav-orange hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <div ref={pickerRef} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-eav-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPickerOpen(true);
                    }}
                    onFocus={() => setPickerOpen(true)}
                    placeholder="Search by name, email, or phone..."
                    className="w-full rounded-md border-2 border-eav-border bg-eav-white py-2 pl-9 pr-3.5 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange"
                  />
                </div>
                {pickerOpen && (
                  <div className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-eav-border bg-eav-white shadow-lg">
                    {filtered.length === 0 ? (
                      <p className="px-4 py-3 font-body text-sm text-eav-muted">
                        No contacts found.
                      </p>
                    ) : (
                      filtered.slice(0, 20).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            const hasPropertiesForContact = propertyLinks.some(
                              (link) => link.contactId === c.id,
                            );
                            setSelectedContact(c);
                            setPickerOpen(false);
                            setSearch("");
                            setSelectedPropertyId("");
                            setPropertyMode(
                              hasPropertiesForContact ? "existing" : "new",
                            );
                          }}
                          className="flex w-full flex-col px-4 py-2.5 text-left transition-colors hover:bg-eav-surface"
                        >
                          <span className="font-body text-sm font-medium text-eav-black">
                            {c.name}
                          </span>
                          <span className="font-body text-xs text-eav-muted">
                            {[c.email, c.phone].filter(Boolean).join(" · ") ||
                              "No email or phone"}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
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
                className="cursor-pointer rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange"
              >
                {SOURCES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Lead details */}
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
              {canChooseProperty && (
                <div className="flex rounded-md border border-eav-border text-xs font-body font-medium">
                  <button
                    type="button"
                    disabled={!hasLinkedProperties}
                    onClick={() => {
                      if (hasLinkedProperties) {
                        setPropertyMode("existing");
                      }
                    }}
                    className={`rounded-l-md px-3 py-1.5 transition-colors ${
                      propertyMode === "existing"
                        ? "bg-eav-orange text-eav-white"
                        : "text-eav-muted hover:text-eav-black"
                    } ${!hasLinkedProperties ? "cursor-not-allowed opacity-50 hover:text-eav-muted" : ""}`}
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

            {!canChooseProperty ? (
              <>
                <input type="hidden" name="existingPropertyId" value="" />
                <input
                  name="propertyAddress"
                  type="text"
                  value=""
                  disabled
                  readOnly
                  placeholder="Select an existing contact first..."
                  className="w-full rounded-md border-2 border-eav-border bg-eav-surface px-3.5 py-2 font-body text-sm text-eav-muted outline-none cursor-not-allowed"
                />
              </>
            ) : propertyMode === "existing" && hasLinkedProperties ? (
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
                  {filteredProperties.map((p) => (
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
            {canChooseProperty && !hasLinkedProperties && (
              <p className="mt-1 font-body text-xs text-eav-muted">
                No saved properties for this contact yet. Add a new address to continue.
              </p>
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
              Notes
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

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full cursor-pointer rounded-md bg-eav-orange font-body text-sm font-semibold text-eav-white transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create Lead"}
      </button>
    </form>
  );
}
