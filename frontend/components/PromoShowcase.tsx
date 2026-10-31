"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag, ArrowRight } from "lucide-react";
import { gsap } from "gsap";

/* ─── TUNABLE CONSTANTS ─────────────────────────────────────────── */
export const PROMO_CONFIG = {
  AUTOPLAY_DELAY: 5000,
  TRANSITION_DURATION: 1.4,
  INTRO_DURATION: 1.1,
  REDUCED_MOTION_DURATION: 0.3,
  FAILSAFE_DELAY: 4000,
  TILT_MAX_DEG: 3,
  ORB_DEPTH_MAX: 30,
};

/* ─── SLIDE DATA ────────────────────────────────────────────────── */
export interface PromoSlide {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  bg: string;
  cardFrom: string;
  cardTo: string;
  accent: string;
  image: string;
  orbTint: string;
  orbShade: string;
}

export const PROMO_SLIDES: PromoSlide[] = [
  {
    id: "walnut",
    name: "Walnut Bed",
    price: "£1,099",
    priceNum: 1099,
    bg: "#F4A47E",
    cardFrom: "#C9642F",
    cardTo: "#6E2F14",
    accent: "#C4561F",
    image: "/images/promo/walnut-bed.png",
    orbTint: "#F6C5B0",
    orbShade: "#8F3610",
  },
  {
    id: "emerald",
    name: "Emerald Bed",
    price: "£1,249",
    priceNum: 1249,
    bg: "#A9D2C8",
    cardFrom: "#2C8576",
    cardTo: "#0F3A33",
    accent: "#1F6F63",
    image: "/images/promo/emerald-bed.png",
    orbTint: "#B2E1D7",
    orbShade: "#0B2D27",
  },
  {
    id: "oak",
    name: "Oak Bed",
    price: "£999",
    priceNum: 999,
    bg: "#E9D4B2",
    cardFrom: "#BE8D56",
    cardTo: "#6A4326",
    accent: "#A8773F",
    image: "/images/promo/oak-bed.png",
    orbTint: "#F4E0C3",
    orbShade: "#54331C",
  },
];

/* ─── 7 FLOATING ORBS DATA ──────────────────────────────────────── */
interface OrbDef {
  id: number;
  size: number;
  left: string;
  top: string;
  zIndex: number;
  depth: number;
  mobileVisible: boolean;
  tabletVisible: boolean;
}

const ORBS_DATA: OrbDef[] = [
  // 4 visible on mobile: #1, #2, #4, #6
  // 5 visible on tablet: #1, #2, #4, #5, #7
  // all 7 on desktop
  { id: 1, size: 76, left: "7%", top: "22%", zIndex: 8, depth: 2.2, mobileVisible: true, tabletVisible: true },
  { id: 2, size: 36, left: "14%", top: "54%", zIndex: 18, depth: 1.2, mobileVisible: true, tabletVisible: true },
  { id: 3, size: 26, left: "33%", top: "13%", zIndex: 6, depth: 0.8, mobileVisible: false, tabletVisible: false },
  { id: 4, size: 86, left: "81%", top: "18%", zIndex: 18, depth: 2.6, mobileVisible: true, tabletVisible: true },
  { id: 5, size: 44, left: "87%", top: "62%", zIndex: 7, depth: 1.1, mobileVisible: false, tabletVisible: true },
  { id: 6, size: 32, left: "74%", top: "74%", zIndex: 19, depth: 1.5, mobileVisible: true, tabletVisible: false },
  { id: 7, size: 52, left: "55%", top: "10%", zIndex: 7, depth: 1.9, mobileVisible: false, tabletVisible: true },
];

/* ─── INLINE SVG BED PLACEHOLDER FALLBACK ────────────────────────── */
function BedSvgFallback({ slide }: { slide: PromoSlide }) {
  return (
    <svg
      viewBox="0 0 680 400"
      className="w-full h-full drop-shadow-2xl select-none pointer-events-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${slide.name} illustration`}
    >
      <defs>
        <radialGradient id={`headboard-grad-${slide.id}`} cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor={slide.cardFrom} />
          <stop offset="100%" stopColor={slide.cardTo} />
        </radialGradient>
        <linearGradient id={`duvet-grad-${slide.id}`} x1="0%" y1="0%" x2="100%" y2="85%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#F7F1EA" />
          <stop offset="100%" stopColor={slide.cardFrom} stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`mattress-grad-${slide.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E5DDD3" />
        </linearGradient>
      </defs>

      {/* Headboard */}
      <rect
        x="120"
        y="45"
        width="440"
        height="200"
        rx="24"
        fill={`url(#headboard-grad-${slide.id})`}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="3.5"
      />
      {/* Decorative headboard tufting / ribs */}
      <path d="M 120 140 Q 340 155 560 140" stroke="rgba(0,0,0,0.22)" strokeWidth="3" />
      <path d="M 230 45 L 230 140 M 340 45 L 340 146 M 450 45 L 450 140" stroke="rgba(0,0,0,0.18)" strokeWidth="2.5" />

      {/* Frame Base */}
      <rect
        x="90"
        y="285"
        width="500"
        height="44"
        rx="12"
        fill={slide.cardTo}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="2"
      />
      {/* Bed Legs */}
      <rect x="110" y="329" width="24" height="38" rx="6" fill={slide.cardTo} />
      <rect x="546" y="329" width="24" height="38" rx="6" fill={slide.cardTo} />

      {/* Mattress */}
      <rect
        x="100"
        y="225"
        width="480"
        height="65"
        rx="14"
        fill={`url(#mattress-grad-${slide.id})`}
        stroke="#D4C8BC"
        strokeWidth="2"
      />

      {/* Pillows */}
      <g filter="drop-shadow(0px 8px 14px rgba(0,0,0,0.25))">
        {/* Back pillows */}
        <rect x="155" y="125" width="160" height="80" rx="16" fill="#ECE4D8" transform="rotate(-4 155 125)" />
        <rect x="365" y="115" width="160" height="80" rx="16" fill="#ECE4D8" transform="rotate(4 365 115)" />
        {/* Front accent pillows */}
        <rect x="180" y="155" width="135" height="70" rx="14" fill="#FFFFFF" />
        <rect x="360" y="155" width="135" height="70" rx="14" fill={slide.accent} opacity="0.95" />
      </g>

      {/* Quilt / Duvet */}
      <path
        d="M 96 248 Q 340 232 584 248 L 584 300 Q 340 312 96 300 Z"
        fill={`url(#duvet-grad-${slide.id})`}
        stroke="#E0D6CB"
        strokeWidth="2"
      />
      {/* Quilt Turnover */}
      <path
        d="M 120 226 Q 340 216 560 226 L 570 252 Q 340 262 110 252 Z"
        fill="#FFFFFF"
        stroke="#E8E2D8"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────────────────────── */
export default function PromoShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const [displayPrice, setDisplayPrice] = useState(PROMO_SLIDES[0].price);

  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const bedStageRef = useRef<HTMLDivElement>(null);
  const bedRefs = useRef<(HTMLDivElement | null)[]>([]);
  const orbsRef = useRef<(HTMLDivElement | null)[]>([]);
  const desktopNameRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tabletNameRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const mobileNameRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Stacked crossfading gradient layers
  const gradLayerARef = useRef<HTMLDivElement>(null);
  const gradLayerBRef = useRef<HTMLDivElement>(null);
  const activeGradLayerRef = useRef<"A" | "B">("A");

  // Sliding swatch rings
  const desktopSwatchRingRef = useRef<HTMLDivElement>(null);
  const tabletSwatchRingRef = useRef<HTMLDivElement>(null);
  const mobileSwatchRingRef = useRef<HTMLDivElement>(null);

  // Animation controller tracking
  const isAnimatingRef = useRef(false);
  const pendingIndexRef = useRef<number | null>(null);
  const introPlayedRef = useRef(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTweensRef = useRef<gsap.core.Tween[]>([]);
  const isPausedRef = useRef(false);
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Swipe detection coordinates
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  /* ─── Autoplay Controller ───────────────────────────────────────── */
  const stopAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  /* ─── Idle Motion Controller ────────────────────────────────────── */
  const stopIdleMotion = useCallback(() => {
    idleTweensRef.current.forEach((t) => t.kill());
    idleTweensRef.current = [];
  }, []);

  const startIdleMotion = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stopIdleMotion();

    // Bed breathes (y +-4, 6s)
    if (bedStageRef.current) {
      const bedBreathe = gsap.to(bedStageRef.current, {
        y: 4,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      idleTweensRef.current.push(bedBreathe);
    }

    // Contact shadow scales with it
    if (shadowRef.current) {
      const shadowBreathe = gsap.to(shadowRef.current, {
        scale: 1.05,
        opacity: 0.85,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      idleTweensRef.current.push(shadowBreathe);
    }

    // Each orb floats (y +-10 to 18, rotate +-6, 4-6s, sine.inOut, yoyo, random delays)
    orbsRef.current.forEach((orbEl, i) => {
      if (!orbEl) return;
      const floatDist = 10 + (i % 3) * 4;
      const floatDur = 2 + (i % 3) * 0.5; // 4-6s total period (dur * 2)
      const rotDist = 5 + (i % 2) * 2;
      const delay = (i * 0.35) % 1.5;

      const orbTween = gsap.to(orbEl, {
        y: `+=${floatDist}`,
        rotate: `+=${rotDist}`,
        duration: floatDur,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay,
      });
      idleTweensRef.current.push(orbTween);
    });
  }, [stopIdleMotion]);

  /* ─── Slide Transition: goTo(nextIndex) ─────────────────────────── */
  const goTo = useCallback(
    (nextIndex: number) => {
      const activeIdx = currentIndexRef.current;
      if (nextIndex === activeIdx && !isAnimatingRef.current) return;

      // If a transition is running and the user picks another slide,
      // ignore intermediate clicks and run only the latest requested slide right after
      if (isAnimatingRef.current) {
        pendingIndexRef.current = nextIndex;
        return;
      }

      const isReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      isAnimatingRef.current = true;
      stopIdleMotion();

      const prevIndex = currentIndexRef.current;
      currentIndexRef.current = nextIndex;

      const prevSlide = PROMO_SLIDES[prevIndex];
      const nextSlide = PROMO_SLIDES[nextIndex];
      const oldBedEl = bedRefs.current[prevIndex];
      const newBedEl = bedRefs.current[nextIndex];

      // Handle reduced-motion: 300ms crossfade of the bed, colors and text
      if (isReducedMotion) {
        if (sectionRef.current) {
          gsap.to(sectionRef.current, {
            backgroundColor: nextSlide.bg,
            duration: PROMO_CONFIG.REDUCED_MOTION_DURATION,
            ease: "none",
          });
        }
        if (oldBedEl && newBedEl) {
          gsap.to(oldBedEl, {
            opacity: 0,
            duration: PROMO_CONFIG.REDUCED_MOTION_DURATION,
            ease: "none",
          });
          gsap.fromTo(
            newBedEl,
            { opacity: 0 },
            {
              opacity: 1,
              duration: PROMO_CONFIG.REDUCED_MOTION_DURATION,
              ease: "none",
              onComplete: () => {
                setCurrentIndex(nextIndex);
                setDisplayPrice(nextSlide.price);
                isAnimatingRef.current = false;
                if (pendingIndexRef.current !== null) {
                  const target = pendingIndexRef.current;
                  pendingIndexRef.current = null;
                  goTo(target);
                }
              },
            }
          );
        }
        return;
      }

      /* ── Full 1.4s GSAP Master Transition Timeline ── */
      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false;
          setCurrentIndex(nextIndex);

          // Swap active gradient layer reference
          activeGradLayerRef.current = activeGradLayerRef.current === "A" ? "B" : "A";

          // Clear temporary transformation props on beds & orbs
          bedRefs.current.forEach((b, idx) => {
            if (b) {
              if (idx === nextIndex) {
                gsap.set(b, { clearProps: "transform", opacity: 1 });
              } else {
                gsap.set(b, { clearProps: "transform", opacity: 0 });
              }
            }
          });

          // Reset name states
          desktopNameRefs.current.forEach((el, idx) => {
            if (el) gsap.set(el, { opacity: idx === nextIndex ? 1 : 0, yPercent: 0 });
          });
          tabletNameRefs.current.forEach((el, idx) => {
            if (el) gsap.set(el, { opacity: idx === nextIndex ? 1 : 0, yPercent: 0 });
          });
          mobileNameRefs.current.forEach((el, idx) => {
            if (el) gsap.set(el, { opacity: idx === nextIndex ? 1 : 0, yPercent: 0 });
          });

          if (shadowRef.current) {
            gsap.set(shadowRef.current, { clearProps: "transform", opacity: 1 });
          }
          orbsRef.current.forEach((el) => {
            if (el) gsap.set(el, { clearProps: "transform", opacity: 1 });
          });

          // Resume idle motion
          startIdleMotion();

          // Check if user requested another slide while this one was running
          if (pendingIndexRef.current !== null) {
            const queuedTarget = pendingIndexRef.current;
            pendingIndexRef.current = null;
            goTo(queuedTarget);
          }
        },
      });
      masterTimelineRef.current = tl;

      // 0.00-0.50s: Old bed lifts and exits (y: 0 to -110%, rotate 0 to -5deg, opacity 1 to 0, ease "power3.in")
      if (oldBedEl) {
        tl.to(
          oldBedEl,
          {
            y: "-110%",
            rotate: -5,
            opacity: 0,
            duration: 0.5,
            ease: "power3.in",
          },
          0
        );
      }

      // 0.00-0.50s: Contact shadow shrinks (scale 1 to 0.4, opacity to 0)
      if (shadowRef.current) {
        tl.to(
          shadowRef.current,
          {
            scale: 0.4,
            opacity: 0,
            duration: 0.5,
            ease: "power3.in",
          },
          0
        );
      }

      // 0.00-0.45s: Old orbs scatter: each flies outward by a random offset (x +-160, y +-120), scale to 0, opacity to 0, stagger 0.03, ease "power3.in"
      const scatterOffsets = [
        { x: -140, y: -90 },
        { x: -160, y: 70 },
        { x: -70, y: -110 },
        { x: 150, y: -100 },
        { x: 160, y: 80 },
        { x: 90, y: 120 },
        { x: 40, y: -115 },
      ];
      const activeOrbs = orbsRef.current.filter(Boolean) as HTMLDivElement[];
      activeOrbs.forEach((orb, i) => {
        const offset = scatterOffsets[i % scatterOffsets.length];
        tl.to(
          orb,
          {
            x: offset.x,
            y: offset.y,
            scale: 0,
            opacity: 0,
            duration: 0.42,
            ease: "power3.in",
          },
          i * 0.02
        );
      });

      // 0.00-1.00s: Colors: tween the band's background-color to the new bg, and crossfade the two gradient layers (new gradient opacity 0 to 1), ease "power2.inOut"
      if (sectionRef.current) {
        tl.to(
          sectionRef.current,
          {
            backgroundColor: nextSlide.bg,
            duration: 1.0,
            ease: "power2.inOut",
          },
          0
        );
      }

      const nextGrad = `radial-gradient(ellipse at 50% 45%, ${nextSlide.cardFrom} 0%, ${nextSlide.cardTo} 100%)`;
      const isLayerACurrent = activeGradLayerRef.current === "A";
      const incomingLayer = isLayerACurrent ? gradLayerBRef.current : gradLayerARef.current;
      const outgoingLayer = isLayerACurrent ? gradLayerARef.current : gradLayerBRef.current;

      if (incomingLayer) {
        incomingLayer.style.background = nextGrad;
        tl.fromTo(
          incomingLayer,
          { opacity: 0 },
          { opacity: 1, duration: 1.0, ease: "power2.inOut" },
          0
        );
      }
      if (outgoingLayer) {
        tl.to(outgoingLayer, { opacity: 0, duration: 1.0, ease: "power2.inOut" }, 0);
      }

      // 0.15-0.65s: Name roll: old text moves yPercent 0 to -100 and fades, new text moves yPercent 100 to 0 and fades in, stagger 0.05
      const allOldNames = [
        desktopNameRefs.current[prevIndex],
        tabletNameRefs.current[prevIndex],
        mobileNameRefs.current[prevIndex],
      ].filter(Boolean);

      const allNewNames = [
        desktopNameRefs.current[nextIndex],
        tabletNameRefs.current[nextIndex],
        mobileNameRefs.current[nextIndex],
      ].filter(Boolean);

      if (allOldNames.length > 0) {
        tl.to(
          allOldNames,
          {
            yPercent: -100,
            opacity: 0,
            duration: 0.25,
            ease: "power2.in",
          },
          0.15
        );
      }

      if (allNewNames.length > 0) {
        tl.fromTo(
          allNewNames,
          { yPercent: 100, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.25, ease: "power2.out" },
          0.4
        );
      }

      // Price roll and numeric counter tween (stagger 0.05)
      const priceObj = { val: prevSlide.priceNum };
      tl.to(
        priceObj,
        {
          val: nextSlide.priceNum,
          duration: 0.5,
          ease: "power2.out",
          onUpdate: () => {
            setDisplayPrice(`£${Math.round(priceObj.val).toLocaleString()}`);
          },
        },
        0.15 + 0.05
      );

      // 0.55-1.30s: New bed drops in from y -140% with rotate -6 to 0 and opacity 0 to 1, ease "back.out(1.1)", then tiny settle bounce (y +8 then 0, 0.2s)
      if (newBedEl) {
        tl.fromTo(
          newBedEl,
          { y: "-140%", rotate: -6, opacity: 0 },
          {
            y: 0,
            rotate: 0,
            opacity: 1,
            duration: 0.55,
            ease: "back.out(1.1)",
          },
          0.55
        );
        // Settle bounce: y +8 then 0 over 0.2s
        tl.to(
          newBedEl,
          {
            y: 8,
            duration: 0.1,
            ease: "sine.out",
          },
          1.1
        );
        tl.to(
          newBedEl,
          {
            y: 0,
            duration: 0.1,
            ease: "sine.inOut",
          },
          1.2
        );
      }

      // Contact shadow grows from scale 0.4 / opacity 0 to 1 as the bed lands (sync with landing)
      if (shadowRef.current) {
        tl.fromTo(
          shadowRef.current,
          { scale: 0.4, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.55,
            ease: "power2.out",
          },
          0.65
        );
      }

      // 0.60-1.00s: Swatch ring and pagination dot move to the new slide
      const swatchStep = 32; // 24px swatch + 8px gap
      const ringTargets = [
        desktopSwatchRingRef.current,
        tabletSwatchRingRef.current,
        mobileSwatchRingRef.current,
      ].filter(Boolean);

      if (ringTargets.length > 0) {
        tl.to(
          ringTargets,
          {
            x: nextIndex * swatchStep,
            duration: 0.4,
            ease: "power2.inOut",
          },
          0.6
        );
      }

      // Update swatch indicator state at 0.60s
      tl.call(() => {
        setCurrentIndex(nextIndex);
      }, undefined, 0.6);

      // 0.70-1.40s: New orbs pop in: scale 0 to 1, opacity 0 to 1, ease "elastic.out(1, 0.6)", stagger 0.03 from "random"
      tl.call(() => {
        activeOrbs.forEach((orb) => {
          gsap.set(orb, {
            x: 0,
            y: 0,
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.45) 20%, ${nextSlide.orbTint} 35%, ${nextSlide.orbShade} 100%)`,
          });
        });
      }, undefined, 0.69);

      tl.fromTo(
        activeOrbs,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "elastic.out(1, 0.6)",
          stagger: {
            each: 0.03,
            from: "random",
          },
        },
        0.7
      );
    },
    [startIdleMotion, stopIdleMotion]
  );

  /* ─── Autoplay Loop Handler (5s interval) ───────────────────────── */
  const startAutoplay = useCallback(() => {
    stopAutoplay();
    if (typeof window !== "undefined") {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    }
    autoplayTimerRef.current = setInterval(() => {
      if (!isPausedRef.current && !isAnimatingRef.current) {
        const nextIdx = (currentIndexRef.current + 1) % PROMO_SLIDES.length;
        goTo(nextIdx);
      }
    }, PROMO_CONFIG.AUTOPLAY_DELAY);
  }, [goTo, stopAutoplay]);

  const restartAutoplay = useCallback(() => {
    stopAutoplay();
    startAutoplay();
  }, [startAutoplay, stopAutoplay]);

  /* ─── Keyboard Accessibility Handler ────────────────────────────── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        restartAutoplay();
        goTo((currentIndex - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        restartAutoplay();
        goTo((currentIndex + 1) % PROMO_SLIDES.length);
      }
    },
    [currentIndex, goTo, restartAutoplay]
  );

  /* ─── Touch Swipe Controls (threshold > 50px) ────────────────────── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Horizontal swipe threshold: 50px, without blocking vertical scrolls
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      restartAutoplay();
      if (deltaX < 0) {
        // Swipe left -> next
        goTo((currentIndex + 1) % PROMO_SLIDES.length);
      } else {
        // Swipe right -> prev
        goTo((currentIndex - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);
      }
    }
  };

  /* ─── GSAP Context: Intro, Idle Motion & Desktop 3D Tilt Setup ─── */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const sectionEl = sectionRef.current;
    const cardEl = cardRef.current;
    if (!sectionEl || !cardEl) return;

    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDesktopPointer = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;

    // Scoped GSAP context
    const ctx = gsap.context(() => {
      // Failsafe safety timeout: clear inline start states so nothing can stay invisible
      const failsafe = setTimeout(() => {
        if (bedRefs.current[0]) gsap.set(bedRefs.current[0], { clearProps: "transform", opacity: 1 });
        if (shadowRef.current) gsap.set(shadowRef.current, { clearProps: "transform", opacity: 1 });
        orbsRef.current.forEach((orb) => {
          if (orb) gsap.set(orb, { clearProps: "transform", opacity: 1 });
        });
        startIdleMotion();
        startAutoplay();
      }, PROMO_CONFIG.FAILSAFE_DELAY);

      /* ── Reduced Motion Direct Mount ── */
      if (isReducedMotion) {
        introPlayedRef.current = true;
        clearTimeout(failsafe);
        return;
      }

      /* ── IntersectionObserver: Trigger Intro at 35% In View ── */
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !introPlayedRef.current) {
              introPlayedRef.current = true;
              clearTimeout(failsafe);

              const introTl = gsap.timeline({
                onComplete: () => {
                  startIdleMotion();
                  startAutoplay();
                  if (bedRefs.current[0]) gsap.set(bedRefs.current[0], { clearProps: "transform", opacity: 1 });
                  if (shadowRef.current) gsap.set(shadowRef.current, { clearProps: "transform", opacity: 1 });
                  orbsRef.current.forEach((orb) => {
                    if (orb) gsap.set(orb, { clearProps: "transform", opacity: 1 });
                  });
                },
              });

              // Card enters from y 120 / rotate -7deg / rotateX 12deg / opacity 0 to flat over 1.1s, ease "power4.out"
              introTl.fromTo(
                cardEl,
                { y: 120, rotate: -7, rotateX: 12, opacity: 0 },
                {
                  y: 0,
                  rotate: 0,
                  rotateX: 0,
                  opacity: 1,
                  duration: PROMO_CONFIG.INTRO_DURATION,
                  ease: "power4.out",
                }
              );

              // Then, staggered 0.08s: top row, heading lines (masked slide-up), description, swatches, price, button, dots
              const introTargets = [
                cardEl.querySelector(".promo-top-row"),
                cardEl.querySelector(".promo-heading-title"),
                cardEl.querySelector(".promo-desc"),
                cardEl.querySelector(".promo-swatches-box"),
                cardEl.querySelector(".promo-price-box"),
                cardEl.querySelector(".promo-shop-btn"),
                cardEl.querySelector(".promo-dots-box"),
              ].filter(Boolean) as HTMLElement[];

              if (introTargets.length > 0) {
                introTl.from(
                  introTargets,
                  {
                    opacity: 0,
                    y: 24,
                    duration: 0.55,
                    stagger: 0.08,
                    ease: "power2.out",
                  },
                  0.4
                );
              }

              // Then the first bed drops in and its orbs pop in, exactly as in the transition trace
              const firstBed = bedRefs.current[0];
              if (firstBed) {
                introTl.fromTo(
                  firstBed,
                  { y: "-140%", rotate: -6, opacity: 0 },
                  {
                    y: 0,
                    rotate: 0,
                    opacity: 1,
                    duration: 0.55,
                    ease: "back.out(1.1)",
                  },
                  0.75
                );
                // Settle bounce (+8 then 0, 0.2s)
                introTl.to(
                  firstBed,
                  { y: 8, duration: 0.1, ease: "sine.out" },
                  1.3
                );
                introTl.to(
                  firstBed,
                  { y: 0, duration: 0.1, ease: "sine.inOut" },
                  1.4
                );
              }

              // Shadow grows
              if (shadowRef.current) {
                introTl.fromTo(
                  shadowRef.current,
                  { scale: 0.4, opacity: 0 },
                  { scale: 1, opacity: 1, duration: 0.55, ease: "power2.out" },
                  0.85
                );
              }

              // Orbs pop in with elastic.out(1, 0.6)
              const activeOrbs = orbsRef.current.filter(Boolean);
              if (activeOrbs.length > 0) {
                introTl.fromTo(
                  activeOrbs,
                  { scale: 0, opacity: 0 },
                  {
                    scale: 1,
                    opacity: 1,
                    duration: 0.55,
                    ease: "elastic.out(1, 0.6)",
                    stagger: { each: 0.03, from: "random" },
                  },
                  0.9
                );
              }
            }
          });
        },
        { threshold: 0.35 }
      );

      observer.observe(sectionEl);

      /* ── Tab Visibility Listener: Pause Autoplay When Hidden ── */
      const handleVisibilityChange = () => {
        isPausedRef.current = document.hidden;
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);

      /* ── Desktop 3D Tilt & Orbs Depth Shift (1024px+ fine pointer) ── */
      let handleMouseMove: ((e: MouseEvent) => void) | null = null;
      let handleMouseLeave: (() => void) | null = null;

      if (isDesktopPointer) {
        gsap.set(cardEl, { transformPerspective: 1200, transformStyle: "preserve-3d" });

        const tiltX = gsap.quickTo(cardEl, "rotateX", { duration: 0.6, ease: "power2.out" });
        const tiltY = gsap.quickTo(cardEl, "rotateY", { duration: 0.6, ease: "power2.out" });

        const orbQuickTos = orbsRef.current.map((orb, i) => {
          if (!orb) return null;
          const depth = ORBS_DATA[i]?.depth || 1.5;
          return {
            x: gsap.quickTo(orb, "x", { duration: 0.6, ease: "power2.out" }),
            y: gsap.quickTo(orb, "y", { duration: 0.6, ease: "power2.out" }),
            depth,
          };
        });

        handleMouseMove = (e: MouseEvent) => {
          const rect = cardEl.getBoundingClientRect();
          const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

          tiltY(normX * PROMO_CONFIG.TILT_MAX_DEG);
          tiltX(-normY * PROMO_CONFIG.TILT_MAX_DEG);

          orbQuickTos.forEach((item) => {
            if (!item) return;
            item.x(normX * item.depth * 10);
            item.y(normY * item.depth * 8);
          });
        };

        handleMouseLeave = () => {
          tiltX(0);
          tiltY(0);
          orbQuickTos.forEach((item) => {
            item?.x(0);
            item?.y(0);
          });
        };

        cardEl.addEventListener("mousemove", handleMouseMove);
        cardEl.addEventListener("mouseleave", handleMouseLeave);
      }

      // Cleanup inside context
      return () => {
        clearTimeout(failsafe);
        observer.disconnect();
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        stopIdleMotion();
        stopAutoplay();
        if (handleMouseMove && cardEl) {
          cardEl.removeEventListener("mousemove", handleMouseMove);
        }
        if (handleMouseLeave && cardEl) {
          cardEl.removeEventListener("mouseleave", handleMouseLeave);
        }
      };
    }, cardEl);

    return () => {
      ctx.revert();
    };
  }, [startAutoplay, startIdleMotion, stopAutoplay, stopIdleMotion]);

  const currentSlide = PROMO_SLIDES[currentIndex];

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden transition-colors duration-700 ease-out p-[16px_12px] sm:py-10 sm:px-6 lg:py-[6vw] lg:px-[4vw] select-none"
      style={{ backgroundColor: currentSlide.bg }}
      aria-label="Promo Showcase: Bed Collections"
    >
      {/* ── Outer Card (16/9 ratio, max 1180px, min 560px, rounded-[32px]) ── */}
      <div
        ref={cardRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => {
          isPausedRef.current = true;
        }}
        onMouseLeave={() => {
          isPausedRef.current = false;
        }}
        onFocus={() => {
          isPausedRef.current = true;
        }}
        onBlur={() => {
          isPausedRef.current = false;
        }}
        className="relative mx-auto w-full max-w-[1180px] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl min-h-[560px] lg:aspect-[16/9] flex flex-col justify-between p-5 sm:p-8 lg:p-10 outline-none focus-visible:ring-4 focus-visible:ring-white/60"
        style={{
          boxShadow: "0 28px 70px -15px rgba(0,0,0,0.35)",
          touchAction: "pan-y",
        }}
      >
        {/* ── Background Crossfade Layer A ── */}
        <div
          ref={gradLayerARef}
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(ellipse at 50% 45%, ${PROMO_SLIDES[0].cardFrom} 0%, ${PROMO_SLIDES[0].cardTo} 100%)`,
            opacity: 1,
          }}
        />

        {/* ── Background Crossfade Layer B ── */}
        <div
          ref={gradLayerBRef}
          className="absolute inset-0 pointer-events-none z-0 opacity-0"
          style={{
            background: `radial-gradient(ellipse at 50% 45%, ${PROMO_SLIDES[1].cardFrom} 0%, ${PROMO_SLIDES[1].cardTo} 100%)`,
            opacity: 0,
          }}
        />

        {/* ── Floating Glossy 3D Orbs (Behind & In-front layers) ── */}
        {ORBS_DATA.map((orb, i) => {
          // Mobile (<640px): 4 orbs (#1, #2, #4, #6)
          // Tablet (640-1023px): 5 orbs (#1, #2, #4, #5, #7)
          // Desktop (1024px+): all 7 orbs
          const visibilityClass = !orb.mobileVisible
            ? orb.tabletVisible
              ? "hidden sm:block"
              : "hidden lg:block"
            : !orb.tabletVisible
            ? "block sm:hidden lg:block"
            : "block";

          return (
            <div
              key={orb.id}
              ref={(el) => {
                orbsRef.current[i] = el;
              }}
              className={`absolute rounded-full pointer-events-none will-change-transform ${visibilityClass}`}
              style={{
                width: `${orb.size}px`,
                height: `${orb.size}px`,
                left: orb.left,
                top: orb.top,
                zIndex: orb.zIndex,
                background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.45) 20%, ${currentSlide.orbTint} 35%, ${currentSlide.orbShade} 100%)`,
                boxShadow:
                  "0 14px 28px -4px rgba(0,0,0,0.38), inset -3px -3px 8px rgba(0,0,0,0.22), inset 2px 2px 5px rgba(255,255,255,0.7)",
                transition: "background 0.8s ease",
              }}
            />
          );
        })}

        {/* ── Center Stage: Beds and Elliptical Contact Shadow ── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          {/* Multi-bed container with pre-mounted isolated bed slides */}
          <div
            ref={bedStageRef}
            className="relative w-full max-w-[280px] h-[36svh] sm:h-auto sm:max-w-[560px] sm:w-[62%] lg:w-[52%] lg:max-w-[620px] aspect-[16/10] flex items-center justify-center will-change-transform z-10"
            style={{ marginTop: "-2%" }}
          >
            {PROMO_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                ref={(el) => {
                  bedRefs.current[idx] = el;
                }}
                className={`absolute inset-0 flex items-center justify-center will-change-transform ${
                  idx === 0 ? "opacity-100" : "opacity-0"
                }`}
              >
                <BedSvgFallback slide={slide} />
              </div>
            ))}
          </div>

          {/* Elliptical Contact Shadow directly under bed base (60% of the bed width) */}
          <div
            ref={shadowRef}
            className="rounded-full pointer-events-none -mt-4 sm:-mt-6 lg:-mt-7"
            style={{
              width: "56%",
              maxWidth: "340px",
              height: "28px",
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(10, 5, 2, 0.65) 0%, rgba(10, 5, 2, 0.25) 45%, transparent 75%)",
              filter: "blur(8px)",
              transformOrigin: "center center",
              zIndex: 9,
            }}
          />
        </div>

        {/* ── Top Row: Logo, Center Pills, Search & Cart Icons ── */}
        <header className="promo-top-row relative z-30 w-full flex items-center justify-between">
          {/* Logo (28px height) */}
          <Link href="/" className="flex items-center gap-2 group min-h-[44px] py-1">
            <Image
              src="/images/logo.png"
              alt="Mellosoft"
              width={100}
              height={28}
              className="h-7 w-auto object-contain brightness-0 invert"
            />
          </Link>

          {/* Center Pill Buttons (Hidden on mobile <640px, visible on tablet & desktop) */}
          <nav
            className="hidden sm:flex items-center gap-1.5 p-1 rounded-full bg-black/20 backdrop-blur-md border border-white/10"
            aria-label="Promo navigation"
          >
            <button
              type="button"
              className="px-4 py-1.5 text-xs font-semibold rounded-full bg-white text-[#222] shadow-sm transition-transform active:scale-95 min-h-[36px]"
            >
              Beds
            </button>
            <Link
              href="/contact"
              className="px-4 py-1.5 text-xs font-medium text-white/85 hover:text-white transition-colors min-h-[36px] flex items-center"
            >
              Visit store
            </Link>
          </nav>

          {/* Right Action Icons (36px circles; Search hidden on mobile, cart visible) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Search beds"
              className="hidden sm:grid place-items-center w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white transition-colors active:scale-95"
            >
              <Search size={16} />
            </button>
            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="grid place-items-center w-9 h-9 sm:w-9 sm:h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white transition-colors active:scale-95"
            >
              <ShoppingBag size={16} />
            </Link>
          </div>
        </header>

        {/* ── DESKTOP (1024px+) & TABLET (640-1023px) LAYOUT SECTIONS ── */}
        {/* Desktop Left Column: Heading (vertically centered) & Description (lower-left) */}
        <div className="hidden lg:block absolute left-10 xl:left-12 top-1/2 -translate-y-1/2 z-20 max-w-[320px] pointer-events-none">
          <div className="promo-heading-mask overflow-hidden">
            <h2 className="promo-heading-title font-serif text-white text-[44px] xl:text-[52px] font-normal leading-[1.06] tracking-tight">
              Sleep into
              <br />
              Softness<span style={{ color: currentSlide.accent }}>.</span>
            </h2>
          </div>
        </div>

        {/* Desktop Lower-Left Description */}
        <p className="promo-desc hidden lg:block absolute left-10 xl:left-12 bottom-10 z-20 text-xs text-white/80 max-w-[260px] leading-relaxed pointer-events-none">
          Layered comfort, handcrafted frames and a 10-year warranty.
        </p>

        {/* Desktop Right Column: Collection Name (20px) & 3 Swatches */}
        <div className="hidden lg:flex absolute right-10 xl:right-12 top-1/2 -translate-y-1/2 z-20 flex-col items-end text-right promo-swatches-box">
          <span className="text-[12px] uppercase tracking-[0.2em] font-medium text-white/70 mb-1">
            Collection
          </span>
          <div
            className="relative overflow-hidden h-8 w-44 flex items-center justify-end mb-3"
            aria-live="polite"
          >
            {PROMO_SLIDES.map((slide, idx) => (
              <span
                key={slide.id}
                ref={(el) => {
                  desktopNameRefs.current[idx] = el;
                }}
                className={`promo-name-text absolute text-[20px] font-medium text-white ${
                  idx === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                {slide.name}
              </span>
            ))}
          </div>

          {/* 3 round swatch buttons (24px, slide colors, white ring on active) */}
          <div
            className="relative flex items-center gap-2 p-1 rounded-full bg-black/15 backdrop-blur-md border border-white/10"
            role="radiogroup"
            aria-label="Select collection color"
          >
            {/* Sliding white ring indicator */}
            <div
              ref={desktopSwatchRingRef}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white pointer-events-none transition-transform duration-300"
              style={{
                transform: `translate(${currentIndex * 32}px, -50%)`,
              }}
            />
            {PROMO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                role="radio"
                aria-checked={idx === currentIndex}
                aria-label={`${slide.name} swatch`}
                onClick={() => {
                  restartAutoplay();
                  goTo(idx);
                }}
                className="relative w-6 h-6 rounded-full transition-transform active:scale-90 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{ backgroundColor: slide.accent }}
              />
            ))}
          </div>
        </div>

        {/* TABLET (640px to 1023px): Heading with Swatches directly under heading */}
        <div className="hidden sm:flex lg:hidden flex-col gap-4 relative z-20 my-auto py-4">
          <div className="max-w-sm">
            <h2 className="promo-heading-title font-serif text-white text-4xl sm:text-[40px] font-normal leading-[1.08] tracking-tight">
              Sleep into
              <br />
              Softness<span style={{ color: currentSlide.accent }}>.</span>
            </h2>
          </div>

          {/* Swatches under heading on tablet */}
          <div className="flex items-center gap-3 promo-swatches-box">
            <div
              className="relative overflow-hidden h-6 w-36 flex items-center"
              aria-live="polite"
            >
              {PROMO_SLIDES.map((slide, idx) => (
                <span
                  key={slide.id}
                  ref={(el) => {
                    tabletNameRefs.current[idx] = el;
                  }}
                  className={`promo-name-text absolute text-sm font-medium text-white/90 ${
                    idx === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  {slide.name}
                </span>
              ))}
            </div>
            <div
              className="relative flex items-center gap-2 p-1 rounded-full bg-black/15 backdrop-blur-md border border-white/10"
              role="radiogroup"
              aria-label="Select collection color"
            >
              <div
                ref={tabletSwatchRingRef}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white pointer-events-none transition-transform duration-300"
                style={{
                  transform: `translate(${currentIndex * 32}px, -50%)`,
                }}
              />
              {PROMO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  role="radio"
                  aria-checked={idx === currentIndex}
                  aria-label={`${slide.name} swatch`}
                  onClick={() => {
                    restartAutoplay();
                    goTo(idx);
                  }}
                  className="relative w-6 h-6 rounded-full transition-transform active:scale-90 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-white"
                  style={{ backgroundColor: slide.accent }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* MOBILE (<640px) STACKED CONTENT: Heading & Collection Swatches row */}
        <div className="sm:hidden relative z-20 flex flex-col gap-3 my-1">
          {/* Heading (30-34px) */}
          <h2 className="promo-heading-title font-serif text-white text-[32px] font-normal leading-[1.08] tracking-tight">
            Sleep into Softness<span style={{ color: currentSlide.accent }}>.</span>
          </h2>

          {/* Bed Spacer for 36svh / max 280px middle bed area */}
          <div className="w-full h-[36svh] max-h-[250px] pointer-events-none" />

          {/* Collection Name with Swatches in one row */}
          <div className="flex items-center justify-between w-full pt-1 promo-swatches-box">
            <div aria-live="polite" className="relative overflow-hidden h-6 w-32 flex items-center">
              {PROMO_SLIDES.map((slide, idx) => (
                <span
                  key={slide.id}
                  ref={(el) => {
                    mobileNameRefs.current[idx] = el;
                  }}
                  className={`promo-name-text absolute text-sm font-medium text-white ${
                    idx === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  {slide.name}
                </span>
              ))}
            </div>
            <div
              className="relative flex items-center gap-2 p-1 rounded-full bg-black/20 backdrop-blur-md border border-white/10"
              role="radiogroup"
              aria-label="Select collection color"
            >
              <div
                ref={mobileSwatchRingRef}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white pointer-events-none transition-transform duration-300"
                style={{
                  transform: `translate(${currentIndex * 32}px, -50%)`,
                }}
              />
              {PROMO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  role="radio"
                  aria-checked={idx === currentIndex}
                  aria-label={`${slide.name} swatch`}
                  onClick={() => {
                    restartAutoplay();
                    goTo(idx);
                  }}
                  className="relative w-6 h-6 rounded-full transition-transform active:scale-90 flex items-center justify-center min-w-[24px] min-h-[24px]"
                  style={{ backgroundColor: slide.accent }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Row Inside The Card (Div container, not raw footer) ── */}
        {/* DESKTOP & TABLET: Price (28px white centered at bottom), Button (bottom right), Dots (bottom-left of button) */}
        <div className="hidden sm:flex relative z-30 w-full items-center justify-between pt-2">
          {/* Empty spacer / tablet description */}
          <div className="w-1/3">
            <p className="promo-desc lg:hidden text-xs text-white/80 max-w-[220px] leading-relaxed">
              Layered comfort, handcrafted frames.
            </p>
          </div>

          {/* Price centered at the bottom (28px, white) */}
          <div className="promo-price-box w-1/3 flex justify-center text-center">
            <span className="text-[28px] font-medium tracking-tight text-white font-sans">
              {displayPrice}
            </span>
          </div>

          {/* Bottom Right: Pagination dots (3) at the bottom-left of the button + Shop Now button */}
          <div className="w-1/3 flex items-center justify-end gap-5">
            {/* Pagination dots (3) */}
            <div
              className="promo-dots-box flex items-center gap-1.5"
              role="tablist"
              aria-label="Choose collection slide"
            >
              {PROMO_SLIDES.map((slide, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Go to slide ${idx + 1}`}
                    onClick={() => {
                      restartAutoplay();
                      goTo(idx);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 min-h-[24px] flex items-center ${
                      isActive ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                );
              })}
            </div>

            {/* Shop now button (white, dark text, rounded-full, 44px tall, hover fills with slide's accent) */}
            <Link
              href="/shop/beds"
              className="promo-shop-btn inline-flex items-center justify-center gap-2 px-6 min-h-[44px] h-[44px] rounded-full bg-white text-[#222] font-semibold text-xs uppercase tracking-wider transition-all duration-300 hover:text-white shadow-lg active:scale-95 group shrink-0"
              style={{
                transition: "background-color 0.3s ease, color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = currentSlide.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }}
            >
              <span>Shop now</span>
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* MOBILE (<640px) BOTTOM ROW: Price & Shop now in one row (button min 44px tall), then dots */}
        <div className="sm:hidden relative z-30 w-full flex flex-col gap-3 pt-2">
          {/* Row: Price on left, Shop now button on right */}
          <div className="flex items-center justify-between w-full">
            <div className="promo-price-box">
              <span className="text-2xl font-medium tracking-tight text-white font-sans">
                {displayPrice}
              </span>
            </div>

            <Link
              href="/shop/beds"
              className="promo-shop-btn inline-flex items-center justify-center gap-1.5 px-5 min-h-[44px] h-[44px] rounded-full bg-white text-[#222] font-semibold text-xs uppercase tracking-wider shadow-md active:scale-95"
              style={{
                backgroundColor: "#FFFFFF",
              }}
            >
              <span>Shop now</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Dots centered at the very bottom */}
          <div
            className="promo-dots-box flex items-center justify-center gap-2 py-1"
            role="tablist"
            aria-label="Choose collection slide"
          >
            {PROMO_SLIDES.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => {
                    restartAutoplay();
                    goTo(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 min-h-[32px] flex items-center justify-center ${
                    isActive ? "w-6 bg-white" : "w-2 bg-white/40"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
