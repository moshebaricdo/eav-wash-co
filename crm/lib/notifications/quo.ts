const QUO_API_BASE_URL = "https://api.openphone.com/v1";

type NewLeadSmsNotificationInput = {
  leadId: string;
  name: string;
  phone: string | null;
  address: string | null;
  source: "estimate_form" | "manual" | "phone" | "referral";
  timeline?: string | null;
  surfaces?: string[] | null;
};

type QuoConfig = {
  apiKey: string;
  from: string;
  to: string[];
  userId?: string;
  crmBaseUrl?: string;
};

function normalizePhoneToE164(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) return null;
    return `+${digits}`;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

function parseRecipients(value: string): string[] {
  return value
    .split(",")
    .map((recipient) => normalizePhoneToE164(recipient))
    .filter((recipient): recipient is string => Boolean(recipient));
}

function getConfig(): QuoConfig | null {
  const apiKey = process.env.QUO_API_KEY?.trim();
  const from = normalizePhoneToE164(process.env.QUO_FROM_NUMBER?.trim() ?? "");
  const to = parseRecipients(process.env.QUO_NOTIFY_TO_NUMBERS?.trim() ?? "");
  const userId = process.env.QUO_USER_ID?.trim();
  const crmBaseUrl = process.env.CRM_APP_BASE_URL?.trim();

  if (!apiKey || !from || to.length === 0) {
    return null;
  }

  return { apiKey, from, to, userId, crmBaseUrl };
}

function buildLeadMessage(input: NewLeadSmsNotificationInput, crmBaseUrl?: string): string {
  const bits: string[] = [];
  bits.push(`New lead: ${input.name}`);

  if (input.phone) {
    bits.push(`Phone: ${input.phone}`);
  }
  if (input.address) {
    bits.push(`Address: ${input.address}`);
  }
  if (input.timeline) {
    bits.push(`Timeline: ${input.timeline}`);
  }
  if (input.surfaces && input.surfaces.length > 0) {
    bits.push(`Surfaces: ${input.surfaces.join(", ")}`);
  }

  bits.push(`Source: ${input.source}`);

  if (crmBaseUrl) {
    const base = crmBaseUrl.replace(/\/+$/, "");
    bits.push(`Lead: ${base}/leads/${input.leadId}`);
  } else {
    bits.push(`Lead ID: ${input.leadId}`);
  }

  return bits.join("\n");
}

async function sendQuoSms(content: string) {
  const config = getConfig();
  if (!config) {
    console.warn("[notifications] Quo SMS not configured; skipping SMS notification");
    return { sent: false as const, reason: "missing-config" as const };
  }

  const payload: Record<string, unknown> = {
    from: config.from,
    to: config.to,
    content,
  };

  if (config.userId) {
    payload.userId = config.userId;
  }

  const response = await fetch(`${QUO_API_BASE_URL}/messages`, {
    method: "POST",
    headers: {
      Authorization: config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    console.error("[notifications] Quo SMS send failed", {
      status: response.status,
      details,
    });
    return { sent: false as const, reason: "api-error" as const };
  }

  return { sent: true as const };
}

export async function sendNewLeadSmsNotification(input: NewLeadSmsNotificationInput) {
  const config = getConfig();
  const content = buildLeadMessage(input, config?.crmBaseUrl);
  return sendQuoSms(content);
}
