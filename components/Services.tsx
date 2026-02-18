"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";

import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import drivewayDirty1 from "@/assets/before-afters/driveway-dirty-1.avif";
import drivewayClean1 from "@/assets/before-afters/driveway-clean-1.avif";
import patioDirty1 from "@/assets/before-afters/patio-dirty-1.avif";
import patioClean1 from "@/assets/before-afters/patio-clean-1.avif";
import deckDirty1 from "@/assets/before-afters/deck-dirty-1.avif";
import deckClean1 from "@/assets/before-afters/deck-clean-1.avif";
import walkwayBefore from "@/assets/before-afters/walkway-before.avif";
import walkwayAfter from "@/assets/before-afters/walkway-after.avif";

/* ─────────────────────────────────────────────────────────
 * SERVICES — SCROLL-DRIVEN STORYBOARD
 *
 * Scroll-linked (not time-based). Active service index is
 * driven by which right-column panel is closest to the
 * viewport center.
 *
 * Left column (sticky, lg+ only):
 *   active name   → opacity 1
 *   inactive name → opacity 0.15
 *   click name    → smooth-scroll to panel
 *
 * Right column (natural scroll):
 *   active panel   → opacity 1
 *   inactive panel → opacity 0.3
 *
 * All transitions → spring { stiffness: 300, damping: 30 }
 * ───────────────────────────────────────────────────────── */

/* ─── Service data ──────────────────────────────────────── */

const SERVICES: {
  name: string;
  descriptionLead: string;
  description: string;
  beforeAfters: { label: string; before: StaticImageData; after: StaticImageData; aspect: string }[];
  images: { label: string; aspect: string; src?: StaticImageData }[];
}[] = [
  {
    name: "Driveway",
    descriptionLead: "Driveways",
    description:
      "take the brunt of daily life. Dirt, organic growth, cars, oil drips, tire marks, and good old Atlanta humidity all leave their mark over time, especially on untreated concrete. We use professional surface cleaning equipment and targeted treatments to break down buildup at the source while protecting the integrity of the slab. You’ll be surprised how much more fresh your property feels with a clean, bright driveway.",
    beforeAfters: [
      { label: "Driveway", before: drivewayDirty1, after: drivewayClean1, aspect: "aspect-[16/9]" },
    ],
    images: [],
  },
  {
    name: "Patio & Deck",
    descriptionLead: "Decks and patios",
    description:
      "deal with constant exposure to heat, moisture, and shade. That mix is the perfect recipe for algae, mildew, and surface staining. Each material requires a different approach. Concrete and pavers can handle deeper, high-pressure surface cleaning, while wood demands a more gentle approach and special chemical solutions. We adjust our methods based on the material we’re working with so the space is refreshed without unnecessary wear and tear. The result is a patio or deck that feels clean, solid underfoot, and ready to show off again.",
    beforeAfters: [
      { label: "Patio", before: patioDirty1, after: patioClean1, aspect: "aspect-[4/3]" },
      { label: "Deck", before: deckDirty1, after: deckClean1, aspect: "aspect-[4/3]" },
    ],
    images: [],
  },
  {
    name: "Walkway",
    descriptionLead: "Walkways and sidewalks",
    description:
      "accumulate grime gradually, which is why many homeowners don’t notice how dark they’ve become until they’re cleaned. Runoff, foot traffic, and organic growth create uneven discoloration and slick spots, especially in shaded areas. We restore a more even, consistent surface, from your portion of the sidewalk right up to your doorstep, improving both appearance and traction. It’s a small upgrade that noticeably sharpens the overall look of a property.",
    beforeAfters: [
      { label: "Walkway", before: walkwayBefore, after: walkwayAfter, aspect: "aspect-[16/9]" },
    ],
    images: [],
  },
];

/* ─── Trust badges ──────────────────────────────────────── */

const BADGES = [
  { icon: "✦", label: "Fully Insured" },
  { icon: "✦", label: "Locally Owned" },
  { icon: "✦", label: "Free Estimates" },
];

/* ─── Animation configs ─────────────────────────────────── */

const NAV = {
  activeColor:   "#1A1A1A",   // eav-black — full contrast
  inactiveColor: "#D0C9BC",   // warm muted — blends toward cream
  accentColor:   "#FB532C",   // eav-orange — active period only
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
};

const PANEL = {
  activeOpacity:   1,      // fully visible
  inactiveOpacity: 0.3,    // dimmed but readable
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
};

/* ─── Component ─────────────────────────────────────────── */

export function Services() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndexRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const navTransition = prefersReducedMotion ? { duration: 0 } : NAV.spring;
  const panelTransition = prefersReducedMotion ? { duration: 0 } : PANEL.spring;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  /* ── Scroll-linked active tracking ────────────────────
   * On every scroll frame, find the panel whose vertical
   * center is closest to the viewport center. That panel
   * becomes "active," lighting up its name on the left.
   * ──────────────────────────────────────────────────── */
  useEffect(() => {
    const updateActivePanel = () => {
      const vpCenter = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;

      panelRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - vpCenter);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });

      if (best !== activeIndexRef.current) {
        activeIndexRef.current = best;
        setActiveIndex(best);
      }
    };

    const onScroll = () => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;
        updateActivePanel();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateActivePanel(); // set initial state
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  /* ── Click-to-scroll on nav names ─────────────────── */
  const scrollTo = useCallback((i: number) => {
    panelRefs.current[i]?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center",
    });
  }, [prefersReducedMotion]);

  /* Callback ref factory — stable across renders */
  const setRef = useCallback(
    (i: number) => (el: HTMLDivElement | null) => {
      panelRefs.current[i] = el;
    },
    [],
  );

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      data-header-theme="light"
      className="bg-eav-cream text-eav-black"
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <h2 id="services-heading" className="sr-only">
          Pressure washing services in Atlanta
        </h2>
        {/* ── Two-column scroll layout ── */}
        <div className="pt-12 sm:pt-16 lg:pt-24 lg:grid lg:grid-cols-2 lg:gap-10">
          {/* Left: sticky service nav (desktop only) */}
          <div className="hidden lg:block pb-16 sm:pb-20 lg:pb-30" aria-hidden="true">
            <div className="sticky top-24">
              <nav>
                <p className="font-heading font-bold uppercase tracking-[0.2em] text-eav-orange text-[14px] mb-6">
                  What We Wash
                </p>
                {SERVICES.map((s, i) => (
                  <motion.button
                    key={s.name}
                    type="button"
                    className="block font-heading font-bold uppercase leading-[1] tracking-tight text-left cursor-pointer"
                    style={{
                      fontSize: "clamp(2.8rem, 6.5vw, 5rem)",
                    }}
                    animate={{
                      color:
                        i === activeIndex
                          ? NAV.activeColor
                          : NAV.inactiveColor,
                    }}
                    transition={navTransition}
                    onClick={() => scrollTo(i)}
                    tabIndex={-1}
                  >
                    {s.name}
                    <motion.span
                      animate={{
                        color:
                          i === activeIndex
                            ? NAV.accentColor
                            : NAV.inactiveColor,
                      }}
                      transition={navTransition}
                    >
                      .
                    </motion.span>
                  </motion.button>
                ))}
              </nav>

              {/* Trust badges */}
              <div className="mt-14 flex flex-wrap gap-3">
                {BADGES.map((b) => (
                  <div
                    key={b.label}
                    className="flex items-center gap-2.5 rounded-full border border-eav-black/20 px-4 py-2"
                  >
                    <span className="text-eav-orange text-base leading-none">
                      {b.icon}
                    </span>
                    <span className="font-heading font-bold uppercase text-[12px] tracking-[0.12em] text-eav-black/70">
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: scrollable content panels */}
          <div className="space-y-8 lg:pt-13 pb-16 sm:pb-16 lg:space-y-12 lg:pb-30">
            {SERVICES.map((s, i) => (
              <div
                key={s.name}
                ref={setRef(i)}
                className="flex items-start"
              >
                <motion.div
                  animate={{
                    opacity: isDesktop
                      ? i === activeIndex
                        ? PANEL.activeOpacity
                        : PANEL.inactiveOpacity
                      : 1,
                  }}
                  transition={panelTransition}
                >
                  {/* Mobile: eyebrow on first panel + inline service name */}
                  {i === 0 && (
                    <p className="lg:hidden font-heading font-bold uppercase tracking-[0.2em] text-eav-orange text-[14px] mb-6">
                      What We Wash
                    </p>
                  )}
                  <h3
                    className="lg:hidden font-heading font-bold uppercase leading-[1] tracking-tight mb-6"
                    style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)" }}
                  >
                    {s.name}
                    <span className="text-eav-orange">.</span>
                  </h3>

                  {/* Description */}
                  <p className="font-body text-eav-black/80 text-base leading-relaxed">
                    <strong className="font-semibold text-eav-black">{s.descriptionLead} </strong>
                    {s.description}
                  </p>

                  {/* Before/After sliders */}
                  {s.beforeAfters.length > 0 && (
                    <div
                      className={`mt-8 grid gap-4 ${
                        s.beforeAfters.length > 1
                          ? "grid-cols-1 sm:grid-cols-2"
                          : "grid-cols-1"
                      }`}
                    >
                      {s.beforeAfters.map((ba) => (
                        <BeforeAfterSlider
                          key={ba.label}
                          before={ba.before}
                          after={ba.after}
                          service={ba.label}
                          alt={`${ba.label} before and after`}
                          className={s.beforeAfters.length > 1 ? "aspect-[4/3]" : ba.aspect}
                          showLabels={s.beforeAfters.length === 1}
                        />
                      ))}
                    </div>
                  )}

                  {/* Images */}
                  {s.images.length > 0 && (
                    <div
                      className={`mt-8 grid gap-4 ${
                        s.images.length > 1
                          ? "grid-cols-2"
                          : "grid-cols-1"
                      }`}
                    >
                      {s.images.map((img) => (
                        <div
                          key={img.label}
                          className={`${s.images.length > 1 ? "aspect-[4/3]" : img.aspect} relative bg-eav-black/[0.06] rounded-sm overflow-hidden`}
                        >
                          {img.src ? (
                            <Image
                              src={img.src}
                              alt={img.label}
                              fill
                              sizes="(max-width: 1024px) 90vw, 40vw"
                              className="object-cover"
                              placeholder="blur"
                            />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-eav-muted text-sm font-body">
                              {img.label}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
