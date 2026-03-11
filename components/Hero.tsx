"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, MessageText, Phone } from "iconoir-react";
import Image from "next/image";
import { EstimateForm, type ReviewData } from "@/components/EstimateForm";
import { trackContactClick } from "@/lib/analytics";
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
  const prefersReducedMotion = useReducedMotion();

  const getEntranceOpacity = (minStage: number) => {
    return prefersReducedMotion ? 1 : stage >= minStage ? 1 : 0;
  };

  const getEntranceY = (minStage: number) => {
    return prefersReducedMotion ? 0 : stage >= minStage ? 0 : ENTRANCE.offsetY;
  };

  const entranceTransition = prefersReducedMotion ? { duration: 0 } : ENTRANCE.spring;

  useEffect(() => {
    if (prefersReducedMotion) {
      setStage(4);
      return;
    }

    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => setStage(1), TIMING.eyebrow));
    timers.push(setTimeout(() => setStage(2), TIMING.headline));
    timers.push(setTimeout(() => setStage(3), TIMING.subhead));
    timers.push(setTimeout(() => setStage(4), TIMING.formCard));

    return () => timers.forEach(clearTimeout);
  }, [prefersReducedMotion]);

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
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <Image
            src={asphaltDarkJpg}
            alt=""
            aria-hidden
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-20"
          />
        </div>
      )}

      {/* ── Content ───────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-[1400px] w-full px-5 sm:px-8 py-24 sm:py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-start">

          {/* ── Left column: text + social proof ──────────── */}
          <div>

            {/* Headline */}
            <motion.p
              className="font-heading font-bold uppercase tracking-[0.2em] text-eav-orange-bright text-[14px] mb-8"
              initial={prefersReducedMotion ? false : { opacity: 0, y: ENTRANCE.offsetY }}
              animate={{
                opacity: getEntranceOpacity(1),
                y: getEntranceY(1),
              }}
              transition={entranceTransition}
            >
              PRESSURE WASHING IN ATLANTA
            </motion.p>
            
            <motion.h1
              id="hero-heading"
              className="font-heading font-bold uppercase text-eav-white leading-[1] tracking-tight"
              style={{ fontSize: "clamp(3.2rem, 8vw, 5rem)" }}
              initial={prefersReducedMotion ? false : { opacity: 0, y: ENTRANCE.offsetY }}
              animate={{
                opacity: getEntranceOpacity(2),
                y: getEntranceY(2),
              }}
              transition={entranceTransition}
            >
              Make your concrete feel like new again.
            </motion.h1>

            {/* Subhead + phone CTA */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: ENTRANCE.offsetY }}
              animate={{
                opacity: getEntranceOpacity(3),
                y: getEntranceY(3),
              }}
              transition={entranceTransition}
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
                  onClick={() =>
                    trackContactClick({ channel: "sms", placement: "hero" })
                  }
                  className="inline-flex items-center gap-2.5 bg-eav-orange text-eav-white font-body font-semibold text-sm sm:text-base px-7 py-3.5 rounded-sm hover:brightness-120 active:scale-[0.98] transition-all"
                >
                  <MessageText className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  Send us a Text
                </a>

                {/* Tertiary: phone */}
                <a
                  href="tel:+14703009995"
                  onClick={() =>
                    trackContactClick({ channel: "phone", placement: "hero" })
                  }
                  className="flex items-center gap-2 text-eav-cream font-body text-base font-semibold hover:text-eav-cream/80 transition-colors"
                >
                  <Phone className="h-[18px] w-[18px] shrink-0 text-eav-orange" aria-hidden="true" />
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
            initial={prefersReducedMotion ? false : { opacity: 0, y: ENTRANCE.offsetY }}
            animate={{
              opacity: getEntranceOpacity(4),
              y: getEntranceY(4),
            }}
            transition={entranceTransition}
          >
            <div className="relative bg-eav-cream rounded-sm overflow-hidden">
              {/* Card header */}
              <div className="px-5 pt-4 pb-4">
                <h2 className="font-heading font-bold uppercase text-[24px] text-eav-black">
                  Get a Free Estimate
                </h2>
              </div>

              {/* Embedded form — manages its own px so progress bar bleeds */}
              <div>
                <EstimateForm
                  key={estimateFormKey}
                  variant="light"
                  inCard
                  onSubmitted={() => setEstimateSuccess(true)}
                />
              </div>

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
                        <Check className="h-7 w-7" aria-hidden="true" />
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
