"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs, leads, activities, contacts, properties, propertyContacts } from "@/lib/db/schema";
import type { JobStatus } from "@/lib/db/schema";

export async function createJob(
  _prev: { error: string },
  formData: FormData,
): Promise<{ error: string }> {
  const existingPropertyId = (formData.get("existingPropertyId") as string) || null;
  const propertyAddressInput =
    (formData.get("propertyAddress") as string)?.trim() || null;
  const contactId = formData.get("contactId") as string;
  const leadId = (formData.get("leadId") as string) || null;
  const title = (formData.get("title") as string)?.trim();
  const scheduledDate = formData.get("scheduledDate") as string;
  const scheduledTime = (formData.get("scheduledTime") as string) || null;
  const estimatedDuration = formData.get("estimatedDuration") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!contactId || !title || !scheduledDate) {
    return { error: "Contact, title, and date are required" };
  }

  const [leadForJob] = leadId
    ? await db
        .select({ contactId: leads.contactId, propertyId: leads.propertyId })
        .from(leads)
        .where(eq(leads.id, leadId))
        .limit(1)
    : [null];

  if (leadId && !leadForJob) {
    return { error: "Selected lead was not found" };
  }
  if (leadForJob && leadForJob.contactId !== contactId) {
    return { error: "Selected lead does not belong to the selected contact" };
  }

  let propertyAddress = propertyAddressInput;
  let propertyId = leadForJob?.propertyId ?? null;

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
      return { error: "Selected property was not found" };
    }

    propertyId = selectedProperty.id;
    propertyAddress = selectedProperty.address;
  } else if (!propertyId && propertyAddress) {
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
        .values({ address: propertyAddress })
        .returning({ id: properties.id });
      propertyId = createdProperty.id;
    }
  }

  if (!propertyId) {
    return { error: "Property is required" };
  }

  if (!propertyAddress) {
    const [property] = await db
      .select({ address: properties.address })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);
    propertyAddress = property?.address ?? null;
  }

  if (propertyId) {
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

  if (leadId && propertyId && !leadForJob?.propertyId) {
    await db
      .update(leads)
      .set({ propertyId, updatedAt: new Date() })
      .where(eq(leads.id, leadId));
  }

  const [priorJobForContact] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(eq(jobs.contactId, contactId))
    .limit(1);

  const [job] = await db
    .insert(jobs)
    .values({
      contactId,
      propertyId,
      leadId,
      title,
      scheduledDate,
      scheduledTime,
      estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
      address: propertyAddress,
      notes,
    })
    .returning({ id: jobs.id });

  if (leadId) {
    await db
      .update(leads)
      .set({ status: "scheduled", updatedAt: new Date() })
      .where(eq(leads.id, leadId));

    if (leadForJob) {
      await db.insert(activities).values({
        leadId,
        contactId: leadForJob.contactId,
        type: "status_change",
        content: `Job scheduled for ${scheduledDate}${scheduledTime ? ` at ${scheduledTime}` : ""}: ${title}`,
        metadata: { jobId: job.id, scheduledDate, scheduledTime },
      });
    }
  } else {
    await db.insert(activities).values({
      contactId,
      type: "note",
      content: `Job scheduled for ${scheduledDate}${scheduledTime ? ` at ${scheduledTime}` : ""}: ${title}`,
      metadata: { jobId: job.id, scheduledDate, scheduledTime },
    });
  }

  if (!priorJobForContact) {
    await db
      .update(contacts)
      .set({ type: "client", updatedAt: new Date() })
      .where(eq(contacts.id, contactId));
  }

  revalidatePath("/calendar");
  revalidatePath("/leads");
  revalidatePath("/");
  redirect(`/calendar/${job.id}`);
}

export async function updateJobStatus(jobId: string, newStatus: JobStatus) {
  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);

  if (!job) return;

  await db
    .update(jobs)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(jobs.id, jobId));

  const statusLabel =
    newStatus === "in_progress" ? "started" : newStatus;

  await db.insert(activities).values({
    leadId: job.leadId,
    contactId: job.contactId,
    type: "status_change",
    content: `Job "${job.title}" marked as ${statusLabel}`,
    metadata: { jobId, oldStatus: job.status, newStatus },
  });

  if (newStatus === "completed" && job.leadId) {
    await db
      .update(leads)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(leads.id, job.leadId));

    await db
      .update(contacts)
      .set({ type: "client", updatedAt: new Date() })
      .where(eq(contacts.id, job.contactId));
  }

  revalidatePath(`/calendar/${jobId}`);
  revalidatePath("/calendar");
  revalidatePath("/leads");
  revalidatePath("/contacts");
  revalidatePath("/");
}

export async function updateJobDetails(
  jobId: string,
  data: {
    title?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    estimatedDuration?: string;
    address?: string;
    notes?: string;
  },
) {
  await db
    .update(jobs)
    .set({
      title: data.title,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime || null,
      estimatedDuration: data.estimatedDuration
        ? parseInt(data.estimatedDuration)
        : null,
      address: data.address || null,
      notes: data.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));

  revalidatePath(`/calendar/${jobId}`);
  revalidatePath("/calendar");
}

export async function deleteJob(jobId: string) {
  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);

  await db.delete(jobs).where(eq(jobs.id, jobId));

  if (job?.leadId) {
    await db
      .update(leads)
      .set({ status: "quoted", updatedAt: new Date() })
      .where(eq(leads.id, job.leadId));
  }

  revalidatePath("/calendar");
  revalidatePath("/leads");
  revalidatePath("/");
}
