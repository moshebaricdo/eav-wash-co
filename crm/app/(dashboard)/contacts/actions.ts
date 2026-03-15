"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contacts, activities } from "@/lib/db/schema";

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
  await db
    .update(contacts)
    .set({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      notes: data.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(contacts.id, contactId));

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
