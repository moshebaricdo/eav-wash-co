"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EstimateForm, type ReviewData } from "@/components/EstimateForm";
import asphaltDarkAvif from "@/assets/background/asphalt-dark.avif";
import asphaltDarkJpg from "@/assets/background/asphalt-dark.jpg";


/* ─────────────────────────────────────────────────────────
 * HERO ANIMATION STORYBOARD
 *
 * Read top-to-bottom. Each `at` value is ms after mount.
 *
 *    0ms   page loads, all content invisible
 *  150ms   eyebrow label fades in
 *  350ms   headline fades up
 *  600ms   subhead + phone CTA + review card fade up
 *  800ms   form card fades up (right column)
 * 1000ms   scroll indicator fades in
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  eyebrow:  150,
  headline: 350,
  subhead:  600,
  formCard: 800,
};

const ENTRANCE = {
  offsetY: 24,
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
};

/* ─── Mini review data ─────────────────────────────────── */

const REVIEW: ReviewData = {
  stars: 5,
  quote: "Transformed our driveway, looked brand new. Fast, reasonably priced, and no hassle.",
  name: "Sarah K.",
  location: "Grant Park",
};

/* ─── Component ────────────────────────────────────────── */

export function Hero() {
  const [stage, setStage] = useState(0);
  const [showDesktopTexture, setShowDesktopTexture] = useState(false);
  const [estimateSuccess, setEstimateSuccess] = useState(false);
  const [estimateFormKey, setEstimateFormKey] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => setStage(1), TIMING.eyebrow));
    timers.push(setTimeout(() => setStage(2), TIMING.headline));
    timers.push(setTimeout(() => setStage(3), TIMING.subhead));
    timers.push(setTimeout(() => setStage(4), TIMING.formCard));

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const updateTextureVisibility = () => setShowDesktopTexture(media.matches);

    updateTextureVisibility();
    media.addEventListener("change", updateTextureVisibility);

    return () => media.removeEventListener("change", updateTextureVisibility);
  }, []);

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      data-header-theme="dark"
      className="relative min-h-dvh flex items-center overflow-hidden bg-eav-black"
    >
      {showDesktopTexture && (
        <picture className="absolute inset-0 z-0 block pointer-events-none select-none">
          <source srcSet={asphaltDarkAvif.src} type="image/avif" />
          <img
            src={asphaltDarkJpg.src}
            alt=""
            aria-hidden
            className="h-full w-full object-cover opacity-20"
            loading="eager"
            decoding="async"
          />
        </picture>
      )}

      {/* ── Content ───────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-[1400px] w-full px-5 sm:px-8 py-24 sm:py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-start">

          {/* ── Left column: text + social proof ──────────── */}
          <div>

            {/* Headline */}
            <motion.p
              className="font-heading font-bold uppercase tracking-[0.2em] text-eav-orange-bright text-[14px] mb-8"
              initial={{ opacity: 0, y: ENTRANCE.offsetY }}
              animate={{
                opacity: stage >= 1 ? 1 : 0,
                y: stage >= 1 ? 0 : ENTRANCE.offsetY,
              }}
              transition={ENTRANCE.spring}
            >
              PRESSURE WASHING IN ATLANTA
            </motion.p>
            
            <motion.h1
              id="hero-heading"
              className="font-heading font-bold uppercase text-eav-white leading-[1] tracking-tight"
              style={{ fontSize: "clamp(3.2rem, 8vw, 5rem)" }}
              initial={{ opacity: 0, y: ENTRANCE.offsetY }}
              animate={{
                opacity: stage >= 2 ? 1 : 0,
                y: stage >= 2 ? 0 : ENTRANCE.offsetY,
              }}
              transition={ENTRANCE.spring}
            >
              Make your concrete feel like new again.
            </motion.h1>

            {/* Subhead + phone CTA */}
            <motion.div
              initial={{ opacity: 0, y: ENTRANCE.offsetY }}
              animate={{
                opacity: stage >= 3 ? 1 : 0,
                y: stage >= 3 ? 0 : ENTRANCE.offsetY,
              }}
              transition={ENTRANCE.spring}
              className="mt-8 sm:mt-9"
            >
              <p className="font-body text-eav-cream text-base sm:text-lg max-w-xl">
                We offer pressure washing services for homeowners, focusing on driveways, patios, decks, and walkways, right here in East Atlanta and all of the Metro Atlanta area.
              </p>

              {/* Contact CTAs */}
              <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-6">
                {/* Primary: text us */}
                <a
                  href="sms:+14703009995"
                  className="inline-flex items-center gap-2.5 bg-eav-orange text-eav-white font-body font-semibold text-sm sm:text-base px-7 py-3.5 rounded-sm hover:brightness-120 active:scale-[0.98] transition-all"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px] shrink-0">
                    <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0 1 10 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.102 41.102 0 0 1-3.55.414c-.28.02-.521.18-.643.413l-1.712 3.293a.75.75 0 0 1-1.33 0l-1.713-3.293a.783.783 0 0 0-.642-.413 41.108 41.108 0 0 1-3.55-.414C1.993 13.245 1 11.986 1 10.574V5.426c0-1.413.993-2.67 2.43-2.902ZM6 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm3 1a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" clipRule="evenodd" />
                  </svg>
                  Send us a Text
                </a>

                {/* Tertiary: phone */}
                <a
                  href="tel:+14703009995"
                  className="flex items-center gap-2 text-eav-cream font-body text-base font-semibold hover:text-eav-cream/80 transition-colors"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px] text-eav-orange shrink-0">
                    <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z" clipRule="evenodd" />
                  </svg>
                  (470) 300-9995
                </a>
              </div>

              {/* Divider */}
              <div className="mt-10 sm:mt-12 h-px w-12 bg-eav-cream/20" />

              {/* Social proof */}
              <div className="mt-6 sm:mt-8 max-w-xs">
                <p className="font-body text-eav-cream/80 text-sm leading-relaxed">
                  &ldquo;{REVIEW.quote}&rdquo;
                </p>
                <div className="mt-1.5 flex items-center gap-2.5">
                  <div className="flex gap-0.5 text-eav-orange text-xs leading-none">
                    {Array.from({ length: REVIEW.stars }).map((_, i) => (
                      <span key={i}>&#9733;</span>
                    ))}
                  </div>
                  <p className="font-body text-eav-cream/60 text-xs">
                    {REVIEW.name}, {REVIEW.location}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Right column: estimate form card ──────────── */}
          <motion.div
            id="estimate-form"
            className="scroll-mt-28"
            initial={{ opacity: 0, y: ENTRANCE.offsetY }}
            animate={{
              opacity: stage >= 4 ? 1 : 0,
              y: stage >= 4 ? 0 : ENTRANCE.offsetY,
            }}
            transition={ENTRANCE.spring}
          >
            <div className="relative bg-eav-cream rounded-sm overflow-hidden">
              {/* Card header */}
              <div className="px-5 pt-4 pb-4">
                <h2 className="font-heading font-bold uppercase text-[24px] text-eav-black">
                  Get a Free Estimate
                </h2>
              </div>

              {/* Embedded form — manages its own px so progress bar bleeds */}
              <EstimateForm
                key={estimateFormKey}
                variant="light"
                inCard
                onSubmitted={() => setEstimateSuccess(true)}
              />

              <AnimatePresence>
                {estimateSuccess && (
                  <motion.div
                    className="absolute inset-0 z-20 origin-bottom bg-eav-orange"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    exit={{ scaleY: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 30 }}
                  >
                    <motion.div
                      className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-eav-white"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.16 }}
                    >
                      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-eav-white/90">
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          className="h-7 w-7"
                          aria-hidden="true"
                        >
                          <path
                            d="M4 10.5L8.2 14.6L16 6.8"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <p className="mt-5 font-heading font-bold uppercase tracking-[0.08em] text-[24px]">
                        Request Sent
                      </p>
                      <p className="mt-2 max-w-[28ch] font-body text-sm text-eav-white/90">
                        We will reach out shortly with your estimate.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEstimateSuccess(false);
                          setEstimateFormKey((k) => k + 1);
                        }}
                        className="mt-6 inline-flex h-11 items-center justify-center rounded-sm border-2 border-eav-white px-5 font-body text-sm font-semibold text-eav-white transition-all hover:bg-eav-white/10 active:scale-[0.98]"
                      >
                        Submit Another Request
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

    </section>
  );
}
