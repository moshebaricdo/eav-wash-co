"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image, { type StaticImageData } from "next/image";

/* ─────────────────────────────────────────────────────────
 * BEFORE / AFTER SLIDER
 *
 * Draggable comparison slider. "Before" is revealed on the
 * left, "After" on the right. Handle starts at 50%.
 *
 * Labels:
 *   bottom-left  → "Before" (black bg)
 *   bottom-right → "After"  (orange bg)
 * ───────────────────────────────────────────────────────── */

interface BeforeAfterSliderProps {
  before: StaticImageData;
  after: StaticImageData;
  alt?: string;
  className?: string;
  showLabels?: boolean;
}

export function BeforeAfterSlider({
  before,
  after,
  alt = "Before and after comparison",
  className = "",
  showLabels = true,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50); // percentage 0–100
  const isDragging = useRef(false);

  /* ── Resolve pointer X to a 0–100 percentage ────────── */
  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - left) / width) * 100));
    setPosition(pct);
  }, []);

  /* ── Pointer events ─────────────────────────────────── */
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition],
  );

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  /* Prevent image drag ghost */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e: DragEvent) => e.preventDefault();
    el.addEventListener("dragstart", prevent);
    return () => el.removeEventListener("dragstart", prevent);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-sm ${className}`}
      style={{ touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* After image — full width, sits behind */}
      <Image
        src={after}
        alt={`${alt} — after`}
        fill
        sizes="(max-width: 1024px) 90vw, 40vw"
        className="object-cover pointer-events-none"
        placeholder="blur"
        draggable={false}
      />

      {/* Before image — clipped to the left of the handle */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <Image
          src={before}
          alt={`${alt} — before`}
          fill
          sizes="(max-width: 1024px) 90vw, 40vw"
          className="object-cover pointer-events-none"
          style={{ minWidth: containerRef.current?.offsetWidth ?? "100%" }}
          placeholder="blur"
          draggable={false}
        />
      </div>

      {/* ── Slider handle ──────────────────────────────── */}
      <div
        className="absolute top-0 bottom-0 z-10"
        style={{ left: `${position}%` }}
      >
        {/* Vertical line */}
        <div className="absolute top-0 bottom-0 -translate-x-1/2 w-[2px] bg-eav-cream" />

        {/* Drag grip */}
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-black shadow-lg flex items-center justify-center cursor-ew-resize">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-eav-white"
          >
            <path
              d="M4.5 3L1.5 8L4.5 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.5 3L14.5 8L11.5 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* ── Labels ─────────────────────────────────────── */}
      {showLabels && (
        <>
          <span className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-sm bg-eav-black text-white text-[12px] font-heading font-bold uppercase tracking-[0.1em]">
            Before
          </span>
          <span className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-sm bg-eav-orange text-white text-[12px] font-heading font-bold uppercase tracking-[0.1em]">
            After
          </span>
        </>
      )}
    </div>
  );
}
