import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { About } from "@/components/About";
import { FAQ } from "@/components/FAQ";
import { BUSINESS, FAQS, SERVICES, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/app/seo";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    priceRange: BUSINESS.priceRange,
    areaServed: BUSINESS.areaServed,
    address: {
      "@type": "PostalAddress",
      addressLocality: BUSINESS.addressLocality,
      addressRegion: BUSINESS.addressRegion,
      addressCountry: "US",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: BUSINESS.phone,
        email: BUSINESS.email,
        areaServed: "US-GA",
        availableLanguage: "en",
      },
    ],
    serviceType: [...SERVICES],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <Services />
      <div id="about">
        <About />
      </div>
      <FAQ />
    </>
  );
}
