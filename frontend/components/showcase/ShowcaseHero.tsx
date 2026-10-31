"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { UserRound, ChevronLeft, ChevronRight } from "lucide-react";
import { Montserrat } from "next/font/google";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
import {
  SHOWCASE_SLIDES,
  SHOWCASE_CONFIG,
  ShowcaseSlide,
} from "./slidesData";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["800"],
  display: "swap",
});

const SLICE_COUNT = 8;

export default function ShowcaseHero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);
  const isHovered = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // References for current layer
  const oldTitleRef = useRef<HTMLHeadingElement>(null);
  const oldSubtitleRef = useRef<HTMLParagraphElement>(null);
  const oldButtonRef = useRef<HTMLAnchorElement>(null);
  const oldSpecsRef = useRef<HTMLDivElement>(null);
  const oldLabelRef = useRef<HTMLDivElement>(null);
  const oldProductRef = useRef<HTMLDivElement>(null);
  const oldSlicesRef = useRef<HTMLDivElement[]>([]);

  // References for incoming/next layer
  const newTitleRef = useRef<HTMLHeadingElement>(null);
  const newSubtitleRef = useRef<HTMLParagraphElement>(null);
  const newButtonRef = useRef<HTMLAnchorElement>(null);
  const newSpecsRef = useRef<HTMLDivElement>(null);
  const newLabelRef = useRef<HTMLDivElement>(null);
  const newProductRef = useRef<HTMLDivElement>(null);
  const newSlicesRef = useRef<HTMLDivElement[]>([]);

  // Spec value DOM element references for counter animation
  const specValueRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const specLabelRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const currentSlide = SHOWCASE_SLIDES[currentIndex];
  const incomingSlide =
    incomingIndex !== null ? SHOWCASE_SLIDES[incomingIndex] : null;

  // Preload all product images
  useEffect(() => {
    let loaded = 0;
    const total = SHOWCASE_SLIDES.length;

    SHOWCASE_SLIDES.forEach((slide) => {
      const img = new window.Image();
      img.src = slide.image;
      img.onload = () => {
        loaded++;
        if (loaded >= total) setImagesLoaded(true);
      };
      img.onerror = () => {
        setImageErrors((prev) => ({ ...prev, [slide.slug]: true }));
        loaded++;
        if (loaded >= total) setImagesLoaded(true);
      };
    });
  }, []);

  // Main Transition function
  const goTo = useCallback(
    (nextIdx: number) => {
      if (isAnimating.current || nextIdx === currentIndex) return;
      if (nextIdx < 0 || nextIdx >= SHOWCASE_SLIDES.length) return;

      isAnimating.current = true;
      setIncomingIndex(nextIdx);

      const nextSlide = SHOWCASE_SLIDES[nextIdx];
      const isMobile = window.innerWidth < 768;
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Handle reduced motion: simple 300ms crossfade
      if (reducedMotion) {
        if (!containerRef.current) return;
        const ctx = gsap.context(() => {
          gsap.to(containerRef.current, {
            opacity: 0.4,
            duration: 0.15,
            yoyo: true,
            repeat: 1,
            onRepeat: () => {
              setCurrentIndex(nextIdx);
              setIncomingIndex(null);
            },
            onComplete: () => {
              isAnimating.current = false;
            },
          });
        }, containerRef);
        return () => ctx.revert();
      }

      // Full animation timeline
      const tl = gsap.timeline({
        onComplete: () => {
          setCurrentIndex(nextIdx);
          setIncomingIndex(null);
          isAnimating.current = false;
        },
      });
      timelineRef.current = tl;

      // Calculate midpoint color for smooth chromatic panel transition
      const midColor = gsap.utils.interpolate(
        currentSlide.color,
        nextSlide.color,
        0.5
      );

      /* 1. 0.00-0.50s: Old title, subtitle & button slide out & fade */
      const oldExitX = currentSlide.side === "right" ? -140 : 140;
      if (oldTitleRef.current && oldSubtitleRef.current && oldButtonRef.current) {
        tl.to(
          [oldTitleRef.current, oldSubtitleRef.current, oldButtonRef.current],
          {
            x: oldExitX,
            opacity: 0,
            stagger: 0.06,
            duration: SHOWCASE_CONFIG.TEXT_OUT_DURATION,
            ease: "power3.in",
          },
          0
        );
      }
      if (oldSpecsRef.current) {
        tl.to(oldSpecsRef.current, { opacity: 0, duration: 0.4 }, 0);
      }

      /* 2. 0.00-0.80s: Panel clip-path animates to collapsed sliver & tints to midpoint */
      if (panelRef.current) {
        tl.to(
          panelRef.current,
          {
            clipPath: isMobile
              ? SHOWCASE_CONFIG.POLYGONS.MOBILE
              : SHOWCASE_CONFIG.POLYGONS.SLIVER,
            backgroundColor: midColor,
            duration: SHOWCASE_CONFIG.SLIVER_DURATION,
            ease: "power3.inOut",
          },
          0
        );
      }

      /* 3. 0.10-0.90s: Glitch effect on old product slices */
      if (!isMobile && oldSlicesRef.current.length > 0) {
        oldSlicesRef.current.forEach((slice) => {
          if (!slice) return;
          const sign = Math.random() > 0.5 ? 1 : -1;
          const dist = (60 + Math.random() * 100) * sign;
          tl.to(
            slice,
            {
              x: dist,
              opacity: 0,
              filter: `drop-shadow(0 0 12px ${nextSlide.color})`,
              duration: SHOWCASE_CONFIG.GLITCH_OUT_DURATION,
              ease: "power2.in",
            },
            0.1 + Math.random() * 0.2
          );
        });
      } else if (oldProductRef.current) {
        tl.to(oldProductRef.current, { opacity: 0, duration: 0.6 }, 0.1);
      }

      /* 4. 0.70-1.60s: Panel clip-path expands to new slide polygon & finishes at new color */
      const targetPolygon = isMobile
        ? SHOWCASE_CONFIG.POLYGONS.MOBILE
        : nextSlide.side === "right"
        ? SHOWCASE_CONFIG.POLYGONS.RIGHT
        : SHOWCASE_CONFIG.POLYGONS.LEFT;

      if (panelRef.current) {
        tl.to(
          panelRef.current,
          {
            clipPath: targetPolygon,
            backgroundColor: nextSlide.color,
            duration: SHOWCASE_CONFIG.PANEL_EXPAND_DURATION,
            ease: "power3.inOut",
          },
          0.7
        );
      }

      /* 5. 0.80-1.70s: New product slices slide in from opposite side, settle, and micro-shake */
      if (!isMobile && newSlicesRef.current.length > 0) {
        const startOffset = nextSlide.side === "right" ? 160 : -160;
        newSlicesRef.current.forEach((slice, idx) => {
          if (!slice) return;
          gsap.set(slice, { x: startOffset, opacity: 0 });
          tl.to(
            slice,
            {
              x: 0,
              opacity: 1,
              duration: 0.65,
              ease: "power3.out",
            },
            0.8 + idx * 0.04
          );
        });

        // 0.15s micro-shake at the end for the glitch snap feel
        if (newProductRef.current) {
          tl.to(
            newProductRef.current,
            {
              x: "+=4",
              duration: 0.04,
              repeat: 3,
              yoyo: true,
              ease: "power1.inOut",
            },
            1.55
          );
          tl.to(newProductRef.current, { x: 0, duration: 0.04 }, 1.7);
        }
      } else if (newProductRef.current) {
        gsap.set(newProductRef.current, { opacity: 0, y: 20 });
        tl.to(
          newProductRef.current,
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
          0.8
        );
      }

      /* 6. 0.80-1.60s: New title, subtitle & button slide in from opposite side */
      const newEnterX = nextSlide.side === "right" ? -140 : 140;
      if (newTitleRef.current && newSubtitleRef.current && newButtonRef.current) {
        gsap.set(
          [newTitleRef.current, newSubtitleRef.current, newButtonRef.current],
          {
            x: newEnterX,
            opacity: 0,
          }
        );
        tl.to(
          [newTitleRef.current, newSubtitleRef.current, newButtonRef.current],
          {
            x: 0,
            opacity: 1,
            stagger: 0.06,
            duration: SHOWCASE_CONFIG.TEXT_IN_DURATION,
            ease: "power3.out",
          },
          0.8
        );
      }

      /* 7. 0.40-1.40s: GHOST LABEL crossfade with -24px / +24px offset */
      if (oldLabelRef.current && newLabelRef.current) {
        gsap.set(newLabelRef.current, { opacity: 0, x: 24 });
        tl.to(
          oldLabelRef.current,
          {
            opacity: 0,
            x: -24,
            duration: SHOWCASE_CONFIG.GHOST_LABEL_DURATION,
            ease: "power3.inOut",
          },
          0.4
        );
        tl.to(
          newLabelRef.current,
          {
            opacity: 1,
            x: 0,
            duration: SHOWCASE_CONFIG.GHOST_LABEL_DURATION,
            ease: "power3.inOut",
          },
          0.4
        );
      }

      /* 8. 1.00-2.00s: SPEC NUMBERS count up/down to new values */
      if (newSpecsRef.current) {
        gsap.set(newSpecsRef.current, { opacity: 0 });
        tl.to(newSpecsRef.current, { opacity: 1, duration: 0.5 }, 0.9);
      }

      currentSlide.specs.forEach((oldSpec, i) => {
        const newSpec = nextSlide.specs[i] || oldSpec;
        const counter = { val: oldSpec.value };
        const valEl = specValueRefs.current[i];
        if (valEl) {
          tl.to(
            counter,
            {
              val: newSpec.value,
              duration: SHOWCASE_CONFIG.SPECS_COUNT_DURATION,
              ease: "power2.out",
              onUpdate: () => {
                valEl.textContent = String(Math.round(counter.val));
              },
            },
            1.0
          );
        }
      });
    },
    [currentIndex, currentSlide]
  );

  const nextSlide = useCallback(() => {
    const nextIdx = (currentIndex + 1) % SHOWCASE_SLIDES.length;
    goTo(nextIdx);
  }, [currentIndex, goTo]);

  const prevSlide = useCallback(() => {
    const prevIdx =
      (currentIndex - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length;
    goTo(prevIdx);
  }, [currentIndex, goTo]);

  // Autoplay handler
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion || !imagesLoaded) return;

    const startTimer = () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
      autoplayTimer.current = setInterval(() => {
        if (!isHovered.current && !isAnimating.current) {
          nextSlide();
        }
      }, SHOWCASE_CONFIG.AUTOPLAY_INTERVAL);
    };

    startTimer();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (autoplayTimer.current) clearInterval(autoplayTimer.current);
      } else {
        startTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [imagesLoaded, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch Swipe Handlers (Horizontal only - does NOT hijack vertical scroll)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Horizontal dominance check
    if (
      Math.abs(deltaX) > SHOWCASE_CONFIG.SWIPE_THRESHOLD &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      if (deltaX < 0) nextSlide();
      else prevSlide();
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Cleanup GSAP timelines on unmount
  useEffect(() => {
    return () => {
      if (timelineRef.current) timelineRef.current.kill();
    };
  }, []);

  // Determine Polygon and Layout classes
  const activeSlideData = currentSlide;
  const isRightSide = activeSlideData.side === "right";
  const incomingIsRight = incomingSlide?.side === "right";

  const initialClipPath =
    typeof window !== "undefined" && window.innerWidth < 768
      ? SHOWCASE_CONFIG.POLYGONS.MOBILE
      : isRightSide
      ? SHOWCASE_CONFIG.POLYGONS.RIGHT
      : SHOWCASE_CONFIG.POLYGONS.LEFT;

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen min-h-[700px] bg-[#262628] overflow-hidden select-none flex flex-col justify-between"
      onMouseEnter={() => {
        isHovered.current = true;
      }}
      onMouseLeave={() => {
        isHovered.current = false;
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Product Showcase"
    >
      {/* ─── Top Nav Row (z-50) ─────────────────────────────────── */}
      <header className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-6">
        <a href="/" className="inline-block" aria-label="Mellosoft Home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="Mellosoft"
            className="h-9 sm:h-11 w-auto object-contain brightness-0 invert"
          />
        </a>

        <nav
          aria-label="Showcase Navigation"
          className="flex items-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium tracking-widest text-white/70"
        >
          <a href="/" className="hover:text-white transition-colors">
            HOME
          </a>
          <a href="#products" className="hover:text-white transition-colors">
            PRODUCTS
          </a>
          <a href="#collections" className="hover:text-white transition-colors">
            COLLECTIONS
          </a>
          <a href="#about" className="hover:text-white transition-colors">
            ABOUT
          </a>
          <a href="#contact" className="hover:text-white transition-colors">
            CONTACT
          </a>
          <button
            className="p-1 hover:text-white text-white/70 transition-colors"
            aria-label="User Account"
          >
            <UserRound size={19} />
          </button>
        </nav>
      </header>

      {/* ─── Color Panel with GSAP Clip-Path (z-0) ─────────────── */}
      <div
        ref={panelRef}
        className="absolute inset-0 z-0 pointer-events-none transition-shadow"
        style={{
          clipPath: initialClipPath,
          backgroundColor: activeSlideData.color,
        }}
      />

      {/* ─── Giant Behind-the-Product Label (z-10) ─────────────── */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Old Label */}
        <div
          ref={oldLabelRef}
          className={`${montserrat.className} absolute font-extrabold text-white leading-none tracking-[-0.02em] opacity-40 select-none text-[22vw] md:text-[20vw]`}
          style={{
            transform: isRightSide
              ? "translateX(15vw)"
              : "translateX(-15vw)",
          }}
        >
          {activeSlideData.label}
        </div>

        {/* Incoming Label */}
        {incomingSlide && (
          <div
            ref={newLabelRef}
            className={`${montserrat.className} absolute font-extrabold text-white leading-none tracking-[-0.02em] opacity-0 select-none text-[22vw] md:text-[20vw]`}
            style={{
              transform: incomingIsRight
                ? "translateX(15vw)"
                : "translateX(-15vw)",
            }}
          >
            {incomingSlide.label}
          </div>
        )}
      </div>

      {/* ─── Main Content Canvas (z-20 / z-30) ─────────────────── */}
      <div className="relative w-full flex-1 flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 lg:px-20 z-20 pt-20 md:pt-0">
        {/* ── Text Block ── */}
        <div
          className={`w-full md:w-1/2 flex flex-col justify-center py-6 z-30 ${
            isRightSide
              ? "md:order-1 md:pl-[4vw] md:pr-8"
              : "md:order-2 md:pr-[4vw] md:pl-8 text-left md:text-right md:items-end"
          }`}
        >
          {/* Active Text Block */}
          <div className="relative">
            <h1
              ref={oldTitleRef}
              aria-live="polite"
              className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight leading-tight"
            >
              {activeSlideData.title}
            </h1>
            <p
              ref={oldSubtitleRef}
              className="text-sm sm:text-base text-white/60 mt-3 font-normal tracking-wide"
            >
              {activeSlideData.subtitle}
            </p>
            <div className="mt-8">
              <a
                ref={oldButtonRef}
                href="#products"
                className="inline-block px-8 py-3 rounded-full border border-white/40 text-xs sm:text-sm font-medium tracking-widest text-white uppercase transition-all duration-300 hover:border-transparent"
                style={{
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = activeSlideData.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Discover more
              </a>
            </div>
          </div>

          {/* Incoming Text Block (during animation) */}
          {incomingSlide && (
            <div
              className={`absolute top-0 left-0 w-full pointer-events-none ${
                incomingIsRight
                  ? "text-left items-start"
                  : "text-left md:text-right md:items-end"
              }`}
            >
              <h1
                ref={newTitleRef}
                className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight leading-tight opacity-0"
              >
                {incomingSlide.title}
              </h1>
              <p
                ref={newSubtitleRef}
                className="text-sm sm:text-base text-white/60 mt-3 font-normal tracking-wide opacity-0"
              >
                {incomingSlide.subtitle}
              </p>
              <div className="mt-8">
                <a
                  ref={newButtonRef}
                  href="#products"
                  className="inline-block px-8 py-3 rounded-full border border-white/40 text-xs sm:text-sm font-medium tracking-widest text-white uppercase opacity-0"
                >
                  Discover more
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ── Product & Specs Area ── */}
        <div
          className={`w-full md:w-1/2 h-[340px] sm:h-[420px] lg:h-[520px] relative flex items-end justify-center ${
            isRightSide ? "md:order-2" : "md:order-1"
          }`}
        >
          {/* Active Product Slices (8 horizontal slices) */}
          <div
            ref={oldProductRef}
            className="absolute bottom-0 w-[300px] sm:w-[420px] lg:w-[560px] h-[280px] sm:h-[380px] lg:h-[480px] z-20 pointer-events-none"
          >
            {imageErrors[activeSlideData.slug] ? (
              <div className="w-full h-full rounded-3xl bg-[#EFE8DE] flex items-center justify-center text-stone-600 font-medium">
                {activeSlideData.title}
              </div>
            ) : (
              <div className="relative w-full h-full">
                {Array.from({ length: SLICE_COUNT }).map((_, i) => (
                  <div
                    key={`old-slice-${i}`}
                    ref={(el) => {
                      if (el) oldSlicesRef.current[i] = el;
                    }}
                    className="w-full relative overflow-hidden"
                    style={{
                      height: `${100 / SLICE_COUNT}%`,
                      backgroundImage: `url(${activeSlideData.image})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "contain",
                      backgroundPosition: `center ${(i / (SLICE_COUNT - 1)) * 100}%`,
                    }}
                  />
                ))}
              </div>
            )}
            {/* Soft Shadow under Product */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-10 bg-black/50 blur-xl rounded-full pointer-events-none" />
          </div>

          {/* Incoming Product Slices (during animation) */}
          {incomingSlide && (
            <div
              ref={newProductRef}
              className="absolute bottom-0 w-[300px] sm:w-[420px] lg:w-[560px] h-[280px] sm:h-[380px] lg:h-[480px] z-20 pointer-events-none"
            >
              {imageErrors[incomingSlide.slug] ? (
                <div className="w-full h-full rounded-3xl bg-[#EFE8DE] flex items-center justify-center text-stone-600 font-medium">
                  {incomingSlide.title}
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {Array.from({ length: SLICE_COUNT }).map((_, i) => (
                    <div
                      key={`new-slice-${i}`}
                      ref={(el) => {
                        if (el) newSlicesRef.current[i] = el;
                      }}
                      className="w-full relative overflow-hidden opacity-0"
                      style={{
                        height: `${100 / SLICE_COUNT}%`,
                        backgroundImage: `url(${incomingSlide.image})`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "contain",
                        backgroundPosition: `center ${(i / (SLICE_COUNT - 1)) * 100}%`,
                      }}
                    />
                  ))}
                </div>
              )}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-10 bg-black/50 blur-xl rounded-full pointer-events-none" />
            </div>
          )}

          {/* ── Specs List ── */}
          <div
            ref={oldSpecsRef}
            className={`absolute z-30 bottom-4 md:bottom-12 ${
              isRightSide
                ? "left-0 sm:left-4"
                : "right-0 sm:right-4"
            } flex flex-row md:flex-col gap-6 md:gap-4 border-l border-white/20 pl-4`}
          >
            {activeSlideData.specs.map((spec, i) => (
              <div key={`spec-${i}`} className="flex flex-col">
                <span
                  ref={(el) => {
                    specValueRefs.current[i] = el;
                  }}
                  className="text-xl sm:text-2xl font-bold text-white tracking-tight"
                >
                  {spec.value}
                </span>
                <span
                  ref={(el) => {
                    specLabelRefs.current[i] = el;
                  }}
                  className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest mt-0.5"
                >
                  {spec.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Bottom Navigation & Controls (z-40) ────────────────── */}
      <footer className="relative w-full z-40 flex items-center justify-between px-6 sm:px-12 lg:px-16 py-6">
        {/* Left spacing placeholder */}
        <div className="w-16 hidden sm:block" />

        {/* Center: Arrows & Dots */}
        <div className="flex items-center gap-4 sm:gap-6 mx-auto">
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-2.5">
            {SHOWCASE_SLIDES.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.slug}
                  onClick={() => goTo(idx)}
                  aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                  className={`transition-all duration-300 rounded-full ${
                    isActive
                      ? "w-7 h-2 bg-white"
                      : "w-2 h-2 bg-white/30 hover:bg-white/60"
                  }`}
                  style={{
                    backgroundColor: isActive ? slide.color : undefined,
                  }}
                />
              );
            })}
          </div>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Right: Slide Counter */}
        <div className="font-mono text-xs sm:text-sm text-white/60 tracking-wider">
          0{currentIndex + 1} / 0{SHOWCASE_SLIDES.length}
        </div>
      </footer>
    </section>
  );
}
