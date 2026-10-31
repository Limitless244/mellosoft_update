"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    /* Respect user preference for reduced motion */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.09, // Natural, continuous inertia damping without abrupt jumps
      smoothWheel: true,
      syncTouch: false, // Keep mobile touch 100% native and responsive
      anchors: true, // Smoothly handle anchor links (#products, #about, etc.)
    });

    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    /* Sync Lenis scroll events with GSAP ScrollTrigger */
    lenis.on("scroll", ScrollTrigger.update);

    /* Drive Lenis via GSAP ticker for frame-perfect engine synchronization */
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);

  return null;
}
