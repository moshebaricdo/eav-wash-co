"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads, activities } from "@/lib/db/schema";
import type { LeadStatus } from "@/lib/db/schema";

export async function updateLeadStatus(leadId: string, newStatus: LeadStatus) {
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);

  if (!lead) return;

  const oldStatus = lead.status;

  await db
    .update(leads)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(leads.id, leadId));

  await db.insert(activities).values({
    leadId,
    contactId: lead.contactId,
    type: "status_change",
    content: `Status changed from ${oldStatus} to ${newStatus}`,
    metadata: { oldStatus, newStatus },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
}

export async function updateLeadDetails(
  leadId: string,
  data: {
    notes?: string;
    estimatedValue?: string;
    address?: string;
  },
) {
  await db
    .update(leads)
    .set({
      notes: data.notes,
      estimatedValue: data.estimatedValue || null,
      address: data.address,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId));

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
}

export async function addLeadNote(
  leadId: string,
  contactId: string,
  content: string,
) {
  if (!content.trim()) return;

  await db.insert(activities).values({
    leadId,
    contactId,
    type: "note",
    content: content.trim(),
  });

  revalidatePath(`/leads/${leadId}`);
}

export async function deleteLead(leadId: string) {
  await db.delete(activities).where(eq(activities.leadId, leadId));
  await db.delete(leads).where(eq(leads.id, leadId));

  revalidatePath("/leads");
  revalidatePath("/");
}
