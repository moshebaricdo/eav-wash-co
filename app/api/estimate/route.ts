import { NextResponse } from "next/server";
import { createEstimateLead } from "@/lib/db";

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

    const result = await createEstimateLead({
      surfaces,
      otherDetails: otherDetails || "",
      timeline,
      name,
      phone,
      email,
      address: address || "",
      notes: notes || "",
      attribution: attribution || undefined,
    });

    if (!result) {
      console.log("Estimate request received (no DB):", {
        surfaces,
        timeline,
        name,
        phone,
        email,
      });
    }

    return NextResponse.json({
      success: true,
      leadId: result?.leadId ?? null,
    });
  } catch (err) {
    console.error("Estimate submission error:", err);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 },
    );
  }
}
