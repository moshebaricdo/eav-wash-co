import type {
  AnalyticsEventName,
  AnalyticsParams,
  ContactChannel,
  ContactPlacement,
} from "@/lib/analytics-events";
import { getStoredAttribution } from "@/lib/attribution";

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js" | "set",
      eventName: string | Date,
      params?: AnalyticsParams,
    ) => void;
  }
}

const ATTRIBUTED_EVENTS: AnalyticsEventName[] = ["contact_click", "generate_lead"];

function isClient() {
  return typeof window !== "undefined";
}

function withDefaultContext(params: AnalyticsParams = {}): AnalyticsParams {
  if (!isClient()) return params;

  return {
    page: window.location.pathname,
    ...params,
  };
}

function maybeAttachAttribution(
  eventName: AnalyticsEventName,
  params: AnalyticsParams,
) {
  if (!ATTRIBUTED_EVENTS.includes(eventName)) return params;

  return {
    ...getStoredAttribution(),
    ...params,
  };
}

export function trackEvent(eventName: AnalyticsEventName, params: AnalyticsParams = {}) {
  if (!isClient()) return;
  if (typeof window.gtag !== "function") return;

  const withContext = withDefaultContext(params);
  const withAttribution = maybeAttachAttribution(eventName, withContext);
  window.gtag("event", eventName, withAttribution);
}

export function trackContactClick({
  channel,
  placement,
}: {
  channel: ContactChannel;
  placement: ContactPlacement;
}) {
  trackEvent("contact_click", {
    channel,
    placement,
  });
}
