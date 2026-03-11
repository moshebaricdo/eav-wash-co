"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

import streetSign from "@/assets/decorative/street-sign.avif";

/* ─────────────────────────────────────────────────────────
 * ABOUT SECTION ANIMATION STORYBOARD
 *
 *    0ms   waiting for scroll into view
 *  200ms   eyebrow fades in
 *  400ms   headline fades up
 *  600ms   body copy fades up
 *  700ms   street sign image fades in
 *  800ms   service areas fade up
 * ───────────────────────────────────────────────────────── */

const ANIM = {
  offsetY: 16,
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
};

/* ── Service areas ───────────────────────────────────────── */

const CORE_NEIGHBORHOODS = [
  "East Atlanta",
  "Ormewood Park",
  "Grant Park",
  "Kirkwood",
  "Edgewood",
  "East Lake",
  "Candler Park",
  "Inman Park",
  "Virginia Highland",
  "Little Five Points",
  "Buckhead",
  "Morningside",
  "Old Fourth Ward",
  "Reynoldstown",
  "Cabbagetown",
  "and more..."
];

const GREATER_METRO = [
  "Decatur",
  "Tucker",
  "Brookhaven",
  "Chamblee",
  "Sandy Springs",
  "Dunwoody",
  "Marietta",
  "Kennesaw",
  "Roswell",
  "Alpharetta",
  "Johns Creek",
  "Cumming",
  "Buford",
  "Lawrenceville",
  "Duluth",
  "and more..."
];

export function About() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      aria-labelledby="about-heading"
      data-header-theme="dark"
      className="relative bg-eav-black text-eav-cream py-16 sm:py-20 lg:py-28"
    >
      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          {/* Left column — headline + street sign in empty space below */}
          <div className="relative flex flex-col min-h-0">
            <motion.p
              className="font-heading font-bold uppercase tracking-[0.2em] text-eav-orange-bright text-[14px] mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: isInView ? 1 : 0 }}
              transition={{ ...ANIM.spring, delay: 0.2 }}
            >
              Who We Are
            </motion.p>

            <motion.h2
              id="about-heading"
              className="font-heading font-bold uppercase text-eav-white leading-[1] tracking-tight"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              initial={{ opacity: 0, y: ANIM.offsetY }}
              animate={{
                opacity: isInView ? 1 : 0,
                y: isInView ? 0 : ANIM.offsetY,
              }}
              transition={{ ...ANIM.spring, delay: 0.4 }}
            >
              You have the concrete,
              <br />
              we'll bring the pressure.
            </motion.h2>

            {/* Street sign — fills empty space below heading, aspect ratio preserved */}
            <motion.div
              className="relative mt-8 lg:mt-16 -mb-24 lg:-mb-28 ml-8 flex-1 min-h-[160px] sm:min-h-[200px] hidden lg:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: isInView ? 1 : 0 }}
              transition={{ ...ANIM.spring, delay: 0.7 }}
            >
              <Image
                src={streetSign}
                alt=""
                aria-hidden
                fill
                className="object-contain object-left-bottom pointer-events-none"
                sizes="(max-width: 1023px) 100vw, 50vw"
                priority={false}
                unoptimized
              />
            </motion.div>
          </div>

          {/* Right column — body copy + service areas */}
          <div className="lg:pt-12">
            <motion.div
              initial={{ opacity: 0, y: ANIM.offsetY }}
              animate={{
                opacity: isInView ? 1 : 0,
                y: isInView ? 0 : ANIM.offsetY,
              }}
              transition={{ ...ANIM.spring, delay: 0.6 }}
            >
              <p className="font-body text-eav-cream/80 text-base sm:text-base leading-relaxed">
              EAV Wash Co. was started by EAV-residents Trev and Moshe, combining hands-on trade 
              experience with a modern, no-BS approach to service. With backgrounds in property inspection, 
              contracting work, design, and marketing, we saw an opportunity 
              to build something focused and well-run. Pressure washing became our starting point because it's 
              straightforward work that delivers real, visible results when done properly.
              </p>
              <p className="font-body text-eav-cream/70 text-base sm:text-base leading-relaxed mt-4">
              We keep the service list tight and the standards high. No inflated offerings, no pushy upsells, 
              just professional pressure washing for your flat surfaces. We show up on time, communicate 
              clearly, price fairly, and make sure the job is done right.
              </p>
            </motion.div>

            {/* ── Two-tier service area ── */}
            <motion.div
              className="mt-10 pt-10 border-t border-eav-cream/10"
              initial={{ opacity: 0, y: ANIM.offsetY }}
              animate={{
                opacity: isInView ? 1 : 0,
                y: isInView ? 0 : ANIM.offsetY,
              }}
              transition={{ ...ANIM.spring, delay: 0.8 }}
            >
              {/* Core neighborhoods */}
              <div className="mb-6">
                <p className="font-heading font-bold uppercase tracking-[0.15em] text-eav-orange-bright text-[12px] mb-3">
                  Home Base
                </p>
                <p className="font-body text-eav-cream/80 text-sm leading-relaxed">
                  {CORE_NEIGHBORHOODS.join(" · ")}
                </p>
              </div>

              {/* Greater metro */}
              <div>
                <p className="font-heading font-bold uppercase tracking-[0.15em] text-eav-orange-bright text-[12px] mb-3">
                  ITP and Beyond
                </p>
                <p className="font-body text-eav-cream/80 text-sm leading-relaxed">
                  {GREATER_METRO.join(" · ")}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
