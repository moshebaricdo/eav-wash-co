import { db } from "@/lib/db";
import { leads, jobs } from "@/lib/db/schema";
import { sql, eq, and, or } from "drizzle-orm";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Target,
  CalendarDays,
  Clock,
} from "lucide-react";

const WEATHER_LAT = parseFloat(process.env.WEATHER_LAT ?? "33.75");
const WEATHER_LON = parseFloat(process.env.WEATHER_LON ?? "-84.39");

function weatherIcon(code: number) {
  if (code <= 1) return Sun;
  if (code === 2) return CloudSun;
  if (code === 3) return Cloud;
  if (code >= 45 && code <= 48) return CloudFog;
  if (code >= 51 && code <= 57) return CloudDrizzle;
  if (code >= 61 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 77) return CloudSnow;
  if (code >= 80 && code <= 82) return CloudRain;
  if (code >= 85 && code <= 86) return CloudSnow;
  if (code >= 95) return CloudLightning;
  return Cloud;
}

async function getWeather() {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_LAT}&longitude=${WEATHER_LON}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`,
      { next: { revalidate: 1800 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      temp: Math.round(data.current.temperature_2m),
      code: data.current.weather_code as number,
    };
  } catch {
    return null;
  }
}

async function getTodayStats() {
  const todayStr = new Date().toISOString().split("T")[0];

  const [todayLeads, todayJobs] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(sql`${leads.createdAt}::date = ${todayStr}::date`),

    db
      .select({
        count: sql<number>`count(*)::int`,
        soonestTime: sql<string | null>`min(${jobs.scheduledTime})`,
      })
      .from(jobs)
      .where(
        and(
          eq(jobs.scheduledDate, todayStr),
          or(eq(jobs.status, "scheduled"), eq(jobs.status, "in_progress")),
        ),
      ),
  ]);

  return {
    leadsToday: todayLeads[0]?.count ?? 0,
    jobsToday: todayJobs[0]?.count ?? 0,
    soonestTime: todayJobs[0]?.soonestTime ?? null,
  };
}

export async function HeaderStats() {
  const [weather, stats] = await Promise.all([getWeather(), getTodayStats()]);

  const WeatherIcon = weather ? weatherIcon(weather.code) : null;

  return (
    <div className="flex items-center gap-4 font-body text-xs">
      {weather && WeatherIcon && (
        <>
          <div className="flex items-center gap-1.5 text-eav-muted">
            <WeatherIcon className="h-4 w-4" />
            <span className="font-medium text-eav-black">
              {weather.temp}°F
            </span>
          </div>
          <div className="h-3.5 w-px bg-eav-border" />
        </>
      )}

      <div className="flex items-center gap-1.5 text-eav-muted">
        <Target className="h-3.5 w-3.5" />
        <span className="font-medium text-eav-black">{stats.leadsToday}</span>
        <span>leads today</span>
      </div>

      <div className="h-3.5 w-px bg-eav-border" />

      <div className="flex items-center gap-1.5 text-eav-muted">
        <CalendarDays className="h-3.5 w-3.5" />
        <span className="font-medium text-eav-black">{stats.jobsToday}</span>
        <span>jobs today</span>
        {stats.soonestTime && (
          <>
            <span className="text-eav-border">·</span>
            <Clock className="h-3 w-3" />
            <span className="font-medium text-eav-black">
              {stats.soonestTime}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export function HeaderStatsSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <div className="h-4 w-16 animate-pulse rounded bg-eav-surface" />
      <div className="h-3.5 w-px bg-eav-border" />
      <div className="h-4 w-24 animate-pulse rounded bg-eav-surface" />
      <div className="h-3.5 w-px bg-eav-border" />
      <div className="h-4 w-32 animate-pulse rounded bg-eav-surface" />
    </div>
  );
}
