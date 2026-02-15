"use client";

import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────
 * EAV VIGNETTE
 *
 * Minimal line-art streetscape of East Atlanta Village
 * storefronts with an "Est. 2025" stamp badge. Cream
 * strokes (~20% opacity) on the dark section background,
 * orange badge accent.
 *
 * Designed for the left column of the About section,
 * sitting below the headline.
 * ───────────────────────────────────────────────────────── */

const C = "rgba(240, 232, 216, 0.2)"; // eav-cream at 20%
const O = "#FB532C"; // eav-orange
const W = 1.5; // stroke width

interface EavVignetteProps {
  isInView?: boolean;
}

export function EavVignette({ isInView = false }: EavVignetteProps) {
  return (
    <motion.div
      className="mt-10 lg:mt-14"
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.7 }}
    >
      <svg
        viewBox="0 0 480 180"
        fill="none"
        className="w-full h-auto"
        aria-hidden="true"
      >
        {/* ── Ground line ── */}
        <line x1="0" y1="155" x2="355" y2="155" stroke={C} strokeWidth={W} />

        {/* ── Building 1 · narrow & tall ── */}
        <rect x="15" y="38" width="50" height="117" stroke={C} strokeWidth={W} />
        {/* upper windows */}
        <rect x="24" y="50" width="13" height="16" stroke={C} strokeWidth={W} />
        <rect x="43" y="50" width="13" height="16" stroke={C} strokeWidth={W} />
        {/* lower windows */}
        <rect x="24" y="76" width="13" height="16" stroke={C} strokeWidth={W} />
        <rect x="43" y="76" width="13" height="16" stroke={C} strokeWidth={W} />
        {/* door */}
        <rect x="32" y="118" width="16" height="37" stroke={C} strokeWidth={W} />

        {/* ── Building 2 · wide with awning ── */}
        <rect x="75" y="56" width="78" height="99" stroke={C} strokeWidth={W} />
        {/* upper windows */}
        <rect x="86" y="66" width="18" height="14" stroke={C} strokeWidth={W} />
        <rect x="124" y="66" width="18" height="14" stroke={C} strokeWidth={W} />
        {/* awning */}
        <path d="M73 100 L155 100 L151 110 L77 110 Z" stroke={C} strokeWidth={W} />
        {/* storefront windows */}
        <rect x="86" y="115" width="22" height="40" stroke={C} strokeWidth={W} />
        <rect x="118" y="115" width="22" height="40" stroke={C} strokeWidth={W} />

        {/* ── Building 3 · gable roof ── */}
        <rect x="163" y="72" width="82" height="83" stroke={C} strokeWidth={W} />
        {/* peaked gable */}
        <path d="M163 72 L204 42 L245 72" stroke={C} strokeWidth={W} />
        {/* round window in gable */}
        <circle cx="204" cy="60" r="6" stroke={C} strokeWidth={W} />
        {/* windows */}
        <rect x="175" y="90" width="20" height="17" stroke={C} strokeWidth={W} />
        <rect x="215" y="90" width="20" height="17" stroke={C} strokeWidth={W} />
        {/* door + knob */}
        <rect x="196" y="125" width="16" height="30" stroke={C} strokeWidth={W} />
        <circle cx="209" cy="142" r="1.5" fill={C} />

        {/* ── Building 4 · flat with sign band ── */}
        <rect x="255" y="65" width="75" height="90" stroke={C} strokeWidth={W} />
        {/* upper windows (3) */}
        <rect x="266" y="76" width="14" height="12" stroke={C} strokeWidth={W} />
        <rect x="290" y="76" width="14" height="12" stroke={C} strokeWidth={W} />
        <rect x="314" y="76" width="14" height="12" stroke={C} strokeWidth={W} />
        {/* sign band */}
        <rect x="261" y="100" width="63" height="10" stroke={C} strokeWidth={W} />
        {/* door + storefront window */}
        <rect x="275" y="120" width="16" height="35" stroke={C} strokeWidth={W} />
        <rect x="300" y="120" width="22" height="35" stroke={C} strokeWidth={W} />

        {/* ── Street lamp ── */}
        <line x1="348" y1="155" x2="348" y2="95" stroke={C} strokeWidth={W} />
        <circle cx="348" cy="88" r="7" stroke={C} strokeWidth={W} />
        <line x1="348" y1="81" x2="348" y2="78" stroke={C} strokeWidth={W} />

        {/* ── Est. 2025 badge ── */}
        <circle cx="412" cy="88" r="32" stroke={O} strokeWidth={2} />
        <circle cx="412" cy="88" r="26" stroke={O} strokeWidth={1} />
        {/* decorative dots */}
        <circle cx="387" cy="88" r="1.5" fill={O} />
        <circle cx="437" cy="88" r="1.5" fill={O} />
        {/* text */}
        <text
          x="412"
          y="83"
          textAnchor="middle"
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.18em",
            fill: O,
            fontFamily: "var(--font-heading), Arial Narrow, sans-serif",
          }}
        >
          EST.
        </text>
        <text
          x="412"
          y="99"
          textAnchor="middle"
          style={{
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: "0.06em",
            fill: O,
            fontFamily: "var(--font-heading), Arial Narrow, sans-serif",
          }}
        >
          2025
        </text>
      </svg>
    </motion.div>
  );
}
