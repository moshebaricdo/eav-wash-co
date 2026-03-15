import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, CalendarPlus } from "lucide-react";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads, contacts, activities, jobs } from "@/lib/db/schema";
import { LEAD_STATUS_LABELS, SOURCE_LABELS, JOB_STATUS_LABELS } from "@/lib/db/schema";
import type { JobStatus } from "@/lib/db/schema";
import type { LeadStatus } from "@/lib/db/schema";
import { InlineStatusSelect } from "../inline-status-select";

export const dynamic = "force-dynamic";
import { LeadDetailsForm } from "./lead-details-form";
import { AddNoteForm } from "./add-note-form";
import { DeleteLeadButton } from "./delete-lead-button";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const [lead] = await db
    .select({ contactName: contacts.name })
    .from(leads)
    .leftJoin(contacts, eq(leads.contactId, contacts.id))
    .where(eq(leads.id, id))
    .limit(1);
  return { title: lead?.contactName ?? "Lead Detail" };
}

const ACTIVITY_ICONS: Record<string, string> = {
  form_submission: "📋",
  note: "📝",
  call: "📞",
  email: "✉️",
  sms: "💬",
  status_change: "🔄",
};

const STATUS_STEP_COLORS: Record<string, string> = {
  new: "bg-blue-500",
  contacted: "bg-yellow-500",
  quoted: "bg-purple-500",
  scheduled: "bg-green-500",
  completed: "bg-emerald-500",
  lost: "bg-gray-400",
};

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;

  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, id))
    .limit(1);

  if (!lead) notFound();

  const [contact] = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, lead.contactId))
    .limit(1);

  const [activityList, leadJobs] = await Promise.all([
    db
      .select()
      .from(activities)
      .where(eq(activities.leadId, id))
      .orderBy(desc(activities.createdAt)),
    db
      .select()
      .from(jobs)
      .where(eq(jobs.leadId, id))
      .orderBy(desc(jobs.scheduledDate)),
  ]);

  const surfaces = (lead.surfaces as string[] | null) ?? [];
  const pipelineSteps: LeadStatus[] = [
    "new",
    "contacted",
    "quoted",
    "scheduled",
    "completed",
  ];
  const currentIdx = pipelineSteps.indexOf(lead.status as LeadStatus);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 font-body text-sm text-eav-muted hover:text-eav-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Leads
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-eav-black">
            {contact?.name ?? "Unknown Contact"}
          </h1>
          <p className="mt-1 font-body text-sm text-eav-muted">
            Lead created{" "}
            {new Date(lead.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {lead.source &&
              ` via ${SOURCE_LABELS[lead.source] ?? lead.source}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/calendar/new?leadId=${lead.id}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-eav-orange px-4 py-2 font-body text-sm font-semibold text-eav-white transition-all hover:brightness-95 active:scale-[0.98]"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Schedule Job
          </Link>
          <InlineStatusSelect
            leadId={lead.id}
            currentStatus={lead.status as LeadStatus}
          />
        </div>
      </div>

      {/* Pipeline stepper */}
      {lead.status !== "lost" && (
        <div className="flex items-center gap-1">
          {pipelineSteps.map((step, i) => (
            <div key={step} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`h-2 w-full rounded-full ${
                  i <= currentIdx
                    ? STATUS_STEP_COLORS[step]
                    : "bg-eav-border"
                }`}
              />
              <span className="font-body text-[10px] text-eav-muted">
                {LEAD_STATUS_LABELS[step]}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Services card */}
          <div className="rounded-lg border border-eav-border bg-eav-white p-5">
            <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-eav-black">
              Services Requested
            </h2>
            <div className="flex flex-wrap gap-2">
              {surfaces.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-eav-surface px-3 py-1 font-body text-sm text-eav-black"
                >
                  {s}
                </span>
              ))}
              {surfaces.length === 0 && (
                <span className="font-body text-sm text-eav-muted">None specified</span>
              )}
            </div>
            {lead.otherDetails && (
              <p className="mt-2 font-body text-sm text-eav-muted">
                {lead.otherDetails}
              </p>
            )}
            {lead.timeline && (
              <p className="mt-3 font-body text-sm text-eav-black">
                <span className="font-medium">Timeline:</span> {lead.timeline}
              </p>
            )}
            {lead.address && (
              <p className="mt-1 font-body text-sm text-eav-black">
                <span className="font-medium">Job site:</span> {lead.address}
              </p>
            )}
          </div>

          {/* Scheduled jobs */}
          {leadJobs.length > 0 && (
            <div className="rounded-lg border border-eav-border bg-eav-white p-5">
              <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-eav-black">
                Scheduled Jobs ({leadJobs.length})
              </h2>
              <div className="space-y-2">
                {leadJobs.map((job) => {
                  const JOB_COLORS: Record<string, string> = {
                    scheduled: "bg-blue-100 text-blue-800",
                    in_progress: "bg-yellow-100 text-yellow-800",
                    completed: "bg-emerald-100 text-emerald-800",
                    cancelled: "bg-gray-100 text-gray-500",
                  };
                  return (
                    <Link
                      key={job.id}
                      href={`/calendar/${job.id}`}
                      className="flex items-center justify-between rounded-md border border-eav-border p-3 transition-colors hover:bg-eav-surface"
                    >
                      <div>
                        <p className="font-body text-sm font-medium text-eav-black">
                          {job.title}
                        </p>
                        <p className="mt-0.5 font-body text-xs text-eav-muted">
                          {new Date(job.scheduledDate + "T12:00:00").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {job.scheduledTime && ` at ${job.scheduledTime}`}
                        </p>
                      </div>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 font-body text-xs font-medium ${
                          JOB_COLORS[job.status] ?? JOB_COLORS.scheduled
                        }`}
                      >
                        {JOB_STATUS_LABELS[job.status as JobStatus] ?? job.status}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Editable details */}
          <LeadDetailsForm
            leadId={lead.id}
            notes={lead.notes ?? ""}
            estimatedValue={lead.estimatedValue ?? ""}
            address={lead.address ?? ""}
          />

          {/* Activity timeline */}
          <div className="rounded-lg border border-eav-border bg-eav-white p-5">
            <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-eav-black">
              Activity
            </h2>

            <AddNoteForm leadId={lead.id} contactId={lead.contactId} />

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

        {/* Right column — contact card */}
        <div className="space-y-6">
          <div className="rounded-lg border border-eav-border bg-eav-white p-5">
            <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-eav-black">
              Contact
            </h2>
            {contact ? (
              <div className="space-y-3">
                <Link
                  href={`/contacts/${contact.id}`}
                  className="font-body text-base font-medium text-eav-orange hover:underline"
                >
                  {contact.name}
                </Link>
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
            ) : (
              <p className="font-body text-sm text-eav-muted">
                Contact not found
              </p>
            )}
          </div>

          {/* Danger zone */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-5">
            <h2 className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-red-700">
              Danger Zone
            </h2>
            <p className="mb-3 font-body text-xs text-red-600">
              Permanently delete this lead and all its activity.
            </p>
            <DeleteLeadButton leadId={lead.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
