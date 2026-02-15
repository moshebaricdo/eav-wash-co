"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";

import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import drivewayDirty1 from "@/assets/before-afters/driveway-dirty-1.avif";
import drivewayClean1 from "@/assets/before-afters/driveway-clean-1.avif";
import patioDirty1 from "@/assets/before-afters/patio-dirty-1.avif";
import patioClean1 from "@/assets/before-afters/patio-clean-1.avif";
import deckDirty1 from "@/assets/before-afters/deck-dirty-1.avif";
import deckClean1 from "@/assets/before-afters/deck-clean-1.avif";

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
  description: string;
  beforeAfters: { label: string; before: StaticImageData; after: StaticImageData; aspect: string }[];
  images: { label: string; aspect: string; src?: StaticImageData }[];
}[] = [
  {
    name: "Driveway",
    description:
      "A clean driveway changes the whole first impression of your home. Our driveway pressure washing service removes oil spots, tire marks, algae, and ground-in grime from concrete so your entrance looks bright, sharp, and cared for again. We use the right pressure and technique for residential concrete cleaning in Atlanta, so you get a deep clean without chewing up the surface.",
    beforeAfters: [
      { label: "Driveway", before: drivewayDirty1, after: drivewayClean1, aspect: "aspect-[16/9]" },
    ],
    images: [],
  },
  {
    name: "Patio & Deck",
    description:
      "Patios and decks take a beating in Atlanta heat, shade, and rain. Our patio and deck pressure washing service lifts algae, mildew, dirt, and stains from pavers, stone, concrete, and wood so your outdoor space feels fresh, safe, and ready to use again. Whether you are hosting friends or just want your backyard back, we focus on detail-driven exterior cleaning that restores curb appeal without harsh treatment.",
    beforeAfters: [
      { label: "Patio", before: patioDirty1, after: patioClean1, aspect: "aspect-[4/3]" },
      { label: "Deck", before: deckDirty1, after: deckClean1, aspect: "aspect-[4/3]" },
    ],
    images: [],
  },
  {
    name: "Walkway",
    description:
      "Walkways and sidewalks get dirty fast from foot traffic, weather, and runoff. We clean concrete and paver paths to clear dark buildup and slippery spots, so the route to your front door looks sharp and feels safer underfoot.",
    beforeAfters: [],
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
    const onScroll = () => {
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

      setActiveIndex(best);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // set initial state
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Click-to-scroll on nav names ─────────────────── */
  const scrollTo = useCallback((i: number) => {
    panelRefs.current[i]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

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
          <div className="hidden lg:block pb-16 sm:pb-20 lg:pb-28" aria-hidden="true">
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
                      fontSize: "clamp(2.8rem, 6.5vw, 5.5rem)",
                    }}
                    animate={{
                      color:
                        i === activeIndex
                          ? NAV.activeColor
                          : NAV.inactiveColor,
                    }}
                    transition={NAV.spring}
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
                      transition={NAV.spring}
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
          <div className="pb-16 sm:pb-20 lg:pb-36">
            {SERVICES.map((s, i) => (
              <div
                key={s.name}
                ref={setRef(i)}
                className={`flex items-start border-eav-black/10 ${
                  i === 0
                    ? "pt-0 pb-10"
                    : "border-t pt-10 pb-10"
                } lg:min-h-[70vh] lg:pt-12 lg:pb-12`}
              >
                <motion.div
                  animate={{
                    opacity: isDesktop
                      ? i === activeIndex
                        ? PANEL.activeOpacity
                        : PANEL.inactiveOpacity
                      : 1,
                  }}
                  transition={PANEL.spring}
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
                  <p className="font-body text-eav-black/80 text-base sm:text-lg leading-relaxed">
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
