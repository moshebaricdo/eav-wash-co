export const SITE_URL = "https://eavwash.co";
export const SITE_NAME = "EAV Wash Co.";
export const SITE_TITLE = "EAV Wash Co. | Pressure Washing in Atlanta, GA";
export const SITE_DESCRIPTION =
  "Professional pressure washing for driveways, patios, decks, and walkways in East Atlanta Village and the greater Atlanta area.";

export const BUSINESS = {
  name: SITE_NAME,
  legalName: "EAV Wash Co., LLC",
  phone: "+1-470-300-9995",
  email: "hello@eavwash.co",
  sms: "sms:+14703009995",
  telephoneHref: "tel:+14703009995",
  addressLocality: "Atlanta",
  addressRegion: "GA",
  areaServed: [
    "East Atlanta Village",
    "East Atlanta",
    "Ormewood Park",
    "Grant Park",
    "Kirkwood",
    "Edgewood",
    "East Lake",
    "Decatur",
    "Brookhaven",
    "Sandy Springs",
    "Marietta",
    "Roswell",
  ],
  priceRange: "$$",
} as const;

export const SERVICES = [
  "Driveway pressure washing",
  "Patio pressure washing",
  "Deck cleaning",
  "Walkway cleaning",
] as const;

export const FAQS = [
  {
    question:
      "What's the difference between pressure washing, power washing, and soft washing?",
    answer:
      "In most contexts, \"pressure washing\" and \"power washing\" really mean the same thing: using water at very high pressure to clean hard surfaces like concrete, patios, and sidewalks of deeply-embedded dirt and debris.\n\nSoft washing refers to a very low-pressure method typically used for surfaces like vinyl siding or roofs and relies on chemical cleaning action as opposed to high-pressure. At the moment, we focus on professional pressure washing for flat surfaces like driveways, patios, and walkways.",
  },
  {
    question: "How much does pressure washing cost in the Atlanta area?",
    answer:
      "Our pricing depends almost entirely on the size (square footage) of the area and number of surfaces that need to be cleaned. We may take the level of dirt into consideration if we feel a significant amount of additional time or \"passes\" are required, but this will always be communicated upfront, never after-the-fact.\n\nWe provide custom estimates based on your property details. The easiest way to get started is by filling out our estimate form at the top of this page or reaching out directly by phone or email.",
  },
  {
    question:
      "Can you remove oil stains, rust stains, and deep discoloration?",
    answer:
      "We carry specialty cleaning solutions for things like oil, grease, rust, red clay, and heavy organic buildup. That said, pressure washing is a cleaning method, not full concrete restoration, so while we can dramatically improve most stains, full removal isn't always guaranteed. We'll always set realistic expectations before starting the job.",
  },
  {
    question: "Will pressure washing damage painted or stained wood?",
    answer:
      "Pressure washing is safe for many surfaces when handled correctly, but painted, freshly stained, or sealed wood can potentially be affected by high pressure. If you're unsure about your surface, let us know during the estimate process. We'll evaluate it and advise you honestly before proceeding.",
  },
  {
    question: "Will pressure washing damage my plants or landscaping?",
    answer:
      "Protecting your lawn and garden is part of the job. We'll always pre and post-rinse surrounding vegetation, use controlled chemical applications, and thoroughly rinse treated areas after cleaning. When handled properly, professional pressure washing should not harm healthy plants or grass.",
  },
  {
    question: "What cleaning products do you use?",
    answer:
      "We use professional-grade cleaning solutions, including diluted sodium hypochlorite (a standard industry cleaner similar to pool chlorine), as well as specialty products for rust and oil treatment when needed (industrial degreasers, oxalic acid solutions, etc). These are applied in controlled concentrations appropriate for residential pressure washing. The goal is effective cleaning without unnecessary chemical exposure.",
  },
  {
    question: "Do I need to be home during the service?",
    answer:
      "No, as long as we have access to the areas being cleaned and a working outdoor water spigot, you don't need to be present. We'll share a video-walkthrough and photos if you're not able to be on site to do a post-wash walkthrough.",
  },
  {
    question: "Do you need to use my water?",
    answer:
      "Yes. Like the majority of pressure washing companies, we make use of your outdoor water supply. Our equipment connects directly to a standard hose spigot, and we control flow carefully throughout the job. For most driveway or patio cleanings, water usage is under $5 and far cheaper than the cost of hauling tanks of water back and forth during a job.",
  },
  {
    question: "What areas do you serve?",
    answer:
      "We're based in East Atlanta and serve homeowners across Atlanta and the surrounding metro area. If your specific neighborhood isn't listed on our site, that doesn't necessarily mean we don't travel there — reach out and we'll confirm availability.",
  },
  {
    question: "Are you insured?",
    answer:
      "Yes. We carry general liability insurance (up to $1M) for residential pressure washing services in Atlanta and surrounding areas. We believe homeowners should never have to worry about that side of things.",
  },
] as const;
