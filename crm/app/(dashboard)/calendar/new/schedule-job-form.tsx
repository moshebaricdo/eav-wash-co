"use client";

import { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";
import { createJob } from "../actions";
import { AddressAutocompleteInput } from "@/components/address-autocomplete-input";

export function ScheduleJobForm({
  contacts,
  properties,
  propertyLinks,
  leads,
  prefilledContactId,
  prefilledLeadId,
  prefilledPropertyId,
  prefilledTitle,
  prefilledAddress,
  prefilledDate,
}: {
  contacts: { id: string; name: string }[];
  properties: { id: string; name: string | null; address: string }[];
  propertyLinks: { contactId: string; propertyId: string }[];
  leads: {
    id: string;
    contactId: string;
    propertyId: string | null;
    status: "new" | "contacted" | "quoted" | "scheduled" | "completed" | "lost";
  }[];
  prefilledContactId: string | null;
  prefilledLeadId: string | null;
  prefilledPropertyId: string | null;
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
  const [selectedContactId, setSelectedContactId] = useState(prefilledContactId ?? "");
  const [propertyMode, setPropertyMode] = useState<"existing" | "new">(
    prefilledPropertyId ? "existing" : "new",
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    prefilledPropertyId ?? "",
  );
  const [selectedLeadId, setSelectedLeadId] = useState(prefilledLeadId ?? "");
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
  const filteredLeads = useMemo(
    () => leads.filter((lead) => lead.contactId === selectedContactId),
    [leads, selectedContactId],
  );
  const selectedLead = useMemo(
    () => filteredLeads.find((lead) => lead.id === selectedLeadId) ?? null,
    [filteredLeads, selectedLeadId],
  );
  const hasSelectedContact = selectedContactId.length > 0;
  const hasLinkedProperties = filteredProperties.length > 0;

  useEffect(() => {
    if (!selectedLead?.propertyId) return;
    if (!linkedPropertyIds.has(selectedLead.propertyId)) return;
    setPropertyMode("existing");
    setSelectedPropertyId(selectedLead.propertyId);
  }, [linkedPropertyIds, selectedLead]);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="font-body text-sm text-red-600">{state.error}</p>
        </div>
      )}

      <input type="hidden" name="leadId" value={selectedLeadId} />

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
              value={selectedContactId}
              onChange={(e) => {
                const nextContactId = e.target.value;
                setSelectedContactId(nextContactId);
                setSelectedLeadId("");
                setSelectedPropertyId("");
                setPropertyMode("new");
              }}
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
              Associated Lead
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              disabled={!hasSelectedContact}
              className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange disabled:cursor-not-allowed disabled:bg-eav-surface disabled:text-eav-muted cursor-pointer"
            >
              <option value="">
                {hasSelectedContact
                  ? "No lead (schedule standalone job)"
                  : "Select a contact first..."}
              </option>
              {filteredLeads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {`Lead ${lead.id.slice(0, 8)} (${lead.status})`}
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

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <div className="mb-1 flex items-center justify-between">
              <label className="font-body text-xs font-medium text-eav-muted">
                Property <span className="text-eav-orange">*</span>
              </label>
              {hasSelectedContact && (
                <div className="flex rounded-md border border-eav-border text-xs font-body font-medium overflow-hidden">
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

            {!hasSelectedContact ? (
              <>
                <input type="hidden" name="existingPropertyId" value="" />
                <input
                  name="propertyAddress"
                  type="text"
                  value=""
                  disabled
                  readOnly
                  placeholder="Select a contact first..."
                  className="rounded-md border-2 border-eav-border bg-eav-surface px-3.5 py-2 font-body text-sm text-eav-muted outline-none cursor-not-allowed"
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
                  className="cursor-pointer rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange"
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
                defaultValue={prefilledAddress}
                placeholder="123 Main St, Atlanta, GA"
                className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange"
              />
            )}
            {hasSelectedContact && !hasLinkedProperties && (
              <p className="mt-1 font-body text-xs text-eav-muted">
                No saved properties for this contact yet. Add a new address to continue.
              </p>
            )}
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
