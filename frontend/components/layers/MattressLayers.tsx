"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── DATA DEFINITION ────────────────────────────────────────────── */
export interface MattressLayerItem {
  id: string;
  title: string;
  text: string;
  color: string;
  edgeColor: string;
}

export const MATTRESS_LAYERS_DATA: MattressLayerItem[] = [
  {
    id: "quilted-cover",
    title: "Quilted cover",
    text: "Breathable, soft-touch fabric that keeps you cool.",
    color: "#F3E9DC",
    edgeColor: "#D8C7B0",
  },
  {
    id: "comfort-foam",
    title: "Comfort foam",
    text: "A gentle first layer that relieves pressure points.",
    color: "#E8C9A0",
    edgeColor: "#CBA674",
  },
  {
    id: "memory-foam",
    title: "Memory foam",
    text: "Contours to your body and absorbs movement.",
    color: "#C4561F",
    edgeColor: "#9B3F11",
  },
  {
    id: "support-core",
    title: "Support core",
    text: "Firm, even support for your spine through the night.",
    color: "#1F6F63",
    edgeColor: "#134D44",
  },
  {
    id: "base-layer",
    title: "Base layer",
    text: "Stable foundation that keeps everything in shape.",
    color: "#3A3532",
    edgeColor: "#221E1C",
  },
];

/* ─── CONSTANTS CONFIGURATION ────────────────────────────────────── */
export const LAYERS_CONFIG = {
  LAYER_WIDTH: 420,
  LAYER_HEIGHT: 270,
  THICKNESS: 22,
  GAP_CLOSED: 0,
  GAP_EXPLODED: 80,
  SPOTLIGHT_LIFT: 30,
  STAGGER_EXPLODE: 0.04,
  ROTATION_INITIAL: { x: 58, z: -32 },
  ROTATION_EXPLODED_DELTA_Z: -8, // 8 more degrees on Z depth
  ROTATION_MOBILE: { x: 55, z: -25 },
  PIN_END_DESKTOP: "+=400%",
  PIN_END_MOBILE: "+=300%",
  SCRUB: 0.8,
  TIMELINE: {
    FLOAT_IN_START: 0.0,
    FLOAT_IN_END: 0.12,
    SEPARATE_START: 0.12,
    SEPARATE_END: 0.4,
    SPOTLIGHT_START: 0.4,
    SPOTLIGHT_END: 0.85,
    COLLAPSE_START: 0.85,
    COLLAPSE_END: 1.0,
  },
};

export default function MattressLayers() {
  const sectionRef = useRef<HTMLElement>(null);
  const stackContainerRef = useRef<HTMLDivElement>(null);
  const stackWrapperRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLDivElement>(null);

  // References for each layer div and label card
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const connectorRefs = useRef<(SVGPathElement | null)[]>([]);

  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (typeof window === "undefined" || isReducedMotion) return;

    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      const stack = stackWrapperRef.current;
      const stackContainer = stackContainerRef.current;
      const progressBar = progressBarRef.current;
      const ctaButton = ctaButtonRef.current;

      if (!section || !stack || !stackContainer) return;

      const isMobile = window.innerWidth < 768;
      const totalLayers = MATTRESS_LAYERS_DATA.length;

      // ── Initial Setup ──
      // Calculate layer initial Z positions (Layer 0 at top, Layer 4 at base)
      layerRefs.current.forEach((layerEl, i) => {
        if (!layerEl) return;
        const initialZ = (totalLayers - 1 - i) * LAYERS_CONFIG.THICKNESS;
        gsap.set(layerEl, {
          z: initialZ,
          opacity: 1,
          filter: "brightness(1)",
        });
      });

      // Stack float-in start state
      gsap.set(stackContainer, {
        opacity: 0,
        y: 40,
      });

      // Labels initial state
      labelRefs.current.forEach((labelEl) => {
        if (!labelEl) return;
        gsap.set(labelEl, { opacity: 0, x: 60 });
      });

      // SVG connectors initial state
      connectorRefs.current.forEach((path) => {
        if (!path) return;
        const length = path.getTotalLength() || 180;
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
          opacity: 0,
        });
      });

      // CTA Button initial state
      if (ctaButton) {
        gsap.set(ctaButton, { opacity: 0, y: 25, pointerEvents: "none" });
      }

      // Progress bar initial state
      if (progressBar) {
        gsap.set(progressBar, { scaleY: 0, transformOrigin: "top" });
      }

      // ── Main Scroll Timeline ──
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          pinSpacing: true,
          start: "top top",
          end: isMobile
            ? LAYERS_CONFIG.PIN_END_MOBILE
            : LAYERS_CONFIG.PIN_END_DESKTOP,
          scrub: LAYERS_CONFIG.SCRUB,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Track active layer index for mobile display & accessibility
            const p = self.progress;
            const { SPOTLIGHT_START, SPOTLIGHT_END } = LAYERS_CONFIG.TIMELINE;
            if (p >= SPOTLIGHT_START && p <= SPOTLIGHT_END) {
              const spotProgress =
                (p - SPOTLIGHT_START) / (SPOTLIGHT_END - SPOTLIGHT_START);
              const idx = Math.min(
                totalLayers - 1,
                Math.floor(spotProgress * totalLayers)
              );
              setActiveLayerIndex(idx);
            }
          },
        },
      });

      // 0.00 to 1.00: Left progress bar
      if (progressBar) {
        tl.to(
          progressBar,
          {
            scaleY: 1,
            ease: "none",
          },
          0
        );
      }

      // ── Step 1: 0.00 to 0.12 - Float In ──
      tl.to(
        stackContainer,
        {
          opacity: 1,
          y: 0,
          ease: "none",
        },
        LAYERS_CONFIG.TIMELINE.FLOAT_IN_START
      );

      // ── Step 2: 0.12 to 0.40 - Explode / Separate Layers ──
      const initialZAngle = isMobile
        ? LAYERS_CONFIG.ROTATION_MOBILE.z
        : LAYERS_CONFIG.ROTATION_INITIAL.z;
      const targetZAngle =
        initialZAngle + LAYERS_CONFIG.ROTATION_EXPLODED_DELTA_Z;

      tl.to(
        stack,
        {
          rotateZ: targetZAngle,
          ease: "none",
        },
        LAYERS_CONFIG.TIMELINE.SEPARATE_START
      );

      // Translate layers vertically along Z axis with 0.04 stagger
      layerRefs.current.forEach((layerEl, i) => {
        if (!layerEl) return;
        const explodedZ =
          (totalLayers - 1 - i) *
          (LAYERS_CONFIG.THICKNESS + LAYERS_CONFIG.GAP_EXPLODED);

        tl.to(
          layerEl,
          {
            z: explodedZ,
            ease: "none",
          },
          LAYERS_CONFIG.TIMELINE.SEPARATE_START + i * LAYERS_CONFIG.STAGGER_EXPLODE
        );
      });

      // ── Step 3: 0.40 to 0.85 - Spotlight Sequence ──
      const spotRange =
        LAYERS_CONFIG.TIMELINE.SPOTLIGHT_END -
        LAYERS_CONFIG.TIMELINE.SPOTLIGHT_START;
      const stepDuration = spotRange / totalLayers;

      for (let i = 0; i < totalLayers; i++) {
        const stepStart =
          LAYERS_CONFIG.TIMELINE.SPOTLIGHT_START + i * stepDuration;
        const currentLayerEl = layerRefs.current[i];
        const currentLabelEl = labelRefs.current[i];
        const currentPath = connectorRefs.current[i];

        if (!currentLayerEl) continue;

        const baseExplodedZ =
          (totalLayers - 1 - i) *
          (LAYERS_CONFIG.THICKNESS + LAYERS_CONFIG.GAP_EXPLODED);

        // Highlight active layer: rises 32px, brightness 1
        tl.to(
          currentLayerEl,
          {
            z: baseExplodedZ + LAYERS_CONFIG.SPOTLIGHT_LIFT,
            opacity: 1,
            filter: "brightness(1.08)",
            ease: "none",
          },
          stepStart
        );

        // Dim other layers
        layerRefs.current.forEach((otherEl, otherIdx) => {
          if (otherIdx !== i && otherEl) {
            tl.to(
              otherEl,
              {
                opacity: 0.35,
                filter: "brightness(0.85)",
                ease: "none",
              },
              stepStart
            );
          }
        });

        // Slide in current label card from right
        if (currentLabelEl) {
          tl.to(
            currentLabelEl,
            {
              opacity: 1,
              x: 0,
              ease: "none",
            },
            stepStart
          );
        }

        // Draw SVG connector line
        if (currentPath) {
          const pathLen = currentPath.getTotalLength() || 180;
          tl.to(
            currentPath,
            {
              strokeDashoffset: 0,
              opacity: 0.7,
              ease: "none",
            },
            stepStart
          );
        }

        // If not the last layer, fade out as next layer activates
        if (i < totalLayers - 1) {
          const stepEnd = stepStart + stepDuration;

          // Return layer height to regular exploded Z
          tl.to(
            currentLayerEl,
            {
              z: baseExplodedZ,
              ease: "none",
            },
            stepEnd - 0.015
          );

          if (currentLabelEl) {
            tl.to(
              currentLabelEl,
              {
                opacity: 0,
                x: 20,
                ease: "none",
              },
              stepEnd - 0.015
            );
          }

          if (currentPath) {
            const pathLen = currentPath.getTotalLength() || 180;
            tl.to(
              currentPath,
              {
                strokeDashoffset: pathLen,
                opacity: 0,
                ease: "none",
              },
              stepEnd - 0.015
            );
          }
        }
      }

      // Fade out last label & connector before collapse
      const lastLabel = labelRefs.current[totalLayers - 1];
      const lastPath = connectorRefs.current[totalLayers - 1];
      const lastLayer = layerRefs.current[totalLayers - 1];
      const lastBaseZ =
        (totalLayers - 1 - (totalLayers - 1)) *
        (LAYERS_CONFIG.THICKNESS + LAYERS_CONFIG.GAP_EXPLODED);

      if (lastLayer) {
        tl.to(
          lastLayer,
          {
            z: lastBaseZ,
            ease: "none",
          },
          LAYERS_CONFIG.TIMELINE.COLLAPSE_START - 0.02
        );
      }
      if (lastLabel) {
        tl.to(
          lastLabel,
          {
            opacity: 0,
            x: 20,
            ease: "none",
          },
          LAYERS_CONFIG.TIMELINE.COLLAPSE_START - 0.02
        );
      }
      if (lastPath) {
        const pathLen = lastPath.getTotalLength() || 180;
        tl.to(
          lastPath,
          {
            strokeDashoffset: pathLen,
            opacity: 0,
            ease: "none",
          },
          LAYERS_CONFIG.TIMELINE.COLLAPSE_START - 0.02
        );
      }

      // ── Step 4: 0.85 to 1.00 - Compress Back Together ──
      // Revert stack rotation
      tl.to(
        stack,
        {
          rotateZ: initialZAngle,
          ease: "none",
        },
        LAYERS_CONFIG.TIMELINE.COLLAPSE_START
      );

      // Press layers together with tiny overshoot bounce (back.out(1.4))
      layerRefs.current.forEach((layerEl, i) => {
        if (!layerEl) return;
        const closedZ = (totalLayers - 1 - i) * LAYERS_CONFIG.THICKNESS;

        tl.to(
          layerEl,
          {
            z: closedZ,
            opacity: 1,
            filter: "brightness(1)",
            ease: "back.out(1.4)",
          },
          LAYERS_CONFIG.TIMELINE.COLLAPSE_START + 0.02
        );
      });

      // Reveal "Shop Mattresses" CTA button
      if (ctaButton) {
        tl.to(
          ctaButton,
          {
            opacity: 1,
            y: 0,
            pointerEvents: "auto",
            ease: "power2.out",
          },
          LAYERS_CONFIG.TIMELINE.COLLAPSE_START + 0.05
        );
      }
    }, sectionRef);

    // Refresh triggers after fonts are ready
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, [isReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen text-[#2A2421] overflow-hidden flex flex-col justify-between select-none"
      style={{ backgroundColor: "var(--cream, #FAF8F4)" }}
      aria-label="Mattress construction and layer breakdown"
    >
      {/* ── Left Edge Scroll Progress Indicator Line ── */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-stone-300/40 z-50">
        <div
          ref={progressBarRef}
          className="w-full h-full bg-[#C4561F] origin-top"
          style={{ transform: "scaleY(0)" }}
        />
      </div>

      {/* ── Top Header Row ── */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-12 pt-8 sm:pt-12 z-30 flex items-center justify-between">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.25em] font-semibold text-stone-600 hover:text-[#C4561F] transition-colors"
        >
          &larr; Mellosoft Home
        </Link>
        <span className="text-[11px] font-mono text-stone-500 tracking-widest uppercase">
          Interactive Anatomy
        </span>
      </header>

      {/* ── Main Interactive Anatomy Stage ── */}
      <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-12 flex-1 flex flex-col lg:flex-row items-center justify-between py-6 z-20">
        {/* ── Left Content: Eyebrow, Heading, Description ── */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center z-30 mb-8 lg:mb-0">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#C4561F] mb-3">
            INSIDE THE MATTRESS
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight leading-[1.08] text-[#2A2421]">
            Sleep in layers<span className="text-[#C4561F]">.</span>
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-4 max-w-md leading-relaxed font-normal">
            Five precision-engineered tiers crafted for pressure relief,
            breathability, and spinal alignment. Scroll to deconstruct each layer.
          </p>

          {/* Reduced-motion Fallback List */}
          {isReducedMotion && (
            <div className="mt-8 space-y-4 border-l-2 border-[#C4561F] pl-4">
              {MATTRESS_LAYERS_DATA.map((layer, idx) => (
                <div key={layer.id} className="text-left">
                  <span className="text-xs font-mono text-[#C4561F] font-bold">
                    0{idx + 1}
                  </span>
                  <h3 className="text-base font-semibold text-[#2A2421]">
                    {layer.title}
                  </h3>
                  <p className="text-xs text-stone-600">{layer.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Stage: 3D Layer Stack & Dynamic Labels ── */}
        <div
          ref={stackContainerRef}
          className="w-full lg:w-7/12 relative flex items-center justify-center min-h-[460px] sm:min-h-[540px]"
        >
          {/* 3D Perspective Container */}
          <div
            className="relative flex items-center justify-center"
            style={{
              perspective: "1400px",
              perspectiveOrigin: "50% 50%",
            }}
          >
            {/* Rotating 3D Isometric Wrapper */}
            <div
              ref={stackWrapperRef}
              className="relative transition-transform"
              style={{
                width: "420px",
                height: "270px",
                transformStyle: "preserve-3d",
                transform: `rotateX(${LAYERS_CONFIG.ROTATION_INITIAL.x}deg) rotateZ(${LAYERS_CONFIG.ROTATION_INITIAL.z}deg)`,
              }}
            >
              {/* Stacked Layers */}
              {MATTRESS_LAYERS_DATA.map((layer, idx) => {
                return (
                  <div
                    key={layer.id}
                    ref={(el) => {
                      layerRefs.current[idx] = el;
                    }}
                    className="absolute inset-0 rounded-2xl cursor-pointer will-change-transform"
                    style={{
                      backgroundColor: layer.color,
                      transformStyle: "preserve-3d",
                      // 22px visible realistic thickness extruded via multi-tier border & shadow
                      borderBottom: `6px solid ${layer.edgeColor}`,
                      borderRight: `3px solid ${layer.edgeColor}`,
                      boxShadow: `
                        0 4px 0 ${layer.edgeColor},
                        0 8px 0 ${layer.edgeColor},
                        0 14px 0 ${layer.edgeColor},
                        0 ${LAYERS_CONFIG.THICKNESS}px 0 ${layer.edgeColor},
                        0 30px 45px rgba(35, 25, 20, 0.28)
                      `,
                      // Luxury diamond quilt pattern overlay
                      backgroundImage: `
                        repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.08) 0, rgba(255, 255, 255, 0.08) 2px, transparent 0, transparent 22px),
                        repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.08) 0, rgba(255, 255, 255, 0.08) 2px, transparent 0, transparent 22px)
                      `,
                    }}
                    title={layer.title}
                  >
                    {/* Inner subtle fabric gloss highlight */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-black/10 via-transparent to-white/20 pointer-events-none" />

                    {/* Small layer badge */}
                    <div className="absolute top-3 left-4 text-[10px] font-mono tracking-wider font-semibold text-stone-800/60 uppercase">
                      0{idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── SVG Connector Lines (Desktop Only) ── */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block z-30"
            viewBox="0 0 600 480"
            fill="none"
          >
            {MATTRESS_LAYERS_DATA.map((layer, idx) => {
              // Smooth bezier curve connecting 3D stack edge to right label card
              const yOrigin = 160 + idx * 48;
              const yTarget = 120 + idx * 56;
              const pathD = `M 290,${yOrigin} C 360,${yOrigin} 400,${yTarget} 450,${yTarget}`;
              return (
                <path
                  key={`connector-${layer.id}`}
                  ref={(el) => {
                    connectorRefs.current[idx] = el;
                  }}
                  d={pathD}
                  stroke="#C4561F"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="transition-opacity"
                />
              );
            })}
          </svg>

          {/* ── Desktop Label Cards (Right Side of Stack) ── */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 hidden lg:flex flex-col gap-5 z-40 pointer-events-none">
            {MATTRESS_LAYERS_DATA.map((layer, idx) => (
              <div
                key={`label-${layer.id}`}
                ref={(el) => {
                  labelRefs.current[idx] = el;
                }}
                className="bg-[#FAF8F4] border border-[#2A2421]/10 rounded-xl p-4 shadow-xl backdrop-blur-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-mono font-bold text-[#C4561F]">
                    0{idx + 1}
                  </span>
                  <h2 className="text-sm font-semibold text-[#2A2421] tracking-tight">
                    {layer.title}
                  </h2>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {layer.text}
                </p>
              </div>
            ))}
          </div>

          {/* ── Mobile Spotlight Label Panel (Under Stack) ── */}
          <div className="block lg:hidden w-full max-w-sm mt-8 z-30 px-2">
            <div className="bg-[#FAF8F4] border border-stone-300 rounded-2xl p-5 shadow-lg text-center transition-all">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-[#C4561F] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                  0{activeLayerIndex + 1}
                </span>
                <h2 className="text-base font-semibold text-[#2A2421]">
                  {MATTRESS_LAYERS_DATA[activeLayerIndex]?.title}
                </h2>
              </div>
              <p className="text-xs text-stone-600 leading-normal">
                {MATTRESS_LAYERS_DATA[activeLayerIndex]?.text}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Floating "Shop Mattresses" CTA & Specs ── */}
      <footer className="w-full max-w-7xl mx-auto px-6 sm:px-12 pb-8 sm:pb-12 z-30 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Specs highlights */}
        <div className="flex items-center gap-6 text-xs text-stone-600 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-[#C4561F]" /> 100-Night Trial
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-[#C4561F]" /> 10-Year Warranty
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-[#C4561F]" /> Free White-Glove Delivery
          </span>
        </div>

        {/* CTA Button appearing at final compression (0.85 - 1.00) */}
        <div ref={ctaButtonRef}>
          <Link
            href="/shop/firm-mattresses"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#C4561F] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-lg shadow-[#C4561F]/25 hover:bg-[#A84515] transition-all transform hover:-translate-y-0.5"
          >
            Shop Mattresses <ArrowRight size={16} />
          </Link>
        </div>
      </footer>
    </section>
  );
}
