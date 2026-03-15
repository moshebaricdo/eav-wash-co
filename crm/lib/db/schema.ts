import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  numeric,
  pgEnum,
  date,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ─── Enums ─────────────────────────────────────────────── */

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
export const jobStatusEnum = pgEnum("job_status", [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

/* ─── Contacts ──────────────────────────────────────────── */

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

export const contactsRelations = relations(contacts, ({ many }) => ({
  leads: many(leads),
  activities: many(activities),
  jobs: many(jobs),
}));

/* ─── Leads ─────────────────────────────────────────────── */

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  contactId: uuid("contact_id")
    .references(() => contacts.id)
    .notNull(),
  status: leadStatusEnum("status").default("new").notNull(),
  surfaces: jsonb("surfaces").$type<string[]>(),
  otherDetails: text("other_details"),
  timeline: text("timeline"),
  address: text("address"),
  notes: text("notes"),
  estimatedValue: numeric("estimated_value"),
  source: sourceEnum("source"),
  attribution: jsonb("attribution").$type<Record<string, string>>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const leadsRelations = relations(leads, ({ one, many }) => ({
  contact: one(contacts, {
    fields: [leads.contactId],
    references: [contacts.id],
  }),
  activities: many(activities),
  jobs: many(jobs),
}));

/* ─── Activities ────────────────────────────────────────── */

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

export const activitiesRelations = relations(activities, ({ one }) => ({
  lead: one(leads, {
    fields: [activities.leadId],
    references: [leads.id],
  }),
  contact: one(contacts, {
    fields: [activities.contactId],
    references: [contacts.id],
  }),
}));

/* ─── Jobs ──────────────────────────────────────────────── */

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  contactId: uuid("contact_id")
    .references(() => contacts.id)
    .notNull(),
  leadId: uuid("lead_id").references(() => leads.id),
  title: text("title").notNull(),
  status: jobStatusEnum("status").default("scheduled").notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time"),
  estimatedDuration: integer("estimated_duration"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const jobsRelations = relations(jobs, ({ one }) => ({
  contact: one(contacts, {
    fields: [jobs.contactId],
    references: [contacts.id],
  }),
  lead: one(leads, {
    fields: [jobs.leadId],
    references: [leads.id],
  }),
}));

/* ─── Users (CRM auth) ─────────────────────────────────── */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ─── Type exports ──────────────────────────────────────── */

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type User = typeof users.$inferSelect;

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "scheduled",
  "completed",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  scheduled: "Scheduled",
  completed: "Completed",
  lost: "Lost",
};

export const SOURCE_LABELS: Record<string, string> = {
  estimate_form: "Estimate Form",
  manual: "Manual",
  phone: "Phone",
  referral: "Referral",
};

export const JOB_STATUSES = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};
