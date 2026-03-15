import { drizzle } from "drizzle-orm/postgres-js";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import postgres from "postgres";
import { eq, or } from "drizzle-orm";

/* ─── Enums (must match CRM schema) ─────────────────────── */

export const contactTypeEnum = pgEnum("contact_type", ["lead", "client"]);
export const sourceEnum = pgEnum("source", [
  "estimate_form",
  "manual",
  "phone",
  "referral",
]);
export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "quoted",
  "scheduled",
  "completed",
  "lost",
]);
export const activityTypeEnum = pgEnum("activity_type", [
  "form_submission",
  "note",
  "call",
  "email",
  "sms",
  "status_change",
]);

/* ─── Tables ────────────────────────────────────────────── */

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  type: contactTypeEnum("type").default("lead").notNull(),
  source: sourceEnum("source"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  contactId: uuid("contact_id")
    .references(() => contacts.id)
    .notNull(),
  status: leadStatusEnum("status").default("new").notNull(),
  surfaces: jsonb("surfaces"),
  otherDetails: text("other_details"),
  timeline: text("timeline"),
  address: text("address"),
  notes: text("notes"),
  estimatedValue: numeric("estimated_value"),
  source: sourceEnum("source"),
  attribution: jsonb("attribution"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id").references(() => leads.id),
  contactId: uuid("contact_id")
    .references(() => contacts.id)
    .notNull(),
  type: activityTypeEnum("type").notNull(),
  content: text("content"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ─── Connection ────────────────────────────────────────── */

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const client = postgres(url, { max: 1 });
  return drizzle(client, { schema: { contacts, leads, activities } });
}

let _db: ReturnType<typeof getDb> | undefined;

export function db() {
  if (_db === undefined) _db = getDb();
  return _db;
}

/* ─── Estimate lead creation ────────────────────────────── */

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

export async function createEstimateLead(payload: EstimatePayload) {
  const database = db();
  if (!database) {
    console.warn("[db] DATABASE_URL not set — skipping lead persistence");
    return null;
  }

  const normalizedEmail = payload.email.trim().toLowerCase();
  const normalizedPhone = payload.phone.replace(/\D/g, "");

  const existing = await database
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

  if (existing.length > 0) {
    contactId = existing[0].id;
    await database
      .update(contacts)
      .set({
        name: payload.name,
        phone: normalizedPhone,
        address: payload.address || existing[0].address,
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, contactId));
  } else {
    const [newContact] = await database
      .insert(contacts)
      .values({
        name: payload.name,
        email: normalizedEmail,
        phone: normalizedPhone,
        address: payload.address || null,
        type: "lead",
        source: "estimate_form",
      })
      .returning({ id: contacts.id });
    contactId = newContact.id;
  }

  const [lead] = await database
    .insert(leads)
    .values({
      contactId,
      status: "new",
      surfaces: payload.surfaces,
      otherDetails: payload.otherDetails || null,
      timeline: payload.timeline,
      address: payload.address || null,
      notes: payload.notes || null,
      source: "estimate_form",
      attribution: payload.attribution || null,
    })
    .returning({ id: leads.id });

  await database.insert(activities).values({
    leadId: lead.id,
    contactId,
    type: "form_submission",
    content: `Estimate request: ${payload.surfaces.join(", ")} — ${payload.timeline}`,
    metadata: {
      surfaces: payload.surfaces,
      timeline: payload.timeline,
      address: payload.address || null,
    },
  });

  return { leadId: lead.id, contactId };
}
