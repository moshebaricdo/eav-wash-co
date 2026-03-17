import { NextRequest, NextResponse } from "next/server";

function getGooglePlacesApiKey() {
  return (
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    null
  );
}

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input");

  if (!input || input.length < 3) {
    return NextResponse.json([]);
  }

  const apiKey = getGooglePlacesApiKey();
  if (!apiKey) {
    console.error("[crm places-autocomplete] Missing Google API key");
    return NextResponse.json([]);
  }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "suggestions.placePrediction.place,suggestions.placePrediction.placeId,suggestions.placePrediction.text",
      },
      body: JSON.stringify({
        input,
        includedRegionCodes: ["us"],
      }),
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[crm places-autocomplete] Google API error:", res.status, data);
      return NextResponse.json([]);
    }

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

    return NextResponse.json(suggestions);
  } catch (err) {
    console.error("[crm places-autocomplete] Fetch error:", err);
    return NextResponse.json([]);
  }
}
