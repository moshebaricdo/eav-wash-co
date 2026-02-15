import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies address autocomplete requests to the Google Places API (New).
 * Keeps the API key server-side so it's never exposed to the client.
 *
 * GET /api/places-autocomplete?input=123+Main+St
 */

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input");

  if (!input || input.length < 3) {
    return NextResponse.json([]);
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const body = {
      input,
      includedRegionCodes: ["us"],
    };

    const res = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
        },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("[places-autocomplete] Google API error:", res.status, data);
      return NextResponse.json([]);
    }

    console.log("[places-autocomplete] Google response:", JSON.stringify(data).slice(0, 500));

    const suggestions = (data.suggestions ?? [])
      .filter((s: Record<string, unknown>) => s.placePrediction)
      .map(
        (s: {
          placePrediction: {
            text: { text: string };
            placeId?: string;
            place?: string;
          };
        }) => ({
          description: s.placePrediction.text.text,
          placeId:
            s.placePrediction.placeId ??
            s.placePrediction.place?.replace("places/", "") ??
            "",
        }),
      );

    console.log("[places-autocomplete] Mapped suggestions:", suggestions.length);

    return NextResponse.json(suggestions);
  } catch (err) {
    console.error("[places-autocomplete] Fetch error:", err);
    return NextResponse.json([]);
  }
}
