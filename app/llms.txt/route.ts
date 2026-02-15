import { NextResponse } from "next/server";
import { BUSINESS, SERVICES, SITE_DESCRIPTION, SITE_URL } from "@/app/seo";

export function GET() {
  const lines = [
    "# EAV Wash Co.",
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## Business",
    `- Name: ${BUSINESS.legalName}`,
    `- Website: ${SITE_URL}`,
    `- Contact: ${BUSINESS.email} | ${BUSINESS.phone}`,
    `- Location: ${BUSINESS.addressLocality}, ${BUSINESS.addressRegion}`,
    "",
    "## Services",
    ...SERVICES.map((service) => `- ${service}`),
    "",
    "## Coverage",
    `- ${BUSINESS.areaServed.join(", ")}`,
    "",
    "## Key Pages",
    `- Home: ${SITE_URL}/`,
    `- Privacy: ${SITE_URL}/privacy`,
    "",
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
