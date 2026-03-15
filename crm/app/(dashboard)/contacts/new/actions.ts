"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { contacts, leads, activities } from "@/lib/db/schema";

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
  const addLead = formData.get("addLead") === "on";

  const surfacesRaw = formData.getAll("surfaces") as string[];
  const otherDetails = (formData.get("otherDetails") as string)?.trim();
  const timeline = (formData.get("timeline") as string)?.trim();
  const leadNotes = (formData.get("leadNotes") as string)?.trim();
  const estimatedValue = (formData.get("estimatedValue") as string)?.trim();
  const jobAddress = (formData.get("jobAddress") as string)?.trim();

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
          type: addLead ? "lead" : "client",
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
        type: addLead ? "lead" : "client",
        source: source as "estimate_form" | "manual" | "phone" | "referral",
        notes: notes || null,
      })
      .returning({ id: contacts.id });
    contactId = newContact.id;
  }

  if (addLead) {
    const [lead] = await db
      .insert(leads)
      .values({
        contactId,
        status: "new",
        surfaces: surfacesRaw.length > 0 ? surfacesRaw : null,
        otherDetails: otherDetails || null,
        timeline: timeline || null,
        address: jobAddress || address || null,
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

  revalidatePath("/contacts");
  revalidatePath("/");
  redirect(`/contacts/${contactId}`);
}
