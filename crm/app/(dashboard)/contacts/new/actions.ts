"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";

export async function createContact(
  _prev: { error: string },
  formData: FormData,
): Promise<{ error: string }> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim();
  const source = (formData.get("source") as string) || "manual";

  if (!name) {
    return { error: "Name is required" };
  }

  const normalizedPhone = phone?.replace(/\D/g, "") || null;
  const normalizedEmail = email || null;

  const conditions = [];
  if (normalizedEmail) conditions.push(eq(contacts.email, normalizedEmail));
  if (normalizedPhone) conditions.push(eq(contacts.phone, normalizedPhone));

  let contactId: string;

  if (conditions.length > 0) {
    const existing = await db
      .select()
      .from(contacts)
      .where(or(...conditions))
      .limit(1);

    if (existing.length > 0) {
      contactId = existing[0].id;
      await db
        .update(contacts)
        .set({
          name,
          phone: normalizedPhone || existing[0].phone,
          address: address || existing[0].address,
          notes: notes || existing[0].notes,
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
          notes: notes || null,
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
        notes: notes || null,
      })
      .returning({ id: contacts.id });
    contactId = newContact.id;
  }

  revalidatePath("/contacts");
  revalidatePath("/");
  redirect(`/contacts/${contactId}`);
}
