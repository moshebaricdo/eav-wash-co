const ATTRIBUTION_STORAGE_KEY = "eav_attribution_v1";

export type AttributionSnapshot = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  wbraid?: string;
  gbraid?: string;
  fbclid?: string;
  msclkid?: string;
  ttclid?: string;
  landing_path?: string;
  landing_page?: string;
  landing_referrer?: string;
};

const ATTRIBUTION_KEYS: (keyof AttributionSnapshot)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "wbraid",
  "gbraid",
  "fbclid",
  "msclkid",
  "ttclid",
];

function hasAttributionParams(snapshot: AttributionSnapshot) {
  return ATTRIBUTION_KEYS.some((key) => {
    const value = snapshot[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

export function readAttributionFromLocation(): AttributionSnapshot {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const snapshot: AttributionSnapshot = {};

  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key);
    if (value) snapshot[key] = value;
  }

  if (!hasAttributionParams(snapshot)) return {};

  const path = `${window.location.pathname}${window.location.search}`;
  snapshot.landing_path = path;
  snapshot.landing_page = window.location.pathname;
  if (document.referrer) {
    snapshot.landing_referrer = document.referrer;
  }

  return snapshot;
}

export function saveAttribution(snapshot: AttributionSnapshot) {
  if (typeof window === "undefined") return;
  if (!hasAttributionParams(snapshot)) return;

  try {
    window.sessionStorage.setItem(
      ATTRIBUTION_STORAGE_KEY,
      JSON.stringify(snapshot),
    );
  } catch {
    // Ignore storage failures
  }
}

export function getStoredAttribution(): AttributionSnapshot {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as AttributionSnapshot;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export function captureAttributionFromLocation() {
  const snapshot = readAttributionFromLocation();
  if (hasAttributionParams(snapshot)) {
    saveAttribution(snapshot);
  }
}
