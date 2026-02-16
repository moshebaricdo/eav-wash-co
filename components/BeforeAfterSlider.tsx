"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { ArrowSeparate } from "iconoir-react";
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
  const roundedPosition = Math.round(position);

  const clampPosition = useCallback((value: number) => {
    return Math.min(100, Math.max(0, value));
  }, []);

  /* ── Resolve pointer X to a 0–100 percentage ────────── */
  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    const pct = clampPosition(((clientX - left) / width) * 100);
    setPosition(pct);
  }, [clampPosition]);

  /* ── Pointer events ─────────────────────────────────── */
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
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

  const nudgePosition = useCallback(
    (delta: number) => {
      setPosition((current) => clampPosition(current + delta));
    },
    [clampPosition],
  );

  const onHandleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        nudgePosition(-2);
      } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        nudgePosition(2);
      } else if (e.key === "PageDown") {
        e.preventDefault();
        nudgePosition(-10);
      } else if (e.key === "PageUp") {
        e.preventDefault();
        nudgePosition(10);
      } else if (e.key === "Home") {
        e.preventDefault();
        setPosition(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setPosition(100);
      }
    },
    [nudgePosition],
  );

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
        <div
          role="slider"
          aria-orientation="horizontal"
          tabIndex={0}
          aria-label="Before and after comparison position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={roundedPosition}
          aria-valuetext={`Before ${roundedPosition}% / After ${100 - roundedPosition}%`}
          onKeyDown={onHandleKeyDown}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-eav-black rounded-sm shadow-lg flex items-center justify-center cursor-ew-resize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eav-orange focus-visible:ring-offset-2 focus-visible:ring-offset-eav-black"
        >
          <ArrowSeparate className="h-5 w-5 text-eav-white" aria-hidden="true" />
        </div>
      </div>

      {/* ── Labels ─────────────────────────────────────── */}
      {showLabels && (
        <>
          <span className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-sm bg-eav-black/70 text-white text-[12px] font-heading font-bold uppercase tracking-[0.1em]">
            Before
          </span>
          <span className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-sm bg-eav-orange/90 text-white text-[12px] font-heading font-bold uppercase tracking-[0.1em]">
            After
          </span>
        </>
      )}
    </div>
  );
}
