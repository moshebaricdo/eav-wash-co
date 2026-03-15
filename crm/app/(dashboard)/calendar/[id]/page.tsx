import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  CalendarDays,
} from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs, contacts, leads } from "@/lib/db/schema";
import { JOB_STATUS_LABELS } from "@/lib/db/schema";
import type { JobStatus } from "@/lib/db/schema";
import { JobStatusActions } from "./job-status-actions";
import { JobEditForm } from "./job-edit-form";
import { DeleteJobButton } from "./delete-job-button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const [job] = await db
    .select({ title: jobs.title })
    .from(jobs)
    .where(eq(jobs.id, id))
    .limit(1);
  return { title: job?.title ?? "Job Detail" };
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-500",
};

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, id))
    .limit(1);

  if (!job) notFound();

  const [contact] = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, job.contactId))
    .limit(1);

  let lead = null;
  if (job.leadId) {
    const [l] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, job.leadId))
      .limit(1);
    lead = l ?? null;
  }

  const formattedDate = new Date(job.scheduledDate + "T12:00:00").toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  );

  return (
    <div className="space-y-6">
      <Link
        href="/calendar"
        className="inline-flex items-center gap-1.5 font-body text-sm text-eav-muted hover:text-eav-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Calendar
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-eav-black">
            {job.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 font-body text-xs font-medium ${
                STATUS_COLORS[job.status] ?? STATUS_COLORS.scheduled
              }`}
            >
              {JOB_STATUS_LABELS[job.status as JobStatus] ?? job.status}
            </span>
            <span className="flex items-center gap-1.5 font-body text-sm text-eav-muted">
              <CalendarDays className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
            {job.scheduledTime && (
              <span className="flex items-center gap-1.5 font-body text-sm text-eav-muted">
                <Clock className="h-3.5 w-3.5" />
                {job.scheduledTime}
              </span>
            )}
            {job.estimatedDuration && (
              <span className="font-body text-sm text-eav-muted">
                ~{job.estimatedDuration >= 60
                  ? `${Math.floor(job.estimatedDuration / 60)}h${job.estimatedDuration % 60 ? ` ${job.estimatedDuration % 60}m` : ""}`
                  : `${job.estimatedDuration}m`}
              </span>
            )}
          </div>
        </div>
        <JobStatusActions jobId={job.id} currentStatus={job.status as JobStatus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Job details card */}
          {job.address && (
            <div className="rounded-lg border border-eav-border bg-eav-white p-5">
              <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-eav-black">
                Job Site
              </h2>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-eav-muted" />
                <span className="font-body text-sm text-eav-black">
                  {job.address}
                </span>
              </div>
            </div>
          )}

          {job.notes && (
            <div className="rounded-lg border border-eav-border bg-eav-white p-5">
              <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-eav-black">
                Notes
              </h2>
              <p className="font-body text-sm text-eav-black whitespace-pre-wrap">
                {job.notes}
              </p>
            </div>
          )}

          {/* Edit form */}
          <JobEditForm
            jobId={job.id}
            title={job.title}
            scheduledDate={job.scheduledDate}
            scheduledTime={job.scheduledTime ?? ""}
            estimatedDuration={job.estimatedDuration?.toString() ?? ""}
            address={job.address ?? ""}
            notes={job.notes ?? ""}
          />

          {/* Linked lead */}
          {lead && (
            <div className="rounded-lg border border-eav-border bg-eav-white p-5">
              <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-eav-black">
                Linked Lead
              </h2>
              <Link
                href={`/leads/${lead.id}`}
                className="font-body text-sm font-medium text-eav-orange hover:underline"
              >
                {(lead.surfaces as string[] | null)?.join(", ") ?? "View Lead"}{" "}
                — {lead.timeline ?? ""}
              </Link>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Contact card */}
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
              Delete this job from the calendar.
            </p>
            <DeleteJobButton jobId={job.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
