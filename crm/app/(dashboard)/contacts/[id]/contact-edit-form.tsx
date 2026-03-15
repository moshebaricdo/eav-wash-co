"use client";

import { useActionState } from "react";
import { updateContact } from "../actions";

export function ContactEditForm({
  contactId,
  name,
  email,
  phone,
  address,
  notes,
}: {
  contactId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}) {
  async function action(_prev: unknown, formData: FormData) {
    await updateContact(contactId, {
      name: (formData.get("name") as string) || name,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      notes: formData.get("notes") as string,
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
        Edit Contact
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs font-medium text-eav-muted">
            Name
          </label>
          <input
            name="name"
            type="text"
            defaultValue={name}
            required
            className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs font-medium text-eav-muted">
            Email
          </label>
          <input
            name="email"
            type="email"
            defaultValue={email}
            className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs font-medium text-eav-muted">
            Phone
          </label>
          <input
            name="phone"
            type="tel"
            defaultValue={phone}
            className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs font-medium text-eav-muted">
            Address
          </label>
          <input
            name="address"
            type="text"
            defaultValue={address}
            className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none focus:border-eav-orange"
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="font-body text-xs font-medium text-eav-muted">
            Notes
          </label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={notes}
            placeholder="General notes about this contact..."
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
          {pending ? "Saving..." : "Save Changes"}
        </button>
        {state.saved && (
          <span className="font-body text-xs text-emerald-600">Saved</span>
        )}
      </div>
    </form>
  );
}
