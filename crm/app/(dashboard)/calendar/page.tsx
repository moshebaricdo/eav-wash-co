import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { db } from "@/lib/db";
import { jobs, contacts } from "@/lib/db/schema";
import { JOB_STATUS_LABELS } from "@/lib/db/schema";
import type { JobStatus } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { CalendarGrid } from "./calendar-grid";
import { MonthNav } from "./month-nav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Calendar" };

type Props = {
  searchParams: Promise<{ month?: string; year?: string }>;
};

export default async function CalendarPage({ searchParams }: Props) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) - 1 : now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startStr = firstDay.toISOString().split("T")[0];
  const endStr = lastDay.toISOString().split("T")[0];

  const monthJobs = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      status: jobs.status,
      scheduledDate: jobs.scheduledDate,
      scheduledTime: jobs.scheduledTime,
      contactName: contacts.name,
      contactId: jobs.contactId,
    })
    .from(jobs)
    .leftJoin(contacts, eq(jobs.contactId, contacts.id))
    .where(and(gte(jobs.scheduledDate, startStr), lte(jobs.scheduledDate, endStr)));

  const monthLabel = firstDay.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-eav-black">
            Calendar
          </h1>
          <p className="mt-1 font-body text-sm text-eav-muted">
            {monthJobs.length} job{monthJobs.length !== 1 ? "s" : ""} in{" "}
            {monthLabel}
          </p>
        </div>
        <Link
          href="/calendar/new"
          className="inline-flex items-center gap-2 rounded-md bg-eav-orange px-4 py-2 font-body text-sm font-semibold text-eav-white transition-all hover:brightness-95 active:scale-[0.98]"
        >
          <CalendarPlus className="h-4 w-4" />
          Schedule Job
        </Link>
      </div>

      <MonthNav year={year} month={month} />

      <CalendarGrid
        year={year}
        month={month}
        jobs={monthJobs}
      />
    </div>
  );
}
