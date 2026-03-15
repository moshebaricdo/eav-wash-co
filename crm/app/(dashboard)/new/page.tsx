import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { NewLeadForm } from "./new-lead-form";

export const metadata = { title: "New Lead" };

export default async function NewLeadPage() {
  const allContacts = await db
    .select({
      id: contacts.id,
      name: contacts.name,
      email: contacts.email,
      phone: contacts.phone,
      address: contacts.address,
    })
    .from(contacts)
    .orderBy(desc(contacts.updatedAt));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-eav-black">
          New Lead
        </h1>
        <p className="mt-1 font-body text-sm text-eav-muted">
          Create a new lead with contact information.
        </p>
      </div>
      <NewLeadForm contacts={allContacts} />
    </div>
  );
}
