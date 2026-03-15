import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { NewDropdown } from "./new-dropdown";
import { db } from "@/lib/db";
import { leads, contacts, jobs } from "@/lib/db/schema";
import { eq, desc, sql, gte, and, or } from "drizzle-orm";
import { LEAD_STATUS_LABELS, SOURCE_LABELS } from "@/lib/db/schema";
import type { LeadStatus } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  quoted: "bg-purple-100 text-purple-800",
  scheduled: "bg-green-100 text-green-800",
  completed: "bg-emerald-100 text-emerald-800",
  lost: "bg-gray-100 text-gray-500",
};

async function getStats() {
  const todayStr = new Date().toISOString().split("T")[0];

  const [statusCounts, recentLeads, upcomingJobs] = await Promise.all([
    db
      .select({
        status: leads.status,
        count: sql<number>`count(*)::int`,
      })
      .from(leads)
      .groupBy(leads.status),

    db
      .select({
        id: leads.id,
        status: leads.status,
        surfaces: leads.surfaces,
        timeline: leads.timeline,
        source: leads.source,
        createdAt: leads.createdAt,
        contactName: contacts.name,
        contactEmail: contacts.email,
        contactPhone: contacts.phone,
      })
      .from(leads)
      .leftJoin(contacts, eq(leads.contactId, contacts.id))
      .orderBy(desc(leads.createdAt))
      .limit(10),

    db
      .select({
        id: jobs.id,
        title: jobs.title,
        status: jobs.status,
        scheduledDate: jobs.scheduledDate,
        scheduledTime: jobs.scheduledTime,
        contactName: contacts.name,
      })
      .from(jobs)
      .leftJoin(contacts, eq(jobs.contactId, contacts.id))
      .where(
        and(
          gte(jobs.scheduledDate, todayStr),
          or(eq(jobs.status, "scheduled"), eq(jobs.status, "in_progress")),
        ),
      )
      .orderBy(jobs.scheduledDate)
      .limit(5),
  ]);

  const countMap: Record<string, number> = {};
  for (const row of statusCounts) {
    countMap[row.status] = row.count;
  }

  return {
    statusCounts: countMap,
    recentLeads,
    upcomingJobs,
  };
}

export default async function DashboardPage() {
  const { statusCounts, recentLeads, upcomingJobs } = await getStats();

  const newLeads = statusCounts["new"] ?? 0;
  const inPipeline = (statusCounts["contacted"] ?? 0) + (statusCounts["quoted"] ?? 0);
  const scheduled = statusCounts["scheduled"] ?? 0;
  const completed = statusCounts["completed"] ?? 0;

  const metrics: { label: string; value: number; href: string; accent?: string }[] = [
    { label: "New Leads", value: newLeads, href: "/leads?status=new" },
    { label: "In Pipeline", value: inPipeline, href: "/leads?status=contacted" },
    { label: "Scheduled", value: scheduled, href: "/leads?status=scheduled" },
    { label: "Completed", value: completed, href: "/leads?status=completed", accent: "text-emerald-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-eav-black">
            Dashboard
          </h1>
          <p className="mt-1 font-body text-sm text-eav-muted">
            Overview of your leads and pipeline
          </p>
        </div>
        <NewDropdown />
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="group rounded-lg border border-eav-border bg-eav-white p-5 transition-shadow hover:shadow-md"
          >
            <p className="font-body text-xs font-medium uppercase tracking-wider text-eav-muted">
              {m.label}
            </p>
            <p className={`mt-2 font-heading text-3xl font-bold ${m.accent ?? "text-eav-black"}`}>
              {m.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Leads + Upcoming jobs — 70 / 30 split */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[7fr_3fr]">
        {/* Recent leads table */}
        <div className="min-w-0 rounded-lg border border-eav-border bg-eav-white">
          <div className="flex items-center justify-between border-b border-eav-border px-5 py-4">
            <h2 className="font-heading text-base font-bold uppercase tracking-wide text-eav-black">
              Recent Leads
            </h2>
            <Link
              href="/leads"
              className="inline-flex items-center gap-1 font-body text-xs font-medium text-eav-orange hover:underline"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-body text-sm text-eav-muted">
                No leads yet. They&apos;ll appear here when submitted.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-eav-border text-left">
                    <th className="px-5 py-3 font-body text-xs font-medium uppercase tracking-wider text-eav-muted">
                      Contact
                    </th>
                    <th className="px-5 py-3 font-body text-xs font-medium uppercase tracking-wider text-eav-muted">
                      Services
                    </th>
                    <th className="px-5 py-3 font-body text-xs font-medium uppercase tracking-wider text-eav-muted">
                      Status
                    </th>
                    <th className="px-5 py-3 font-body text-xs font-medium uppercase tracking-wider text-eav-muted">
                      Source
                    </th>
                    <th className="px-5 py-3 font-body text-xs font-medium uppercase tracking-wider text-eav-muted">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-eav-border">
                  {recentLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="transition-colors hover:bg-eav-surface/50"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-body text-sm font-medium text-eav-black hover:text-eav-orange"
                        >
                          {lead.contactName ?? "Unknown"}
                        </Link>
                        <p className="font-body text-xs text-eav-muted">
                          {lead.contactEmail ?? lead.contactPhone}
                        </p>
                      </td>
                      <td className="px-5 py-3 font-body text-sm text-eav-black">
                        {(lead.surfaces as string[] | null)?.join(", ") ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 font-body text-xs font-medium ${
                            STATUS_COLORS[lead.status] ?? STATUS_COLORS.new
                          }`}
                        >
                          {LEAD_STATUS_LABELS[lead.status as LeadStatus] ??
                            lead.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-body text-xs text-eav-muted">
                        {lead.source
                          ? (SOURCE_LABELS[lead.source] ?? lead.source)
                          : "—"}
                      </td>
                      <td className="px-5 py-3 font-body text-xs text-eav-muted">
                        {new Date(lead.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming jobs */}
        <div className="rounded-lg border border-eav-border bg-eav-white">
          <div className="flex items-center justify-between border-b border-eav-border px-5 py-4">
            <h2 className="font-heading text-base font-bold uppercase tracking-wide text-eav-black">
              Upcoming Jobs
            </h2>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-1 font-body text-xs font-medium text-eav-orange hover:underline"
            >
              Calendar
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {upcomingJobs.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="font-body text-sm text-eav-muted">
                No upcoming jobs scheduled.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-eav-border">
              {upcomingJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/calendar/${job.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-eav-surface/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-eav-orange/10">
                    <CalendarDays className="h-4 w-4 text-eav-orange" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-body text-sm font-medium text-eav-black">
                      {job.title}
                    </p>
                    <p className="font-body text-xs text-eav-muted">
                      {new Date(job.scheduledDate + "T12:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                      {job.scheduledTime && ` · ${job.scheduledTime}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
