import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/app/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "EAV Wash",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#F3EEE4",
    theme_color: "#121212",
    icons: [],
    scope: "/",
    id: SITE_URL,
  };
}
