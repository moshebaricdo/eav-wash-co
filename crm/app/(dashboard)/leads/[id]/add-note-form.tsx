"use client";

import { useRef } from "react";
import { useActionState } from "react";
import { addLeadNote } from "../actions";

export function AddNoteForm({
  leadId,
  contactId,
}: {
  leadId: string;
  contactId: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  async function action(_prev: unknown, formData: FormData) {
    const content = formData.get("content") as string;
    await addLeadNote(leadId, contactId, content);
    formRef.current?.reset();
    return { added: true };
  }

  const [, formAction, pending] = useActionState(action, { added: false });

  return (
    <form ref={formRef} action={formAction} className="flex gap-2">
      <input
        name="content"
        type="text"
        placeholder="Add a note..."
        required
        className="flex-1 rounded-md border-2 border-eav-border bg-eav-surface px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-eav-black px-4 py-2 font-body text-sm font-semibold text-eav-white transition-all hover:bg-eav-gray active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {pending ? "..." : "Add"}
      </button>
    </form>
  );
}
