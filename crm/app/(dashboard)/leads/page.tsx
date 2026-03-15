import Link from "next/link";
import { db } from "@/lib/db";
import { leads, contacts } from "@/lib/db/schema";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUSES,
  SOURCE_LABELS,
} from "@/lib/db/schema";
import type { LeadStatus } from "@/lib/db/schema";
import { eq, desc, and, ilike, SQL } from "drizzle-orm";

export const dynamic = "force-dynamic";
import { StatusFilter } from "./status-filter";
import { InlineStatusSelect } from "./inline-status-select";

export const metadata = { title: "Leads" };

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  quoted: "bg-purple-100 text-purple-800",
  scheduled: "bg-green-100 text-green-800",
  completed: "bg-emerald-100 text-emerald-800",
  lost: "bg-gray-100 text-gray-500",
};

type Props = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

export default async function LeadsPage({ searchParams }: Props) {
  const params = await searchParams;
  const statusFilter = params.status as LeadStatus | undefined;
  const searchQuery = params.q;

  const conditions: SQL[] = [];
  if (statusFilter && LEAD_STATUSES.includes(statusFilter)) {
    conditions.push(eq(leads.status, statusFilter));
  }
  if (searchQuery) {
    conditions.push(ilike(contacts.name, `%${searchQuery}%`));
  }

  const allLeads = await db
    .select({
      id: leads.id,
      status: leads.status,
      surfaces: leads.surfaces,
      timeline: leads.timeline,
      address: leads.address,
      source: leads.source,
      estimatedValue: leads.estimatedValue,
      createdAt: leads.createdAt,
      contactId: leads.contactId,
      contactName: contacts.name,
      contactEmail: contacts.email,
      contactPhone: contacts.phone,
    })
    .from(leads)
    .leftJoin(contacts, eq(leads.contactId, contacts.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(leads.createdAt));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-eav-black">
            Leads
          </h1>
          <p className="mt-1 font-body text-sm text-eav-muted">
            {allLeads.length} lead{allLeads.length !== 1 ? "s" : ""}
            {statusFilter ? ` — ${LEAD_STATUS_LABELS[statusFilter]}` : ""}
          </p>
        </div>
        <Link
          href="/new"
          className="inline-flex items-center gap-2 rounded-md bg-eav-orange px-4 py-2 font-body text-sm font-semibold text-eav-white transition-all hover:brightness-95 active:scale-[0.98]"
        >
          New Lead
        </Link>
      </div>

      {/* Filters */}
      <StatusFilter current={statusFilter} />

      {/* Table */}
      <div className="rounded-lg border border-eav-border bg-eav-white">
        {allLeads.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-body text-sm text-eav-muted">
              No leads found.
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
                    Timeline
                  </th>
                  <th className="px-5 py-3 font-body text-xs font-medium uppercase tracking-wider text-eav-muted">
                    Status
                  </th>
                  <th className="px-5 py-3 font-body text-xs font-medium uppercase tracking-wider text-eav-muted">
                    Source
                  </th>
                  <th className="px-5 py-3 font-body text-xs font-medium uppercase tracking-wider text-eav-muted">
                    Value
                  </th>
                  <th className="px-5 py-3 font-body text-xs font-medium uppercase tracking-wider text-eav-muted">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-eav-border">
                {allLeads.map((lead) => (
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
                    <td className="px-5 py-3 font-body text-sm text-eav-black">
                      {lead.timeline ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <InlineStatusSelect
                        leadId={lead.id}
                        currentStatus={lead.status as LeadStatus}
                      />
                    </td>
                    <td className="px-5 py-3 font-body text-xs text-eav-muted">
                      {lead.source
                        ? (SOURCE_LABELS[lead.source] ?? lead.source)
                        : "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-eav-black">
                      {lead.estimatedValue
                        ? `$${Number(lead.estimatedValue).toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-xs text-eav-muted whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
