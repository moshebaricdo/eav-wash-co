import type { Metadata } from "next";
import { BUSINESS, SITE_NAME } from "@/app/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE_NAME}.`,
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <section className="bg-eav-cream text-eav-black py-28 sm:py-32">
      <div className="mx-auto max-w-[900px] px-5 sm:px-8">
        <h1 className="font-heading font-bold uppercase tracking-tight text-[clamp(2rem,5vw,3rem)]">
          Privacy Policy
        </h1>
        <p className="mt-4 font-body text-eav-black/70">
          Last updated: {new Date().toLocaleDateString("en-US")}
        </p>

        <div className="mt-10 space-y-8 font-body text-eav-black/80 leading-relaxed">
          <p>
            {BUSINESS.name} respects your privacy. This page explains what information we collect,
            how we use it, and your choices.
          </p>

          <div>
            <h2 className="font-heading font-bold uppercase text-xl tracking-tight">
              Information We Collect
            </h2>
            <p className="mt-3">
              We collect contact and project details you provide when requesting an estimate,
              including your name, phone, email, address, and notes about your property.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-bold uppercase text-xl tracking-tight">
              How We Use Information
            </h2>
            <p className="mt-3">
              We use your information to provide estimates, schedule services, communicate about
              your request, and improve our website and service quality.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-bold uppercase text-xl tracking-tight">
              Sharing
            </h2>
            <p className="mt-3">
              We do not sell personal information. We may share data with service providers that
              help us operate our business (such as email, hosting, or scheduling tools), subject
              to confidentiality and security obligations.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-bold uppercase text-xl tracking-tight">
              Contact
            </h2>
            <p className="mt-3">
              Questions about this policy can be sent to{" "}
              <a className="underline underline-offset-4" href={`mailto:${BUSINESS.email}`}>
                {BUSINESS.email}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
