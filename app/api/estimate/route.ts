import { NextResponse } from "next/server";

function getCrmApiConfig() {
  const baseUrl = process.env.CRM_API_BASE_URL?.trim();
  const token = process.env.CRM_API_TOKEN?.trim();
  if (!baseUrl || !token) return null;

  return {
    url: `${baseUrl.replace(/\/+$/, "")}/api/estimate`,
    token,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { surfaces, otherDetails, timeline, name, phone, email, address, notes, attribution } =
      body;

    if (!surfaces?.length || !timeline || !name || !phone || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    const crmApi = getCrmApiConfig();
    if (!crmApi) {
      console.error("Missing CRM API config: CRM_API_BASE_URL and CRM_API_TOKEN are required");
      return NextResponse.json(
        { error: "Estimate service is temporarily unavailable" },
        { status: 503 },
      );
    }

    const upstream = await fetch(crmApi.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${crmApi.token}`,
      },
      body: JSON.stringify({
        surfaces,
        otherDetails: otherDetails || "",
        timeline,
        name,
        phone,
        email,
        address: address || "",
        notes: notes || "",
        attribution: attribution || undefined,
      }),
      cache: "no-store",
    });

    const upstreamBody = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: upstreamBody?.error || "Could not submit estimate right now",
        },
        { status: upstream.status },
      );
    }

    return NextResponse.json({
      success: true,
      leadId: upstreamBody?.leadId ?? null,
    });
  } catch (err) {
    console.error("Estimate submission error:", err);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 },
    );
  }
}
