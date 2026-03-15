"use client";

import Link from "next/link";
import type { JobStatus } from "@/lib/db/schema";

type CalendarJob = {
  id: string;
  title: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string | null;
  contactName: string | null;
  contactId: string;
};

const JOB_DOT_COLORS: Record<string, string> = {
  scheduled: "bg-blue-500",
  in_progress: "bg-yellow-500",
  completed: "bg-emerald-500",
  cancelled: "bg-gray-400",
};

const JOB_PILL_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({
  year,
  month,
  jobs,
}: {
  year: number;
  month: number;
  jobs: CalendarJob[];
}) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const today = new Date();
  const todayStr =
    today.getFullYear() === year && today.getMonth() === month
      ? today.getDate()
      : -1;

  const jobsByDate: Record<string, CalendarJob[]> = {};
  for (const job of jobs) {
    const dateKey = job.scheduledDate;
    if (!jobsByDate[dateKey]) jobsByDate[dateKey] = [];
    jobsByDate[dateKey].push(job);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-lg border border-eav-border bg-eav-white overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-eav-border">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center font-body text-xs font-medium uppercase tracking-wider text-eav-muted"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) {
            return (
              <div
                key={`empty-${i}`}
                className="min-h-[100px] border-b border-r border-eav-border bg-eav-surface/30 last:border-r-0"
              />
            );
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayJobs = jobsByDate[dateStr] ?? [];
          const isToday = day === todayStr;

          return (
            <Link
              key={day}
              href={`/calendar/new?date=${dateStr}`}
              className={`group relative block min-h-[100px] border-b border-r border-eav-border p-1.5 last:border-r-0 transition-colors hover:bg-eav-surface/40 ${
                isToday ? "bg-eav-orange/5" : ""
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-body text-xs ${
                    isToday
                      ? "bg-eav-orange font-semibold text-eav-white"
                      : "text-eav-black"
                  }`}
                >
                  {day}
                </span>
                {dayJobs.length > 0 && (
                  <span className="flex gap-0.5">
                    {dayJobs.map((j) => (
                      <span
                        key={j.id}
                        className={`h-1.5 w-1.5 rounded-full ${JOB_DOT_COLORS[j.status] ?? JOB_DOT_COLORS.scheduled}`}
                      />
                    ))}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {dayJobs.slice(0, 3).map((job) => (
                  <span
                    key={job.id}
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/calendar/${job.id}`;
                    }}
                    className={`block cursor-pointer truncate rounded border px-1.5 py-0.5 font-body text-[11px] leading-tight transition-opacity hover:opacity-80 ${
                      JOB_PILL_COLORS[job.status] ?? JOB_PILL_COLORS.scheduled
                    }`}
                    title={`${job.title} — ${job.contactName}`}
                  >
                    {job.scheduledTime && (
                      <span className="font-medium">{job.scheduledTime} </span>
                    )}
                    {job.contactName ?? job.title}
                  </span>
                ))}
                {dayJobs.length > 3 && (
                  <span className="block font-body text-[10px] text-eav-muted">
                    +{dayJobs.length - 3} more
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
