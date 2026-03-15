import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, CalendarPlus } from "lucide-react";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  contacts,
  leads,
  activities,
  LEAD_STATUS_LABELS,
  SOURCE_LABELS,
} from "@/lib/db/schema";
import type { LeadStatus } from "@/lib/db/schema";
import { ContactEditForm } from "./contact-edit-form";
import { PromoteButton } from "./promote-button";
import { ContactNoteForm } from "./contact-note-form";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const [contact] = await db
    .select({ name: contacts.name })
    .from(contacts)
    .where(eq(contacts.id, id))
    .limit(1);
  return { title: contact?.name ?? "Contact Detail" };
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  quoted: "bg-purple-100 text-purple-800",
  scheduled: "bg-green-100 text-green-800",
  completed: "bg-emerald-100 text-emerald-800",
  lost: "bg-gray-100 text-gray-500",
};

const ACTIVITY_ICONS: Record<string, string> = {
  form_submission: "📋",
  note: "📝",
  call: "📞",
  email: "✉️",
  sms: "💬",
  status_change: "🔄",
};

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params;

  const [contact] = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, id))
    .limit(1);

  if (!contact) notFound();

  const [contactLeads, activityList] = await Promise.all([
    db
      .select()
      .from(leads)
      .where(eq(leads.contactId, id))
      .orderBy(desc(leads.createdAt)),
    db
      .select()
      .from(activities)
      .where(eq(activities.contactId, id))
      .orderBy(desc(activities.createdAt))
      .limit(50),
  ]);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/contacts"
        className="inline-flex items-center gap-1.5 font-body text-sm text-eav-muted hover:text-eav-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Contacts
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-eav-black">
              {contact.name}
            </h1>
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 font-body text-xs font-medium ${
                contact.type === "client"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {contact.type === "client" ? "Client" : "Lead"}
            </span>
          </div>
          <p className="mt-1 font-body text-sm text-eav-muted">
            Added{" "}
            {new Date(contact.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {contact.source &&
              ` via ${SOURCE_LABELS[contact.source] ?? contact.source}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/calendar/new?contactId=${contact.id}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-eav-orange px-4 py-2 font-body text-sm font-semibold text-eav-white transition-all hover:brightness-95 active:scale-[0.98]"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Schedule Job
          </Link>
          <PromoteButton contactId={contact.id} currentType={contact.type} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact info card */}
          <div className="rounded-lg border border-eav-border bg-eav-white p-5">
            <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-eav-black">
              Contact Info
            </h2>
            <div className="space-y-2">
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-eav-muted" />
                  <a
                    href={`tel:${contact.phone}`}
                    className="font-body text-sm text-eav-black hover:text-eav-orange"
                  >
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-eav-muted" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="font-body text-sm text-eav-black hover:text-eav-orange"
                  >
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-eav-muted" />
                  <span className="font-body text-sm text-eav-black">
                    {contact.address}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Edit form */}
          <ContactEditForm
            contactId={contact.id}
            name={contact.name}
            email={contact.email ?? ""}
            phone={contact.phone ?? ""}
            address={contact.address ?? ""}
            notes={contact.notes ?? ""}
          />

          {/* Lead history */}
          <div className="rounded-lg border border-eav-border bg-eav-white p-5">
            <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-eav-black">
              Lead History ({contactLeads.length})
            </h2>

            {contactLeads.length === 0 ? (
              <p className="font-body text-sm text-eav-muted">
                No leads for this contact.
              </p>
            ) : (
              <div className="space-y-3">
                {contactLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className="flex items-center justify-between rounded-md border border-eav-border p-3 transition-colors hover:bg-eav-surface"
                  >
                    <div>
                      <p className="font-body text-sm font-medium text-eav-black">
                        {(lead.surfaces as string[] | null)?.join(", ") ??
                          "No services"}
                      </p>
                      <p className="mt-0.5 font-body text-xs text-eav-muted">
                        {new Date(lead.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {lead.timeline && ` — ${lead.timeline}`}
                      </p>
                    </div>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 font-body text-xs font-medium ${
                        STATUS_COLORS[lead.status] ?? STATUS_COLORS.new
                      }`}
                    >
                      {LEAD_STATUS_LABELS[lead.status as LeadStatus] ??
                        lead.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — Activity */}
        <div className="rounded-lg border border-eav-border bg-eav-white p-5">
          <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-eav-black">
            Activity
          </h2>

          <ContactNoteForm contactId={contact.id} />

          <div className="mt-6 space-y-4">
            {activityList.length === 0 && (
              <p className="font-body text-sm text-eav-muted">
                No activity yet.
              </p>
            )}
            {activityList.map((a) => (
              <div key={a.id} className="flex gap-3">
                <span className="mt-0.5 text-base">
                  {ACTIVITY_ICONS[a.type] ?? "📌"}
                </span>
                <div className="flex-1">
                  <p className="font-body text-sm text-eav-black">
                    {a.content}
                  </p>
                  <p className="mt-0.5 font-body text-xs text-eav-muted">
                    {new Date(a.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
