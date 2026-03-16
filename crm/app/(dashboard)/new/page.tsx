import { db } from "@/lib/db";
import { contacts, properties, propertyContacts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { NewLeadForm } from "./new-lead-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "New Lead" };

export default async function NewLeadPage() {
  const [allContacts, allProperties, allPropertyLinks] = await Promise.all([
    db
      .select({
        id: contacts.id,
        name: contacts.name,
        email: contacts.email,
        phone: contacts.phone,
        address: contacts.address,
      })
      .from(contacts)
      .orderBy(desc(contacts.updatedAt)),
    db
      .select({
        id: properties.id,
        name: properties.name,
        address: properties.address,
      })
      .from(properties)
      .orderBy(desc(properties.updatedAt)),
    db
      .select({
        contactId: propertyContacts.contactId,
        propertyId: propertyContacts.propertyId,
      })
      .from(propertyContacts),
  ]);

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
      <NewLeadForm
        contacts={allContacts}
        properties={allProperties}
        propertyLinks={allPropertyLinks}
      />
    </div>
  );
}
