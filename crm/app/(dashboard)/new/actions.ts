"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { contacts, leads, activities, properties, propertyContacts } from "@/lib/db/schema";

export async function createLeadManually(
  _prev: { error: string },
  formData: FormData,
): Promise<{ error: string }> {
  const existingContactId = (formData.get("existingContactId") as string)?.trim();
  const existingPropertyId = (formData.get("existingPropertyId") as string)?.trim();
  const propertyAddressInput = (formData.get("propertyAddress") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const source = (formData.get("source") as string) || "manual";
  const surfacesRaw = formData.getAll("surfaces") as string[];
  const otherDetails = (formData.get("otherDetails") as string)?.trim();
  const timeline = (formData.get("timeline") as string)?.trim();
  const leadNotes = (formData.get("leadNotes") as string)?.trim();
  const estimatedValue = (formData.get("estimatedValue") as string)?.trim();

  let contactId: string;
  let contactAddress: string | null = null;

  if (existingContactId) {
    const existing = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, existingContactId))
      .limit(1);

    if (existing.length === 0) {
      return { error: "Selected contact not found" };
    }

    contactId = existing[0].id;
    contactAddress = existing[0].address;
  } else {
    if (!name) {
      return { error: "Name is required" };
    }

    const normalizedPhone = phone?.replace(/\D/g, "") || null;
    const normalizedEmail = email || null;

    const conditions = [];
    if (normalizedEmail) conditions.push(eq(contacts.email, normalizedEmail));
    if (normalizedPhone) conditions.push(eq(contacts.phone, normalizedPhone));

    if (conditions.length > 0) {
      const existing = await db
        .select()
        .from(contacts)
        .where(or(...conditions))
        .limit(1);

      if (existing.length > 0) {
        contactId = existing[0].id;
        contactAddress = address || existing[0].address;
        await db
          .update(contacts)
          .set({
            name,
            phone: normalizedPhone || existing[0].phone,
            address: address || existing[0].address,
            updatedAt: new Date(),
          })
          .where(eq(contacts.id, contactId));
      } else {
        const [newContact] = await db
          .insert(contacts)
          .values({
            name,
            email: normalizedEmail,
            phone: normalizedPhone,
            address: address || null,
            type: "lead",
            source: source as "estimate_form" | "manual" | "phone" | "referral",
          })
          .returning({ id: contacts.id });
        contactId = newContact.id;
      }
    } else {
      const [newContact] = await db
        .insert(contacts)
        .values({
          name,
          email: normalizedEmail,
          phone: normalizedPhone,
          address: address || null,
          type: "lead",
          source: source as "estimate_form" | "manual" | "phone" | "referral",
        })
        .returning({ id: contacts.id });
      contactId = newContact.id;
    }

    contactAddress = address || null;
  }

  let propertyAddress = propertyAddressInput || contactAddress || null;
  let propertyId: string | null = null;

  if (existingPropertyId) {
    const [propertyLink] = await db
      .select({ id: propertyContacts.id })
      .from(propertyContacts)
      .where(
        and(
          eq(propertyContacts.propertyId, existingPropertyId),
          eq(propertyContacts.contactId, contactId),
        ),
      )
      .limit(1);

    if (!propertyLink) {
      return { error: "Selected property is not associated with this contact" };
    }

    const [selectedProperty] = await db
      .select({ id: properties.id, address: properties.address })
      .from(properties)
      .where(eq(properties.id, existingPropertyId))
      .limit(1);

    if (!selectedProperty) {
      return { error: "Selected property not found" };
    }

    propertyId = selectedProperty.id;
    propertyAddress = selectedProperty.address;
  } else if (propertyAddress) {
    const [existingProperty] = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.address, propertyAddress))
      .limit(1);

    if (existingProperty) {
      propertyId = existingProperty.id;
    } else {
      const [createdProperty] = await db
        .insert(properties)
        .values({
          address: propertyAddress,
        })
        .returning({ id: properties.id });
      propertyId = createdProperty.id;
    }

    const [existingLink] = await db
      .select({ id: propertyContacts.id })
      .from(propertyContacts)
      .where(
        and(
          eq(propertyContacts.propertyId, propertyId),
          eq(propertyContacts.contactId, contactId),
        ),
      )
      .limit(1);

    if (!existingLink) {
      await db.insert(propertyContacts).values({
        propertyId,
        contactId,
      });
    }
  }

  if (!propertyId) {
    return { error: "Property is required for a lead" };
  }

  const [lead] = await db
    .insert(leads)
    .values({
      contactId,
      propertyId,
      status: "new",
      surfaces: surfacesRaw.length > 0 ? surfacesRaw : null,
      otherDetails: otherDetails || null,
      timeline: timeline || null,
      address: propertyAddress,
      notes: leadNotes || null,
      estimatedValue: estimatedValue || null,
      source: source as "estimate_form" | "manual" | "phone" | "referral",
    })
    .returning({ id: leads.id });

  await db.insert(activities).values({
    leadId: lead.id,
    contactId,
    type: "note",
    content: `Lead created manually${surfacesRaw.length > 0 ? `: ${surfacesRaw.join(", ")}` : ""}`,
  });

  revalidatePath("/leads");
  revalidatePath("/contacts");
  revalidatePath("/");
  redirect(`/leads/${lead.id}`);
}
