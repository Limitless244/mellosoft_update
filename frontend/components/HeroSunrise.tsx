"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/* ─── Tunable Constants Configuration ────────────────────────────── */
export const SUNRISE_CONFIG = {
  STARS_COUNT: 36,
  NIGHT_COLOR: "#0B1026",
  NIGHT_OPACITY: 0.72,
  GLOW_COLORS:
    "radial-gradient(circle, rgba(255,176,102,0.95) 0%, rgba(232,116,59,0.55) 35%, transparent 70%)",
  GLOW_FINAL_OPACITY: 0.25,
  LAMP_COLOR:
    "radial-gradient(circle, rgba(255,196,130,0.28), transparent 65%)",
  SWEEP_GRADIENT:
    "linear-gradient(90deg, transparent, rgba(255,210,160,0.55), transparent)",
  DURATIONS: {
    INTRO_TOTAL: 3.0,
    INTRO_SHORT: 1.2,
    GLOW_RISE: 1.6,
    NIGHT_FADE: 1.7,
    STARS_FADE: 1.3,
    PHOTO_FILTER: 1.7,
    HEADING_REVEAL: 1.0,
    COPY_REVEAL: 0.8,
    BUTTON_SPIN: 0.8,
    CARDS_WAKE: 0.8,
    IDLE_FLOAT: 2.8,
    SWEEP: 0.9,
    REDUCED_MOTION_FADE: 0.4,
    FAILSAFE_MS: 4500,
  },
  OFFSETS: {
    PARALLAX_PHOTO: 12,
    PARALLAX_CARDS: 16,
    PARALLAX_TEXT: 6,
    MAGNETIC_BUTTON_DIST: 90,
    MAGNETIC_BUTTON_MAX: 8,
    TILT_CARD_Y: 7,
    TILT_CARD_X: 5,
  },
};

/* ─── 36 Deterministic Stars (random positions in top 60% of hero) ── */
const STARS = [
  { left: "7%", top: "11%", size: 2.5, dur: "2.8s", delay: "0.2s" },
  { left: "13%", top: "27%", size: 2.0, dur: "3.5s", delay: "1.1s" },
  { left: "21%", top: "9%", size: 3.0, dur: "2.2s", delay: "0.5s" },
  { left: "28%", top: "41%", size: 2.2, dur: "3.1s", delay: "1.8s" },
  { left: "34%", top: "17%", size: 2.8, dur: "2.5s", delay: "0.3s" },
  { left: "40%", top: "34%", size: 2.0, dur: "3.8s", delay: "2.2s" },
  { left: "47%", top: "10%", size: 3.0, dur: "2.9s", delay: "0.7s" },
  { left: "52%", top: "47%", size: 2.4, dur: "3.3s", delay: "1.4s" },
  { left: "58%", top: "21%", size: 2.6, dur: "2.4s", delay: "0.9s" },
  { left: "63%", top: "14%", size: 2.0, dur: "3.6s", delay: "1.6s" },
  { left: "70%", top: "37%", size: 3.0, dur: "2.7s", delay: "0.4s" },
  { left: "76%", top: "11%", size: 2.2, dur: "3.2s", delay: "1.9s" },
  { left: "82%", top: "44%", size: 2.5, dur: "2.6s", delay: "0.8s" },
  { left: "88%", top: "19%", size: 2.8, dur: "3.4s", delay: "1.3s" },
  { left: "93%", top: "31%", size: 2.0, dur: "2.3s", delay: "0.1s" },
  { left: "5%", top: "37%", size: 2.2, dur: "3.7s", delay: "2.0s" },
  { left: "11%", top: "51%", size: 2.6, dur: "2.5s", delay: "0.6s" },
  { left: "17%", top: "19%", size: 3.0, dur: "3.0s", delay: "1.5s" },
  { left: "24%", top: "54%", size: 2.1, dur: "2.8s", delay: "0.2s" },
  { left: "31%", top: "29%", size: 2.7, dur: "3.9s", delay: "2.4s" },
  { left: "37%", top: "49%", size: 2.3, dur: "2.4s", delay: "1.0s" },
  { left: "44%", top: "24%", size: 2.8, dur: "3.2s", delay: "0.5s" },
  { left: "50%", top: "15%", size: 2.0, dur: "2.6s", delay: "1.7s" },
  { left: "55%", top: "38%", size: 3.0, dur: "3.5s", delay: "0.3s" },
  { left: "61%", top: "53%", size: 2.2, dur: "2.9s", delay: "1.2s" },
  { left: "67%", top: "26%", size: 2.5, dur: "3.1s", delay: "2.1s" },
  { left: "73%", top: "50%", size: 2.1, dur: "2.7s", delay: "0.8s" },
  { left: "79%", top: "32%", size: 2.9, dur: "3.4s", delay: "1.5s" },
  { left: "85%", top: "56%", size: 2.4, dur: "2.3s", delay: "0.4s" },
  { left: "91%", top: "47%", size: 2.6, dur: "3.8s", delay: "1.9s" },
  { left: "15%", top: "43%", size: 2.0, dur: "2.9s", delay: "1.1s" },
  { left: "26%", top: "13%", size: 2.7, dur: "3.3s", delay: "0.7s" },
  { left: "42%", top: "45%", size: 2.4, dur: "2.5s", delay: "1.6s" },
  { left: "65%", top: "7%", size: 2.8, dur: "3.6s", delay: "0.9s" },
  { left: "77%", top: "23%", size: 2.1, dur: "2.8s", delay: "1.4s" },
  { left: "87%", top: "8%", size: 3.0, dur: "3.0s", delay: "0.3s" },
];

interface HeroSunriseProps {
  activeSlide?: number;
}

export default function HeroSunrise({ activeSlide = 0 }: HeroSunriseProps) {
  // Prevent SSR hydration mismatch: only mount dynamic overlay tree on client
  const [mounted, setMounted] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const lampRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const nightTintRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);

  const prevSlideRef = useRef<number>(activeSlide);
  const isFirstSlideRender = useRef<boolean>(true);
  const idleTweenRef = useRef<gsap.core.Tween | null>(null);

  const [showNightOverlay, setShowNightOverlay] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ─── Slide Change Light Sweep ─────────────────────────────────── */
  useEffect(() => {
    if (!mounted) return;

    if (isFirstSlideRender.current) {
      isFirstSlideRender.current = false;
      return;
    }

    if (prevSlideRef.current !== activeSlide) {
      prevSlideRef.current = activeSlide;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      if (sweepRef.current) {
        gsap.fromTo(
          sweepRef.current,
          {
            left: "-40%",
            opacity: 1,
          },
          {
            left: "140%",
            duration: SUNRISE_CONFIG.DURATIONS.SWEEP,
            ease: "power2.inOut",
            onComplete: () => {
              if (sweepRef.current) {
                gsap.set(sweepRef.current, { opacity: 0 });
              }
            },
          }
        );
      }
    }
  }, [activeSlide, mounted]);

  /* ─── Main Intro & Cursor Interaction Controller ────────────────── */
  useEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    if (!container) return;

    const heroEl = container.closest<HTMLElement>(".hero") || document.querySelector<HTMLElement>(".hero");
    if (!heroEl) return;

    let alreadyPlayed = false;
    try {
      alreadyPlayed = sessionStorage.getItem("heroIntroPlayed") === "true";
    } catch {
      alreadyPlayed = false;
    }

    if (alreadyPlayed) {
      setShowNightOverlay(false);
    }

    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDesktopPointer = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;

    // Collect hero interactive/animated targets
    const photoImages = heroEl.querySelectorAll<HTMLElement>(".hero-photo img");
    const photoContainer = heroEl.querySelector<HTMLElement>(".hero-photo");
    const textBlock = heroEl.querySelector<HTMLElement>(".hero-copy");
    const headingLines = Array.from(heroEl.querySelectorAll<HTMLElement>(".hero-slide-one h1 > .hero-word"));
    const eyebrow = heroEl.querySelector<HTMLElement>(".hero-slide-one .eyebrow");
    const paragraph = heroEl.querySelector<HTMLElement>(".hero-slide-one .hero-sub");
    const shopNowBtn = heroEl.querySelector<HTMLElement>(".hero-slide-one a.pill");
    const buttonArrow = heroEl.querySelector<HTMLElement>(".hero-slide-one a.pill span");

    const pillowsCard = heroEl.querySelector<HTMLElement>('img[alt="Pillows"]')?.parentElement;
    const firmCard = heroEl.querySelector<HTMLElement>('img[alt="Firm Mattresses"]')?.parentElement;
    const bedsCard = heroEl.querySelector<HTMLElement>('img[alt="Beds"]')?.parentElement;
    const cardStack = pillowsCard?.parentElement;
    const cards = [pillowsCard, firmCard, bedsCard].filter(Boolean) as HTMLElement[];

    const copyElements = [eyebrow, paragraph, shopNowBtn].filter(Boolean) as HTMLElement[];

    /* ─── SAFETY RULE: Failsafe Timeout (4500ms) ─── */
    const failsafeTimer = setTimeout(() => {
      const allTargets = [
        ...headingLines,
        ...copyElements,
        ...cards,
        photoContainer,
        textBlock,
        cardStack,
      ].filter(Boolean) as HTMLElement[];

      gsap.set(allTargets, { clearProps: "all" });
      if (photoImages.length > 0) {
        gsap.set(photoImages, { clearProps: "filter" });
      }
      setShowNightOverlay(false);
      try {
        sessionStorage.setItem("heroIntroPlayed", "true");
      } catch {}
    }, SUNRISE_CONFIG.DURATIONS.FAILSAFE_MS);

    /* ─── Context for GSAP Animations & Tweens ─── */
    const ctx = gsap.context(() => {
      /* ── 1. Reduced Motion Mode ── */
      if (isReducedMotion) {
        setShowNightOverlay(false);
        if (glowRef.current) {
          gsap.set(glowRef.current, {
            opacity: SUNRISE_CONFIG.GLOW_FINAL_OPACITY,
            scale: 1.6,
            y: "-5%",
          });
        }
        if (!alreadyPlayed) {
          gsap.from(".hero-slide-one", {
            opacity: 0,
            duration: SUNRISE_CONFIG.DURATIONS.REDUCED_MOTION_FADE,
            clearProps: "opacity",
          });
          try {
            sessionStorage.setItem("heroIntroPlayed", "true");
          } catch {}
        }
        return;
      }

      /* ── 2. If Intro Already Played: Instant Final State ── */
      if (alreadyPlayed) {
        setShowNightOverlay(false);
        if (glowRef.current) {
          gsap.set(glowRef.current, {
            opacity: SUNRISE_CONFIG.GLOW_FINAL_OPACITY,
            scale: 1.6,
            y: "-5%",
          });
        }
        // Start idle float on front card
        if (bedsCard) {
          idleTweenRef.current = gsap.to(bedsCard, {
            y: "+=7",
            duration: SUNRISE_CONFIG.DURATIONS.IDLE_FLOAT,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }
      } else {
        /* ── 3. First Visit: Play Sunrise Wake-Up Intro ── */
        // Kill any racing tweens on initial words
        gsap.killTweensOf(".hero-slide-one .hero-word");
        gsap.set(".hero-slide-one .hero-word", { clearProps: "opacity,transform" });

        // Wrap heading lines in overflow-hidden masks
        headingLines.forEach((line) => {
          if (line.parentElement?.classList.contains("hero-line-mask")) return;
          const maskWrapper = document.createElement("span");
          maskWrapper.className = "hero-line-mask";
          maskWrapper.style.display = "block";
          maskWrapper.style.overflow = "hidden";
          maskWrapper.style.paddingBottom = "0.05em";
          line.parentNode?.insertBefore(maskWrapper, line);
          maskWrapper.appendChild(line);
        });

        const isMobileOrTouch = !isDesktopPointer;

        if (isMobileOrTouch) {
          /* Shortened 1.2s mobile/touch intro */
          const shortTl = gsap.timeline({
            onComplete: () => {
              setShowNightOverlay(false);
              try {
                sessionStorage.setItem("heroIntroPlayed", "true");
              } catch {}
              gsap.set([...headingLines, ...copyElements, ...cards], {
                clearProps: "opacity,transform,visibility",
              });
            },
          });

          if (glowRef.current) {
            shortTl.fromTo(
              glowRef.current,
              { y: "70%", scale: 0.3, opacity: 1 },
              { y: "-5%", scale: 1.6, duration: 1.0, ease: "power2.out" },
              0
            );
            shortTl.to(
              glowRef.current,
              { opacity: SUNRISE_CONFIG.GLOW_FINAL_OPACITY, duration: 0.2 },
              1.0
            );
          }

          if (nightTintRef.current) {
            shortTl.to(nightTintRef.current, { opacity: 0, duration: 1.0, ease: "power2.inOut" }, 0);
          }

          if (starsRef.current) {
            shortTl.to(starsRef.current, { opacity: 0, duration: 0.8, ease: "power2.inOut" }, 0);
          }

          if (photoImages.length > 0) {
            gsap.set(photoImages, { filter: "brightness(0.45) saturate(0.6)" });
            shortTl.to(photoImages, { filter: "brightness(1) saturate(1)", duration: 1.0, clearProps: "filter" }, 0);
          }

          if (headingLines.length > 0) {
            shortTl.from(headingLines, {
              yPercent: 110,
              duration: 0.8,
              ease: "power4.out",
              stagger: 0.1,
              clearProps: "opacity,transform,visibility",
            }, 0.2);
          }

          if (copyElements.length > 0) {
            shortTl.from(copyElements, {
              opacity: 0,
              y: 16,
              duration: 0.6,
              stagger: 0.08,
              clearProps: "opacity,transform,visibility",
            }, 0.4);
          }
        } else {
          /* Full 3.0s Desktop Intro */
          const fullTl = gsap.timeline({
            onComplete: () => {
              setShowNightOverlay(false);
              try {
                sessionStorage.setItem("heroIntroPlayed", "true");
              } catch {}
              gsap.set([...headingLines, ...copyElements, ...cards], {
                clearProps: "opacity,transform,visibility",
              });
              if (photoImages.length > 0) {
                gsap.set(photoImages, { clearProps: "filter" });
              }
            },
          });

          // 0.0 - 1.6s: Sunrise glow rises
          if (glowRef.current) {
            fullTl.fromTo(
              glowRef.current,
              { y: "70%", scale: 0.3, opacity: 1 },
              {
                y: "-5%",
                scale: 1.6,
                duration: SUNRISE_CONFIG.DURATIONS.GLOW_RISE,
                ease: "power2.out",
              },
              0
            );
          }

          // Initial photo filter
          if (photoImages.length > 0) {
            gsap.set(photoImages, { filter: "brightness(0.45) saturate(0.6)" });
            fullTl.to(
              photoImages,
              {
                filter: "brightness(1) saturate(1)",
                duration: SUNRISE_CONFIG.DURATIONS.PHOTO_FILTER,
                ease: "power2.inOut",
                clearProps: "filter",
              },
              0.3
            );
          }

          // 0.3 - 2.0s: Night tint fades to 0
          if (nightTintRef.current) {
            fullTl.to(
              nightTintRef.current,
              {
                opacity: 0,
                duration: SUNRISE_CONFIG.DURATIONS.NIGHT_FADE,
                ease: "power2.inOut",
              },
              0.3
            );
          }

          // 0.3 - 1.6s: Stars fade slightly earlier
          if (starsRef.current) {
            fullTl.to(
              starsRef.current,
              {
                opacity: 0,
                duration: SUNRISE_CONFIG.DURATIONS.STARS_FADE,
                ease: "power2.inOut",
              },
              0.3
            );
          }

          // 0.8 - 1.8s: Heading lines reveal from overflow-hidden mask
          if (headingLines.length > 0) {
            fullTl.from(
              headingLines,
              {
                yPercent: 110,
                duration: SUNRISE_CONFIG.DURATIONS.HEADING_REVEAL,
                ease: "power4.out",
                stagger: 0.14,
                clearProps: "opacity,transform,visibility",
              },
              0.8
            );

            // Shimmer highlight sweep over warm highlight elements
            const warmHighlights = Array.from(
              heroEl.querySelectorAll<HTMLElement>(".hero-slide-one h1 .hero-highlight")
            );

            warmHighlights.forEach((warmEl, idx) => {
              const shimmerClone = document.createElement("span");
              shimmerClone.innerText = warmEl.innerText;
              shimmerClone.className = "hero-shimmer-sweep pointer-events-none select-none";
              shimmerClone.style.position = "absolute";
              shimmerClone.style.left = "0";
              shimmerClone.style.top = "0";
              shimmerClone.style.width = "100%";
              shimmerClone.style.height = "100%";
              shimmerClone.style.backgroundImage =
                "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.95) 50%, transparent 80%)";
              shimmerClone.style.backgroundSize = "200% 100%";
              shimmerClone.style.backgroundPosition = "150% 0";
              shimmerClone.style.backgroundClip = "text";
              shimmerClone.style.webkitBackgroundClip = "text";
              shimmerClone.style.color = "transparent";
              shimmerClone.style.zIndex = "2";

              warmEl.style.position = "relative";
              warmEl.appendChild(shimmerClone);

              fullTl.to(
                shimmerClone,
                {
                  backgroundPosition: "-50% 0",
                  duration: 0.75,
                  ease: "power2.out",
                  onComplete: () => {
                    shimmerClone.remove();
                  },
                },
                1.3 + idx * 0.12
              );
            });
          }

          // 1.4 - 2.2s: Eyebrow, paragraph and button fade & rise
          if (copyElements.length > 0) {
            fullTl.from(
              copyElements,
              {
                opacity: 0,
                y: 16,
                duration: SUNRISE_CONFIG.DURATIONS.COPY_REVEAL,
                stagger: 0.08,
                ease: "power2.out",
                clearProps: "opacity,transform,visibility",
              },
              1.4
            );
          }

          // Button arrow circle spin 0 to 360deg
          if (buttonArrow) {
            fullTl.fromTo(
              buttonArrow,
              { rotate: 0 },
              {
                rotate: 360,
                duration: SUNRISE_CONFIG.DURATIONS.BUTTON_SPIN,
                ease: "power2.out",
                clearProps: "transform",
              },
              1.4
            );
          }

          // 1.6 - 2.6s: Floating card stack wakes up
          if (cards.length > 0) {
            fullTl.from(
              cards,
              {
                y: "-=60",
                rotation: "-=6",
                opacity: 0,
                duration: SUNRISE_CONFIG.DURATIONS.CARDS_WAKE,
                ease: "back.out(1.3)",
                stagger: 0.12,
                clearProps: "opacity,visibility",
                onComplete: () => {
                  if (bedsCard && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                    idleTweenRef.current = gsap.to(bedsCard, {
                      y: "+=7",
                      duration: SUNRISE_CONFIG.DURATIONS.IDLE_FLOAT,
                      repeat: -1,
                      yoyo: true,
                      ease: "sine.inOut",
                    });
                  }
                },
              },
              1.6
            );
          }

          // 2.2 - 3.0s: Sunrise glow fades to 0.25 opacity warm vignette
          if (glowRef.current) {
            fullTl.to(
              glowRef.current,
              {
                opacity: SUNRISE_CONFIG.GLOW_FINAL_OPACITY,
                duration: 0.8,
                ease: "power2.out",
              },
              2.2
            );
          }
        }
      }

      /* ── 4. PART 2: Desktop Cursor Interaction ── */
      if (isDesktopPointer && !isReducedMotion) {
        const lamp = lampRef.current;

        // Lamp glow quickTo
        const lampX = lamp ? gsap.quickTo(lamp, "x", { duration: 0.45, ease: "power3.out" }) : null;
        const lampY = lamp ? gsap.quickTo(lamp, "y", { duration: 0.45, ease: "power3.out" }) : null;

        // Depth parallax quickTo
        const photoQuickX = photoImages.length > 0 ? gsap.quickTo(photoImages, "x", { duration: 0.8, ease: "power2.out" }) : null;
        const photoQuickY = photoImages.length > 0 ? gsap.quickTo(photoImages, "y", { duration: 0.8, ease: "power2.out" }) : null;

        const cardQuickX = cardStack ? gsap.quickTo(cardStack, "x", { duration: 0.8, ease: "power2.out" }) : null;
        const cardQuickY = cardStack ? gsap.quickTo(cardStack, "y", { duration: 0.8, ease: "power2.out" }) : null;

        const textQuickX = textBlock ? gsap.quickTo(textBlock, "x", { duration: 0.8, ease: "power2.out" }) : null;

        // Front card 3D tilt quickTo
        if (bedsCard) {
          gsap.set(bedsCard, { transformPerspective: 900, transformStyle: "preserve-3d" });
        }
        const tiltQuickY = bedsCard ? gsap.quickTo(bedsCard, "rotateY", { duration: 0.8, ease: "power2.out" }) : null;
        const tiltQuickX = bedsCard ? gsap.quickTo(bedsCard, "rotateX", { duration: 0.8, ease: "power2.out" }) : null;

        let isBtnMagnetic = false;

        const handleMouseEnter = () => {
          if (lamp) {
            gsap.to(lamp, { opacity: 1, duration: 0.3, overwrite: "auto" });
          }
        };

        const handleMouseLeave = () => {
          if (lamp) {
            gsap.to(lamp, { opacity: 0, duration: 0.3, overwrite: "auto" });
          }
          // Reset parallax
          photoQuickX?.(0);
          photoQuickY?.(0);
          cardQuickX?.(0);
          cardQuickY?.(0);
          textQuickX?.(0);
          // Reset card tilt
          tiltQuickY?.(0);
          tiltQuickX?.(0);
          // Reset magnetic button
          if (shopNowBtn && isBtnMagnetic) {
            isBtnMagnetic = false;
            gsap.to(shopNowBtn, {
              x: 0,
              y: 0,
              duration: 0.7,
              ease: "elastic.out(1, 0.5)",
              overwrite: "auto",
            });
          }
        };

        const handleMouseMove = (e: MouseEvent) => {
          const rect = heroEl.getBoundingClientRect();
          const relX = e.clientX - rect.left;
          const relY = e.clientY - rect.top;

          // Normalized coords (-1 to 1)
          const normX = (relX / rect.width) * 2 - 1;
          const normY = (relY / rect.height) * 2 - 1;

          // Lamp position
          lampX?.(relX);
          lampY?.(relY);

          // Parallax (background photo moves opposite to cursor)
          photoQuickX?.(-normX * SUNRISE_CONFIG.OFFSETS.PARALLAX_PHOTO);
          photoQuickY?.(-normY * SUNRISE_CONFIG.OFFSETS.PARALLAX_PHOTO);

          // Card stack parallax
          cardQuickX?.(normX * SUNRISE_CONFIG.OFFSETS.PARALLAX_CARDS);
          cardQuickY?.(normY * SUNRISE_CONFIG.OFFSETS.PARALLAX_CARDS);

          // Text block parallax
          textQuickX?.(normX * SUNRISE_CONFIG.OFFSETS.PARALLAX_TEXT);

          // Front card 3D tilt
          tiltQuickY?.(normX * SUNRISE_CONFIG.OFFSETS.TILT_CARD_Y);
          tiltQuickX?.(-normY * SUNRISE_CONFIG.OFFSETS.TILT_CARD_X);

          // Magnetic Shop Now button
          if (shopNowBtn) {
            const btnRect = shopNowBtn.getBoundingClientRect();
            const btnCenterX = btnRect.left + btnRect.width / 2;
            const btnCenterY = btnRect.top + btnRect.height / 2;
            const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

            if (dist < SUNRISE_CONFIG.OFFSETS.MAGNETIC_BUTTON_DIST) {
              const pull =
                (1 - dist / SUNRISE_CONFIG.OFFSETS.MAGNETIC_BUTTON_DIST) *
                SUNRISE_CONFIG.OFFSETS.MAGNETIC_BUTTON_MAX;
              const angle = Math.atan2(e.clientY - btnCenterY, e.clientX - btnCenterX);
              const tx = Math.cos(angle) * pull;
              const ty = Math.sin(angle) * pull;

              gsap.to(shopNowBtn, {
                x: tx,
                y: ty,
                duration: 0.25,
                ease: "power2.out",
                overwrite: "auto",
              });
              isBtnMagnetic = true;
            } else if (isBtnMagnetic) {
              isBtnMagnetic = false;
              gsap.to(shopNowBtn, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: "elastic.out(1, 0.5)",
                overwrite: "auto",
              });
            }
          }
        };

        heroEl.addEventListener("mouseenter", handleMouseEnter);
        heroEl.addEventListener("mouseleave", handleMouseLeave);
        heroEl.addEventListener("mousemove", handleMouseMove);

        return () => {
          heroEl.removeEventListener("mouseenter", handleMouseEnter);
          heroEl.removeEventListener("mouseleave", handleMouseLeave);
          heroEl.removeEventListener("mousemove", handleMouseMove);
        };
      }
    }, container);

    return () => {
      clearTimeout(failsafeTimer);
      if (idleTweenRef.current) {
        idleTweenRef.current.kill();
      }
      ctx.revert();
    };
  }, [mounted]);

  // Server and initial client render return null for perfect hydration consistency
  if (!mounted) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="hero-sunrise-layers pointer-events-none absolute inset-0 overflow-hidden select-none z-[6]"
      aria-hidden="true"
    >
      {/* Layer 1: Night Tint */}
      {showNightOverlay && (
        <div
          ref={nightTintRef}
          className="absolute inset-0 pointer-events-none z-[6]"
          style={{
            backgroundColor: SUNRISE_CONFIG.NIGHT_COLOR,
            opacity: SUNRISE_CONFIG.NIGHT_OPACITY,
          }}
        />
      )}

      {/* Layer 2: 36 Twinkling Stars in Top 60% */}
      {showNightOverlay && (
        <div
          ref={starsRef}
          className="absolute inset-x-0 top-0 h-[60%] pointer-events-none overflow-hidden z-[7]"
        >
          {STARS.map((star, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white pointer-events-none"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                boxShadow: `0 0 ${star.size + 1}px rgba(255,255,255,0.85)`,
                animation: `heroStarTwinkle ${star.dur} ease-in-out infinite alternate`,
                animationDelay: star.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Layer 3: Sunrise Glow (Circle 140% of hero width) */}
      <div
        ref={glowRef}
        className="absolute pointer-events-none rounded-full origin-bottom z-[8]"
        style={{
          width: "140%",
          paddingBottom: "140%",
          left: "-20%",
          bottom: "-30%",
          background: SUNRISE_CONFIG.GLOW_COLORS,
          mixBlendMode: "screen",
          opacity: 1,
          transform: "scale(0.3) translateY(70%)",
          willChange: "transform, opacity",
        }}
      />

      {/* Cursor Lamp Glow (Desktop 360px circle) */}
      <div
        ref={lampRef}
        className="absolute pointer-events-none rounded-full z-[8]"
        style={{
          width: 360,
          height: 360,
          left: 0,
          top: 0,
          background: SUNRISE_CONFIG.LAMP_COLOR,
          mixBlendMode: "soft-light",
          opacity: 0,
          transform: "translate(-50%, -50%)",
          willChange: "transform, opacity",
        }}
      />

      {/* Slide Change Light Sweep Bar */}
      <div
        ref={sweepRef}
        className="absolute pointer-events-none z-[8]"
        style={{
          top: "-25%",
          bottom: "-25%",
          width: "28%",
          left: "-40%",
          background: SUNRISE_CONFIG.SWEEP_GRADIENT,
          transform: "skewX(-18deg)",
          mixBlendMode: "screen",
          opacity: 0,
          willChange: "left, opacity",
        }}
      />
    </div>
  );
}
