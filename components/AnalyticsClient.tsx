"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { captureAttributionFromLocation } from "@/lib/attribution";

const SCROLL_THRESHOLDS = [25, 50, 75, 90] as const;

function getScrollPercent() {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop;
  const scrollHeight = doc.scrollHeight - window.innerHeight;
  if (scrollHeight <= 0) return 100;
  return Math.round((scrollTop / scrollHeight) * 100);
}

export function AnalyticsClient() {
  const pathname = usePathname();
  const firedDepthsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    captureAttributionFromLocation();
  }, []);

  useEffect(() => {
    firedDepthsRef.current = new Set();

    const handleScroll = () => {
      const currentDepth = getScrollPercent();

      for (const threshold of SCROLL_THRESHOLDS) {
        if (currentDepth >= threshold && !firedDepthsRef.current.has(threshold)) {
          firedDepthsRef.current.add(threshold);
          trackEvent("scroll_depth", { depth_percent: threshold });
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return null;
}
