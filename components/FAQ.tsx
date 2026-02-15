"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { BUSINESS, FAQS } from "@/app/seo";

const COST_FAQ_QUESTION = "How much does pressure washing cost in the Atlanta area?";
const FAQ_LINK_CLASS =
  "text-eav-orange underline underline-offset-2 hover:text-eav-black transition-colors";

/* ─────────────────────────────────────────────────────────
 * FAQ SECTION ANIMATION STORYBOARD
 *
 *    0ms   waiting for scroll into view
 *  200ms   eyebrow fades in
 *  400ms   headline fades up
 *  600ms+  FAQ items stagger in (100ms apart)
 * ───────────────────────────────────────────────────────── */

const ANIM = {
  offsetY: 16,
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
};

/* ─── Accordion item ───────────────────────────────────── */

function FAQItem({
  faq,
  index,
  isOpen,
  onToggle,
  isInView,
}: {
  faq: (typeof FAQS)[number];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  isInView: boolean;
}) {
  return (
    <motion.div
      className="border-b border-eav-black/10"
      initial={{ opacity: 0, y: ANIM.offsetY }}
      animate={{
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : ANIM.offsetY,
      }}
      transition={{ ...ANIM.spring, delay: 0.6 + index * 0.1 }}
    >
      <button
        type="button"
        className="w-full flex items-center justify-between gap-6 py-7 sm:py-8 text-left cursor-pointer group"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span
          className="font-heading font-bold uppercase tracking-tight text-eav-black group-hover:text-eav-orange transition-colors leading-[1.1]"
          style={{ fontSize: "clamp(1.25rem, 2.5vw, 2rem)" }}
        >
          {faq.question}
        </span>
        <motion.span
          className="flex-shrink-0 text-eav-orange leading-none select-none"
          style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={ANIM.spring}
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="font-body text-eav-black/80 text-base leading-relaxed pb-8 max-w-6xl space-y-4">
              {faq.answer.split(/\n\n+/).map((paragraph, i) =>
                faq.question === COST_FAQ_QUESTION && i === 1 ? (
                  <p key={i}>
                    We provide custom estimates based on your property details.
                    The easiest way to get started is by filling out{" "}
                    <a
                      href="#estimate-form"
                      className={FAQ_LINK_CLASS}
                    >
                      our estimate form at the top of this page
                    </a>{" "}
                    or reaching out directly by{" "}
                    <a
                      href={BUSINESS.telephoneHref}
                      className={FAQ_LINK_CLASS}
                    >
                      phone
                    </a>{" "}
                    or{" "}
                    <a
                      href={`mailto:${BUSINESS.email}`}
                      className={FAQ_LINK_CLASS}
                    >
                      email
                    </a>
                    .
                  </p>
                ) : (
                  <p key={i}>{paragraph}</p>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Component ────────────────────────────────────────── */

export function FAQ() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      ref={ref}
      id="faq"
      aria-labelledby="faq-heading"
      data-header-theme="light"
      className="bg-eav-cream text-eav-black py-16 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-6">
          <motion.p
            className="font-heading font-bold uppercase tracking-[0.2em] text-eav-orange text-[14px] mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
            transition={{ ...ANIM.spring, delay: 0.2 }}
          >
            FREQUENTLY ASKED QUESTIONS
          </motion.p>
          <h2 id="faq-heading" className="sr-only">
            Frequently asked questions about pressure washing services
          </h2>
        </div>

        {/* FAQ list — true full container width */}
        <div>
          {FAQS.map((faq, i) => (
            <FAQItem
              key={faq.question}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
