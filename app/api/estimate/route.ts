import { NextResponse } from "next/server";

/**
 * API route stub for estimate form submissions.
 *
 * Currently just validates and returns a success response.
 * Wire this up to email (Resend, Formspree), Google Sheets,
 * or any backend when ready.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation
    const { surfaces, otherDetails, timeline, name, phone, email, address, notes } = body;

    if (!surfaces?.length || !timeline || !name || !phone || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // TODO: Send to email service, Google Sheets, etc.
    console.log("Estimate request received:", {
      surfaces,
      timeline,
      name,
      phone,
      email,
      otherDetails: otherDetails || "",
      address: address || "",
      notes: notes || "",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
