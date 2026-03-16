import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { contacts, leads, properties, propertyContacts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ScheduleJobForm } from "./schedule-job-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Schedule Job" };

type Props = {
  searchParams: Promise<{ contactId?: string; leadId?: string; date?: string }>;
};

export default async function ScheduleJobPage({ searchParams }: Props) {
  const params = await searchParams;

  let prefilledContact: { id: string; name: string; address: string | null } | null = null;
  let prefilledLead: {
    id: string;
    surfaces: string[] | null;
    address: string | null;
    contactId: string;
    propertyId: string | null;
  } | null = null;

  if (params.leadId) {
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, params.leadId))
      .limit(1);
    if (lead) {
      prefilledLead = {
        id: lead.id,
        surfaces: lead.surfaces as string[] | null,
        address: lead.address,
        contactId: lead.contactId,
        propertyId: lead.propertyId,
      };
      const [contact] = await db
        .select()
        .from(contacts)
        .where(eq(contacts.id, lead.contactId))
        .limit(1);
      if (contact) {
        prefilledContact = {
          id: contact.id,
          name: contact.name,
          address: contact.address,
        };
      }
    }
  } else if (params.contactId) {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, params.contactId))
      .limit(1);
    if (contact) {
      prefilledContact = {
        id: contact.id,
        name: contact.name,
        address: contact.address,
      };
    }
  }

  const [allContacts, allProperties, allPropertyLinks, allLeads] = await Promise.all([
    db
      .select({ id: contacts.id, name: contacts.name })
      .from(contacts)
      .orderBy(desc(contacts.createdAt)),
    db
      .select({ id: properties.id, name: properties.name, address: properties.address })
      .from(properties)
      .orderBy(desc(properties.updatedAt)),
    db
      .select({
        contactId: propertyContacts.contactId,
        propertyId: propertyContacts.propertyId,
      })
      .from(propertyContacts),
    db
      .select({
        id: leads.id,
        contactId: leads.contactId,
        propertyId: leads.propertyId,
        status: leads.status,
      })
      .from(leads)
      .orderBy(desc(leads.updatedAt)),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/calendar"
          className="mb-3 inline-flex items-center gap-1.5 font-body text-xs font-medium text-eav-muted transition-colors hover:text-eav-black"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Calendar
        </Link>
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-eav-black">
          Schedule Job
        </h1>
        <p className="mt-1 font-body text-sm text-eav-muted">
          {prefilledContact
            ? `Scheduling for ${prefilledContact.name}`
            : "Pick a contact and set a date."}
        </p>
      </div>

      <ScheduleJobForm
        contacts={allContacts}
        properties={allProperties}
        propertyLinks={allPropertyLinks}
        leads={allLeads}
        prefilledContactId={prefilledContact?.id ?? null}
        prefilledLeadId={prefilledLead?.id ?? null}
        prefilledPropertyId={prefilledLead?.propertyId ?? null}
        prefilledTitle={
          prefilledLead?.surfaces
            ? prefilledLead.surfaces.join(", ") + " cleaning"
            : ""
        }
        prefilledAddress={
          prefilledLead?.address ?? prefilledContact?.address ?? ""
        }
        prefilledDate={params.date ?? null}
      />
    </div>
  );
}
