"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/* ─────────────────────────────────────────────────────────
 * WORK SECTION ANIMATION STORYBOARD
 *
 *    0ms   waiting for scroll into view
 *  200ms   heading fades in
 *  400ms   images stagger in (200ms apart)
 * ───────────────────────────────────────────────────────── */

const ANIM = {
  offsetY: 20,
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
  stagger: 0.2,
};

/* Placeholder image slots — swap with real photos later */
const WORK_ITEMS = [
  { id: 1, label: "Driveway restoration", aspect: "aspect-[4/3]" },
  { id: 2, label: "Patio deep clean", aspect: "aspect-[3/4]" },
  { id: 3, label: "Deck refinish", aspect: "aspect-[4/3]" },
];

export function Work() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-eav-black py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        {/* Heading */}
        <motion.p
          className="font-heading font-bold uppercase tracking-[0.2em] text-eav-orange text-[14px] mb-10 sm:mb-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView ? 1 : 0 }}
          transition={{ ...ANIM.spring, delay: 0.2 }}
        >
          The Work
        </motion.p>

        {/* Asymmetric photo grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
          {/* Large image — spans 7 columns */}
          <motion.div
            className="md:col-span-7"
            initial={{ opacity: 0, y: ANIM.offsetY }}
            animate={{
              opacity: isInView ? 1 : 0,
              y: isInView ? 0 : ANIM.offsetY,
            }}
            transition={{ ...ANIM.spring, delay: 0.4 }}
          >
            <div className="aspect-[4/3] bg-eav-gray rounded-sm overflow-hidden flex items-center justify-center">
              <span className="text-eav-muted text-sm font-body">
                {WORK_ITEMS[0].label}
              </span>
            </div>
          </motion.div>

          {/* Stacked images — spans 5 columns */}
          <div className="md:col-span-5 flex flex-col gap-4 sm:gap-5">
            <motion.div
              initial={{ opacity: 0, y: ANIM.offsetY }}
              animate={{
                opacity: isInView ? 1 : 0,
                y: isInView ? 0 : ANIM.offsetY,
              }}
              transition={{ ...ANIM.spring, delay: 0.6 }}
            >
              <div className="aspect-[3/2] bg-eav-gray rounded-sm overflow-hidden flex items-center justify-center">
                <span className="text-eav-muted text-sm font-body">
                  {WORK_ITEMS[1].label}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: ANIM.offsetY }}
              animate={{
                opacity: isInView ? 1 : 0,
                y: isInView ? 0 : ANIM.offsetY,
              }}
              transition={{ ...ANIM.spring, delay: 0.8 }}
            >
              <div className="aspect-[3/2] bg-eav-gray rounded-sm overflow-hidden flex items-center justify-center">
                <span className="text-eav-muted text-sm font-body">
                  {WORK_ITEMS[2].label}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
