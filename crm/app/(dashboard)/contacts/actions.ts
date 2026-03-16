"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contacts, activities, properties, propertyContacts } from "@/lib/db/schema";

export async function updateContact(
  contactId: string,
  data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
  },
) {
  const normalizedAddress = data.address?.trim() || null;

  await db
    .update(contacts)
    .set({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: normalizedAddress,
      notes: data.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(contacts.id, contactId));

  if (normalizedAddress) {
    const [existingProperty] = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.address, normalizedAddress))
      .limit(1);

    const propertyId = existingProperty
      ? existingProperty.id
      : (
          await db
            .insert(properties)
            .values({ address: normalizedAddress })
            .returning({ id: properties.id })
        )[0].id;

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

  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/contacts");
}

export async function linkPropertyToContact(
  contactId: string,
  data: {
    existingPropertyId?: string;
    propertyAddress?: string;
    propertyName?: string;
    role?: "owner" | "tenant" | "manager" | "onsite_contact" | "other";
  },
) {
  const role = data.role || "other";
  const existingPropertyId = data.existingPropertyId?.trim();
  const propertyAddress = data.propertyAddress?.trim();
  const propertyName = data.propertyName?.trim();

  let propertyId: string | null = null;

  if (existingPropertyId) {
    const [selected] = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.id, existingPropertyId))
      .limit(1);
    if (!selected) return;
    propertyId = selected.id;
  } else if (propertyAddress) {
    const [existing] = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.address, propertyAddress))
      .limit(1);

    if (existing) {
      propertyId = existing.id;
    } else {
      const [created] = await db
        .insert(properties)
        .values({
          address: propertyAddress,
          name: propertyName || null,
        })
        .returning({ id: properties.id });
      propertyId = created.id;
    }
  }

  if (!propertyId) return;

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
      role,
    });
  }

  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/contacts");
}

export async function toggleContactType(contactId: string) {
  const [contact] = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .limit(1);

  if (!contact) return;

  const newType = contact.type === "lead" ? "client" : "lead";

  await db
    .update(contacts)
    .set({ type: newType as "lead" | "client", updatedAt: new Date() })
    .where(eq(contacts.id, contactId));

  await db.insert(activities).values({
    contactId,
    type: "status_change",
    content: `Contact promoted from ${contact.type} to ${newType}`,
    metadata: { oldType: contact.type, newType },
  });

  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/contacts");
  revalidatePath("/");
}

export async function addContactNote(contactId: string, content: string) {
  if (!content.trim()) return;

  await db.insert(activities).values({
    contactId,
    type: "note",
    content: content.trim(),
  });

  revalidatePath(`/contacts/${contactId}`);
}
