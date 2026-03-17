import { NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { activities, contacts, leads, properties, propertyContacts } from "@/lib/db/schema";

type EstimatePayload = {
  surfaces: string[];
  otherDetails?: string;
  timeline: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  notes?: string;
  attribution?: Record<string, string>;
};

function getIngestSecret() {
  return process.env.LEAD_INGEST_API_KEY;
}

function isAuthorized(request: Request) {
  const secret = getIngestSecret();
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  const token = authHeader.slice("Bearer ".length).trim();
  return token === secret;
}

function validatePayload(payload: Partial<EstimatePayload>) {
  if (!payload.surfaces?.length || !payload.timeline || !payload.name || !payload.phone || !payload.email) {
    return "Missing required fields";
  }

  if (!payload.address?.trim()) {
    return "Property address is required";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return "Invalid email address";
  }

  return null;
}

async function createEstimateLead(payload: EstimatePayload) {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const normalizedPhone = payload.phone.replace(/\D/g, "");
  const normalizedAddress = payload.address?.trim() ?? "";

  const existingContact = await db
    .select()
    .from(contacts)
    .where(
      or(
        eq(contacts.email, normalizedEmail),
        eq(contacts.phone, normalizedPhone),
      ),
    )
    .limit(1);

  let contactId: string;

  if (existingContact.length > 0) {
    contactId = existingContact[0].id;
    await db
      .update(contacts)
      .set({
        name: payload.name,
        phone: normalizedPhone,
        address: normalizedAddress || existingContact[0].address,
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, contactId));
  } else {
    const [newContact] = await db
      .insert(contacts)
      .values({
        name: payload.name,
        email: normalizedEmail,
        phone: normalizedPhone,
        address: normalizedAddress || null,
        type: "lead",
        source: "estimate_form",
      })
      .returning({ id: contacts.id });
    contactId = newContact.id;
  }

  let propertyId: string;
  const existingProperty = await db
    .select({ id: properties.id })
    .from(properties)
    .where(eq(properties.address, normalizedAddress))
    .limit(1);

  if (existingProperty.length > 0) {
    propertyId = existingProperty[0].id;
  } else {
    const [newProperty] = await db
      .insert(properties)
      .values({ address: normalizedAddress })
      .returning({ id: properties.id });
    propertyId = newProperty.id;
  }

  const existingPropertyContact = await db
    .select({ id: propertyContacts.id })
    .from(propertyContacts)
    .where(
      and(
        eq(propertyContacts.propertyId, propertyId),
        eq(propertyContacts.contactId, contactId),
      ),
    )
    .limit(1);

  if (existingPropertyContact.length === 0) {
    await db.insert(propertyContacts).values({
      propertyId,
      contactId,
    });
  }

  const [lead] = await db
    .insert(leads)
    .values({
      contactId,
      propertyId,
      status: "new",
      surfaces: payload.surfaces,
      otherDetails: payload.otherDetails || null,
      timeline: payload.timeline,
      address: normalizedAddress,
      notes: payload.notes || null,
      source: "estimate_form",
      attribution: payload.attribution || null,
    })
    .returning({ id: leads.id });

  await db.insert(activities).values({
    leadId: lead.id,
    contactId,
    type: "form_submission",
    content: `Estimate request: ${payload.surfaces.join(", ")} - ${payload.timeline}`,
    metadata: {
      surfaces: payload.surfaces,
      timeline: payload.timeline,
      address: normalizedAddress,
      attribution: payload.attribution ?? null,
    },
  });

  return { leadId: lead.id };
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<EstimatePayload>;
    const validationError = validatePayload(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const result = await createEstimateLead(body as EstimatePayload);
    return NextResponse.json({ success: true, leadId: result.leadId });
  } catch (error) {
    console.error("CRM estimate ingestion error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
