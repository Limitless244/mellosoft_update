"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─────────────────────────────────────────────────────────────────────
   DATA  (unchanged from original)
───────────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────────
   ALL TUNEABLE CONSTANTS in one object
───────────────────────────────────────────────────────────────────── */
const K = {
  /* Scroll driver */
  PIN_END_DESKTOP: "+=250%",
  PIN_END_MOBILE:  "+=200%",
  SCRUB: 0.7,

  /* Phase boundaries (all in p 0–1). Overlaps are intentional. */
  INTRO_START:         0.00,
  INTRO_END:           0.10,
  SPREAD_OPEN_START:   0.10,
  SPREAD_OPEN_END:     0.28,
  TOUR_START:          0.26,   // starts while spread is still opening → always something moving
  TOUR_END:            0.88,
  SPREAD_CLOSE_START:  0.86,   // overlaps last tour dwell → always something moving
  SPREAD_CLOSE_END:    0.97,
  CTA_START:           0.90,
  CTA_END:             0.98,

  /* 3-D stack geometry */
  LAYER_H: 270,                // wrapper height px
  LAYER_W: 420,
  THICKNESS: 22,               // closed-stack gap per layer
  ROTATION_X: 58,
  ROTATION_Z_INITIAL:          -32,
  ROTATION_Z_EXPLODED:         -40,   // widens slightly when open
  ROTATION_Z_MOBILE_INITIAL:   -25,
  ROTATION_Z_MOBILE_EXPLODED:  -32,
  OPEN_SPACING_DIVISOR: 5.5,   // openZ[i] = spread_height / 5.5 × i

  /* Tour feel */
  LIFT_PX:         14,         // active layer rises this far
  DIM_OPACITY:     0.35,       // non-active layer floor opacity
  ACTIVE_SCALE:    1.03,
  ACTIVE_BRIGHTNESS: 1.08,
  HAND_OFF: [0.35, 0.65] as [number, number],  // smoothstep window for f during hand-off

  /* Always-moving drift applied to the stack container */
  DRIFT_X_PX:    -18,
  DRIFT_SKEW_START: 1,         // deg at p=0
  DRIFT_SKEW_END:   3,         // deg at p=1

  /* Card */
  CARD_MIN_TOP:  36,           // px clamp top
  CARD_HANDOFF_Y: 12,          // px pane slides during hand-off

  /* Click-jump */
  JUMP_DURATION_S: 0.8,

  /* Failsafe */
  FAILSAFE_MS: 4000,
};

/* ─────────────────────────────────────────────────────────────────────
   PURE MATH HELPERS
───────────────────────────────────────────────────────────────────── */
function clamp(v: number, lo = 0, hi = 1) {
  return v < lo ? lo : v > hi ? hi : v;
}
function smoothstep(a: number, b: number, v: number) {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Derive all continuous render values from one scalar p ∈ [0,1]. */
function derive(p: number, N: number) {
  const spreadOpen  = smoothstep(K.SPREAD_OPEN_START,  K.SPREAD_OPEN_END,  p);
  const spreadClose = 1 - smoothstep(K.SPREAD_CLOSE_START, K.SPREAD_CLOSE_END, p);
  const spread = Math.min(spreadOpen, spreadClose);

  const tourOn = smoothstep(K.TOUR_START, K.TOUR_START + 0.06, p)
               * (1 - smoothstep(K.TOUR_END - 0.06, K.TOUR_END, p));

  // Continuous layer focus 0..N-1
  const rawFocus = ((p - K.TOUR_START) / (K.TOUR_END - K.TOUR_START)) * N;
  const rawC = clamp(rawFocus, 0, N - 0.001);
  const fi   = Math.floor(rawC);
  const ff   = rawC - fi;
  const [a, b] = K.HAND_OFF;
  const eased  = smoothstep(a, b, ff);
  const focus  = fi + eased;

  const intro = smoothstep(K.INTRO_START, K.INTRO_END, p);
  const cta   = smoothstep(K.CTA_START,   K.CTA_END,   p);

  return { spread, tourOn, focus, intro, cta };
}

/* Geometry — these are pure functions of index / container height */
function closedZ(i: number, N: number) {
  return (N - 1 - i) * K.THICKNESS;
}
function openZ(i: number, N: number, containerH: number) {
  const spacing   = containerH / K.OPEN_SPACING_DIVISOR;
  const totalSpan = spacing * (N - 1);
  return -(totalSpan / 2) + i * spacing;
}

/* ─────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────── */
export default function MattressLayers() {
  /* DOM refs */
  const sectionRef        = useRef<HTMLElement>(null);
  const stackContainerRef = useRef<HTMLDivElement>(null);
  const stackWrapperRef   = useRef<HTMLDivElement>(null);
  const progressBarRef    = useRef<HTMLDivElement>(null);
  const ctaButtonRef      = useRef<HTMLDivElement>(null);
  const cardRef           = useRef<HTMLDivElement>(null);
  const cardCurRef        = useRef<HTMLDivElement>(null);
  const cardNxtRef        = useRef<HTMLDivElement>(null);
  const connectorLineRef  = useRef<SVGLineElement>(null);
  const connectorSvgRef   = useRef<SVGSVGElement>(null);

  const layerRefs        = useRef<(HTMLDivElement | null)[]>([]);
  const shadowRefs       = useRef<(HTMLDivElement | null)[]>([]);
  const listRowRefs      = useRef<(HTMLButtonElement | null)[]>([]);
  const progressFillRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Animation state refs (not React state — no re-render on scroll) */
  const masterP    = useRef(0);                       // single master value
  const renderFn   = useRef<((p: number) => void) | null>(null); // for dev scrubber
  const stRef      = useRef<ScrollTrigger | null>(null);
  const jumpTween  = useRef<gsap.core.Tween | null>(null);
  const ctxRef     = useRef<gsap.Context | null>(null);
  const failsafe   = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* React state — only for things that need React to re-render */
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [isReducedMotion,  setIsReducedMotion]  = useState(false);
  const [cardCur, setCardCur] = useState(0);   // which layer pane is "current"
  const [cardNxt, setCardNxt] = useState(1);   // which layer pane is "next"

  // Mirror of card/active state as refs — avoids stale closure in render()
  const cardCurRef2    = useRef(0);
  const cardNxtRef2    = useRef(1);
  const activeIdxRef2  = useRef(0);

  /* ── Reduced-motion preference ───────────────────────────────────── */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  /* ── Main animation effect ───────────────────────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;

    const N     = MATTRESS_LAYERS_DATA.length;
    const isMob = window.innerWidth < 768;

    /* ── Reduced-motion: static exploded state, simple tab swap ───── */
    if (isReducedMotion) {
      const h = stackContainerRef.current?.clientHeight || 540;
      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, {
          z:       openZ(i, N, h),
          opacity: i === 0 ? 1 : K.DIM_OPACITY,
          filter:  "none",
          scale:   1,
        });
      });
      if (stackContainerRef.current) gsap.set(stackContainerRef.current, { opacity: 1, y: 0, x: 0, skewY: 0 });
      if (ctaButtonRef.current)      gsap.set(ctaButtonRef.current,      { opacity: 1 });
      if (cardRef.current)           gsap.set(cardRef.current,           { opacity: 1, top: "50%" });
      listRowRefs.current.forEach((btn, i) => {
        if (!btn) return;
        gsap.set(btn, { opacity: 1 });
        btn.onclick = () => {
          setActiveLayerIndex(i);
          setCardCur(i);
          setCardNxt(Math.min(i + 1, N - 1));
          layerRefs.current.forEach((el2, j) => {
            if (!el2) return;
            gsap.to(el2, { opacity: j === i ? 1 : K.DIM_OPACITY, duration: 0.2 });
          });
        };
      });
      return;
    }

    /* ═══════════════════════════════════════════════════════════════
       FULL ANIMATION
       We defer creating the ScrollTrigger until layout is stable:
         1. document.fonts.ready   – text metrics settled
         2. container has non-zero height (rAF loop, max 20 frames)
         3. window "load"          – all sub-resources done
       Only then do we call ScrollTrigger.refresh() once and wire up.
    ═══════════════════════════════════════════════════════════════ */

    // Turn off GSAP's lag-smoothing so render() is called on every frame
    gsap.ticker.lagSmoothing(0);

    let cancelled = false;

    async function init() {
      /* Step A — wait for fonts */
      await document.fonts.ready;
      if (cancelled) return;

      /* Step B — wait for container to have a measured height (up to 20 rAFs) */
      await new Promise<void>((resolve) => {
        let attempts = 0;
        function check() {
          const h = stackContainerRef.current?.clientHeight ?? 0;
          if (h > 0 || attempts++ > 20) { resolve(); return; }
          requestAnimationFrame(check);
        }
        requestAnimationFrame(check);
      });
      if (cancelled) return;

      /* Step C — build everything inside gsap.context */
      const ctx = gsap.context(() => {
        const section   = sectionRef.current!;
        const wrapper   = stackWrapperRef.current;
        const container = stackContainerRef.current!;

        /* ── Dev logging (Step 1) ─────────────────────────────────── */
        const IS_DEV = process.env.NODE_ENV !== "production";
        const logGeometry = (label: string) => {
          if (!IS_DEV) return;
          const h = container.clientHeight;
          const w = container.clientWidth;
          console.group(`[MattressLayers] ${label}`);
          console.log("container h×w:", h, "×", w);
          MATTRESS_LAYERS_DATA.forEach((_, i) => {
            console.log(
              `  layer ${i}: closedZ=${closedZ(i, N).toFixed(1)}  openZ=${openZ(i, N, h).toFixed(1)}`,
            );
          });
          console.groupEnd();
        };
        logGeometry("first computation");

        /* ── Safe initial CSS — readable before animation ─────────── */
        gsap.set(container,              { opacity: 1, y: 0, x: 0, skewY: 0 });
        gsap.set(ctaButtonRef.current!,  { opacity: 0.15 });
        gsap.set(cardRef.current!,       { opacity: 0, willChange: "transform, opacity" });
        if (connectorSvgRef.current) gsap.set(connectorSvgRef.current, { opacity: 0 });
        layerRefs.current.forEach((el, i) => {
          if (!el) return;
          // will-change applied up front so the browser rasterizes before first scroll
          el.style.willChange = "transform, opacity";
          el.style.backfaceVisibility = "hidden";
          gsap.set(el, { z: closedZ(i, N), opacity: 1, filter: "brightness(1)", scale: 1 });
        });
        shadowRefs.current.forEach((el) => { if (el) gsap.set(el, { opacity: 0, scaleX: 0.6 }); });

        /* ── THE RENDER FUNCTION — single source of truth ─────────────
           Idempotent: render(p) always gives the same picture for the
           same p. All positions written as transform + opacity only.
        ────────────────────────────────────────────────────────────── */
        function render(p: number) {
          const { spread, tourOn, focus, intro, cta } = derive(p, N);
          // Always read layout live — invalidateOnRefresh ensures ST
          // has correct start/end, and we always read fresh h/w here.
          const h = container.clientHeight || 540;
          const w = container.clientWidth  || 700;
          const isMobNow = window.innerWidth < 768;

          /* 1. Stack container — intro fade-in & persistent drift */
          gsap.set(container, {
            opacity: lerp(0, 1, intro),
            y:       lerp(40, 0, intro),
            x:       lerp(0, K.DRIFT_X_PX, p),
            skewY:   lerp(K.DRIFT_SKEW_START, K.DRIFT_SKEW_END, p),
          });

          /* 2. 3-D wrapper rotation */
          if (wrapper) {
            const rZ0 = isMobNow ? K.ROTATION_Z_MOBILE_INITIAL  : K.ROTATION_Z_INITIAL;
            const rZ1 = isMobNow ? K.ROTATION_Z_MOBILE_EXPLODED : K.ROTATION_Z_EXPLODED;
            gsap.set(wrapper, {
              rotateX: K.ROTATION_X,
              rotateZ: lerp(rZ0, rZ1, spread),
            });
          }

          /* 3. Each layer */
          layerRefs.current.forEach((el, i) => {
            if (!el) return;
            const cz   = closedZ(i, N);
            const oz   = openZ(i, N, h);
            const dist = Math.abs(focus - i);
            const emph = clamp(1 - dist, 0, 1) * tourOn;

            gsap.set(el, {
              z:       lerp(cz, oz, spread) + emph * K.LIFT_PX,
              opacity: 1 - (1 - K.DIM_OPACITY) * spread * tourOn * clamp(dist, 0, 1),
              scale:   1 + (K.ACTIVE_SCALE - 1) * emph,
              filter:  `brightness(${(1 + (K.ACTIVE_BRIGHTNESS - 1) * emph).toFixed(3)})`,
            });

            const sh = shadowRefs.current[i];
            if (sh) {
              gsap.set(sh, {
                opacity: spread * (0.1 + 0.3 * emph),
                scaleX:  lerp(0.5, 1 + 0.08 * emph, spread),
              });
            }
          });

          /* 4. Progress bar */
          if (progressBarRef.current) {
            gsap.set(progressBarRef.current, { scaleY: p, transformOrigin: "top" });
          }

          /* 5. List rows */
          listRowRefs.current.forEach((btn, i) => {
            if (!btn) return;
            const rowEmph = clamp(1 - Math.abs(focus - i), 0, 1) * tourOn;
            gsap.set(btn, { opacity: lerp(0.4, 1, spread) });

            const chip = btn.querySelector<HTMLElement>("[data-num]");
            if (chip) {
              chip.style.color = `rgb(${Math.round(lerp(120, 196, rowEmph))},${Math.round(lerp(113, 86, rowEmph))},${Math.round(lerp(108, 31, rowEmph))})`;
            }

            const fill = progressFillRefs.current[i];
            if (fill) {
              const rawFocus = ((p - K.TOUR_START) / (K.TOUR_END - K.TOUR_START)) * N;
              const isCurrent = i === Math.floor(clamp(focus, 0, N - 1));
              const frac = isCurrent
                ? clamp(rawFocus - i, 0, 1)
                : rawFocus > i + 1 ? 1 : 0;
              gsap.set(fill, { scaleX: frac * tourOn, transformOrigin: "left center" });
            }
          });

          /* 6. Detail card */
          if (cardRef.current) {
            gsap.set(cardRef.current, { opacity: tourOn });

            const fi     = Math.floor(clamp(focus, 0, N - 1));
            const ff_raw = focus - fi;
            const [ha, hb] = K.HAND_OFF;
            const ff     = smoothstep(ha, hb, ff_raw);

            const y0 = openZ(fi, N, h) + K.LIFT_PX * tourOn;
            const y1 = openZ(Math.min(fi + 1, N - 1), N, h);
            const projFactor = 0.42;
            const cardYpx = clamp(
              h * 0.5 + lerp(y0, y1, ff) * projFactor,
              K.CARD_MIN_TOP,
              h - K.CARD_MIN_TOP,
            );
            // Write as top + translateY(-50%) so card stays centered on target Y
            cardRef.current.style.top = `${cardYpx}px`;

            const curIdx = fi;
            const nxtIdx = Math.min(fi + 1, N - 1);
            if (curIdx !== cardCurRef2.current) { cardCurRef2.current = curIdx; setCardCur(curIdx); }
            if (nxtIdx !== cardNxtRef2.current) { cardNxtRef2.current = nxtIdx; setCardNxt(nxtIdx); }

            if (cardCurRef.current) {
              gsap.set(cardCurRef.current, { opacity: 1 - ff, y: -ff * K.CARD_HANDOFF_Y });
            }
            if (cardNxtRef.current) {
              gsap.set(cardNxtRef.current, { opacity: ff, y: (1 - ff) * K.CARD_HANDOFF_Y });
            }

            const roundedIdx = Math.round(clamp(focus, 0, N - 1));
            if (roundedIdx !== activeIdxRef2.current) {
              activeIdxRef2.current = roundedIdx;
              setActiveLayerIndex(roundedIdx);
            }
          }

          /* 7. Connector line */
          if (connectorLineRef.current && connectorSvgRef.current) {
            gsap.set(connectorSvgRef.current, { opacity: tourOn });
            const fi     = Math.floor(clamp(focus, 0, N - 1));
            const ff_raw = focus - fi;
            const [ha, hb] = K.HAND_OFF;
            const ff     = smoothstep(ha, hb, ff_raw);
            const y0  = h * 0.5 + (openZ(fi, N, h) + K.LIFT_PX * tourOn) * 0.42;
            const y1  = h * 0.5 + openZ(Math.min(fi + 1, N - 1), N, h) * 0.42;
            const lineY = clamp(lerp(y0, y1, ff), K.CARD_MIN_TOP, h - K.CARD_MIN_TOP);
            const x1 = w * 0.58;
            const x2 = w * 0.635;
            connectorLineRef.current.setAttribute("x1", x1.toFixed(1));
            connectorLineRef.current.setAttribute("y1", lineY.toFixed(1));
            connectorLineRef.current.setAttribute("x2", x2.toFixed(1));
            connectorLineRef.current.setAttribute("y2", lineY.toFixed(1));
          }

          /* 8. CTA */
          if (ctaButtonRef.current) {
            gsap.set(ctaButtonRef.current, { opacity: lerp(0.15, 1, cta) });
          }
        } // ─── end render() ───

        /* Expose to dev scrubber */
        renderFn.current = render;

        /* ── refreshInit: recompute geometry before ST recalculates ── */
        ScrollTrigger.addEventListener("refreshInit", () => {
          if (IS_DEV) logGeometry("after refreshInit");
        });

        /* ── Create ScrollTrigger ──────────────────────────────────── */
        // scrub: true (no extra lag cushion) so positions track exactly
        const st = ScrollTrigger.create({
          trigger:             section,
          pin:                 true,
          pinSpacing:          true,
          start:               "top top",
          end:                 isMob ? K.PIN_END_MOBILE : K.PIN_END_DESKTOP,
          scrub:               true,          // ← exact tracking, no extra lag
          anticipatePin:       1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (IS_DEV) {
              console.log(
                `[ST] scrollY=${Math.round(window.scrollY)}  dir=${self.direction}  p=${self.progress.toFixed(4)}` +
                `  start=${Math.round(self.start)}  end=${Math.round(self.end)}  h=${container.clientHeight}`,
              );
            }
            masterP.current = self.progress;
            render(self.progress);
          },
          onRefresh: (self) => {
            if (IS_DEV) {
              logGeometry("after ST refresh");
              console.log(`[ST refresh] start=${Math.round(self.start)} end=${Math.round(self.end)}`);
            }
            render(masterP.current);
          },
        });
        stRef.current = st;

        /* Initial render at p=0 (container height is now valid) */
        render(0);

        /* Refresh once more after window "load" (images etc. fully painted) */
        const onLoad = () => {
          if (IS_DEV) logGeometry("after window load");
          ScrollTrigger.refresh();
          render(masterP.current);
        };
        if (document.readyState === "complete") {
          onLoad();
        } else {
          window.addEventListener("load", onLoad, { once: true });
        }

        /* Debounced resize */
        let resizeTimer: ReturnType<typeof setTimeout>;
        const onResize = () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            ScrollTrigger.refresh();
            render(masterP.current);
          }, 150);
        };
        window.addEventListener("resize", onResize);

        /* ── Jump to layer ──────────────────────────────────────────── */
        function jumpToLayer(index: number) {
          const dwell = K.TOUR_START + (K.TOUR_END - K.TOUR_START) * ((index + 0.5) / N);
          if (jumpTween.current) jumpTween.current.kill();
          jumpTween.current = gsap.to(masterP, {
            current:  dwell,
            duration: K.JUMP_DURATION_S,
            ease:     "power2.inOut",
            onUpdate: () => render(masterP.current),
            onComplete: () => {
              if (stRef.current) {
                const targetScroll = lerp(stRef.current.start, stRef.current.end, dwell);
                window.scrollTo({ top: targetScroll, behavior: "auto" });
              }
            },
          });
        }

        listRowRefs.current.forEach((btn, i) => { if (btn) btn.onclick = () => jumpToLayer(i); });
        layerRefs.current.forEach((el, i)   => { if (el)  el.onclick  = () => jumpToLayer(i); });

        function onKey(e: KeyboardEvent) {
          const rect = sectionRef.current?.getBoundingClientRect();
          if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) return;
          const cur = Math.round(clamp(derive(masterP.current, N).focus, 0, N - 1));
          if (e.key === "ArrowDown") { e.preventDefault(); jumpToLayer(Math.min(N - 1, cur + 1)); }
          if (e.key === "ArrowUp")   { e.preventDefault(); jumpToLayer(Math.max(0, cur - 1)); }
        }
        window.addEventListener("keydown", onKey);

        /* ── Failsafe ───────────────────────────────────────────────── */
        failsafe.current = setTimeout(() => {
          if (masterP.current < 0.01) render(K.SPREAD_OPEN_END + 0.01);
        }, K.FAILSAFE_MS);

        return () => {
          window.removeEventListener("resize", onResize);
          window.removeEventListener("keydown", onKey);
          clearTimeout(resizeTimer);
          if (failsafe.current) clearTimeout(failsafe.current);
        };
      }, sectionRef);

      if (!cancelled) ctxRef.current = ctx;
      else ctx.revert();
    } // end init()

    init();

    return () => {
      cancelled = true;
      ctxRef.current?.revert();
    };
  }, [isReducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── RENDER ──────────────────────────────────────────────────────── */
  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen text-[#2A2421] overflow-hidden flex flex-col justify-between select-none"
      style={{ backgroundColor: "var(--cream, #FAF8F4)" }}
      aria-label="Mattress construction and layer breakdown"
    >
      {/* ── DEV SCRUBBER (removed in production) ── */}
      {process.env.NODE_ENV !== "production" && (
        <DevScrubber masterP={masterP} renderFn={renderFn} />
      )}

      {/* ── Left Edge Scroll Progress Indicator ── */}
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

      {/* ── Main Stage ── */}
      <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-12 flex-1 flex flex-col lg:flex-row items-center justify-between py-6 z-20">

        {/* ── Left column ── */}
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

          {/* Reduced-motion static list */}
          {isReducedMotion && (
            <div className="mt-8 space-y-4 border-l-2 border-[#C4561F] pl-4">
              {MATTRESS_LAYERS_DATA.map((layer, idx) => (
                <div key={layer.id} className="text-left">
                  <span className="text-xs font-mono text-[#C4561F] font-bold">
                    0{idx + 1}
                  </span>
                  <h3 className="text-base font-semibold text-[#2A2421]">{layer.title}</h3>
                  <p className="text-xs text-stone-600">{layer.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Layer list — tablist */}
          {!isReducedMotion && (
            <div
              role="tablist"
              aria-label="Mattress layers"
              className="mt-6 flex flex-col gap-0"
            >
              {MATTRESS_LAYERS_DATA.map((layer, idx) => (
                <button
                  key={layer.id}
                  ref={(el) => { listRowRefs.current[idx] = el; }}
                  role="tab"
                  aria-selected={idx === activeLayerIndex}
                  aria-controls="layer-panel"
                  id={`layer-tab-${idx}`}
                  tabIndex={idx === activeLayerIndex ? 0 : -1}
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 0",
                    borderBottom: "1px solid rgba(42,36,33,0.07)",
                    opacity: 0.4,     // render() will animate this
                  }}
                >
                  <span
                    data-num
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: "#78716C",
                      minWidth: 22,
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1, color: "#2A2421" }}>
                    {layer.title}
                  </span>
                  {/* Thin progress bar fill */}
                  <div
                    style={{
                      width: 56,
                      height: 2,
                      background: "rgba(42,36,33,0.1)",
                      borderRadius: 99,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      ref={(el) => { progressFillRefs.current[idx] = el; }}
                      style={{
                        height: "100%",
                        background: "#C4561F",
                        borderRadius: 99,
                        transformOrigin: "left center",
                        transform: "scaleX(0)",
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: 3-D Stack + Card ── */}
        <div
          ref={stackContainerRef}
          className="w-full lg:w-7/12 relative flex items-center justify-center min-h-[460px] sm:min-h-[540px]"
          style={{ opacity: 0 }}
        >
          {/* 3-D Perspective wrapper */}
          <div
            className="relative flex items-center justify-center"
            style={{ perspective: "1400px", perspectiveOrigin: "50% 50%" }}
          >
            <div
              ref={stackWrapperRef}
              className="relative"
              style={{
                width: K.LAYER_W,
                height: K.LAYER_H,
                transformStyle: "preserve-3d",
                transform: `rotateX(${K.ROTATION_X}deg) rotateZ(${K.ROTATION_Z_INITIAL}deg)`,
              }}
            >
              {MATTRESS_LAYERS_DATA.map((layer, idx) => (
                <div
                  key={layer.id}
                  ref={(el) => { layerRefs.current[idx] = el; }}
                  className="absolute inset-0 rounded-2xl cursor-pointer will-change-transform"
                  style={{
                    backgroundColor: layer.color,
                    transformStyle: "preserve-3d",
                    borderBottom: `6px solid ${layer.edgeColor}`,
                    borderRight:  `3px solid ${layer.edgeColor}`,
                    boxShadow: `
                      0 4px 0 ${layer.edgeColor},
                      0 8px 0 ${layer.edgeColor},
                      0 14px 0 ${layer.edgeColor},
                      0 ${K.THICKNESS}px 0 ${layer.edgeColor},
                      0 30px 45px rgba(35,25,20,0.28)
                    `,
                    backgroundImage: `
                      repeating-linear-gradient(45deg,rgba(255,255,255,0.08) 0,rgba(255,255,255,0.08) 2px,transparent 0,transparent 22px),
                      repeating-linear-gradient(-45deg,rgba(255,255,255,0.08) 0,rgba(255,255,255,0.08) 2px,transparent 0,transparent 22px)
                    `,
                  }}
                  title={layer.title}
                  aria-label={`Layer ${idx + 1}: ${layer.title}`}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-black/10 via-transparent to-white/20 pointer-events-none" />
                  <div className="absolute top-3 left-4 text-[10px] font-mono tracking-wider font-semibold text-stone-800/60 uppercase">
                    0{idx + 1}
                  </div>
                  {/* Per-layer drop shadow — lives in the layer div but rendered below via z  */}
                  <div
                    ref={(el) => { shadowRefs.current[idx] = el; }}
                    style={{
                      position: "absolute",
                      bottom: -20,
                      left: "10%",
                      width: "80%",
                      height: 14,
                      borderRadius: "50%",
                      background: "rgba(35,25,20,0.35)",
                      filter: "blur(8px)",
                      opacity: 0,
                      willChange: "transform,opacity",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Single SVG connector line (desktop only) ── */}
          <svg
            ref={connectorSvgRef}
            className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block z-30"
            style={{ opacity: 0, overflow: "visible" }}
            aria-hidden="true"
          >
            <line
              ref={connectorLineRef}
              x1="0" y1="0" x2="0" y2="0"
              stroke="#C4561F"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="4 3"
            />
          </svg>

          {/* ── Single persistent detail card (desktop only) ── */}
          <div
            ref={cardRef}
            id="layer-panel"
            role="tabpanel"
            aria-live="polite"
            aria-labelledby={`layer-tab-${activeLayerIndex}`}
            className="absolute right-0 w-64 hidden lg:block z-40"
            style={{
              top: 0,
              opacity: 0,
              transform: "translateY(-50%)",
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(42,36,33,0.14)",
              /* min-height ensures the card has stable height during hand-off */
              minHeight: 90,
              overflow: "hidden",
            }}
          >
            {/* ── Current pane ── */}
            <div
              ref={cardCurRef}
              style={{
                position: "absolute",
                inset: 0,
                padding: "14px 16px",
                pointerEvents: "none",
                willChange: "opacity,transform",
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-mono font-bold text-[#C4561F]">
                  {String(cardCur + 1).padStart(2, "0")}
                </span>
                <h2 className="text-sm font-semibold text-[#2A2421] tracking-tight">
                  {MATTRESS_LAYERS_DATA[cardCur]?.title}
                </h2>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {MATTRESS_LAYERS_DATA[cardCur]?.text}
              </p>
            </div>

            {/* ── Next pane (cross-fades in during hand-off) ── */}
            <div
              ref={cardNxtRef}
              style={{
                position: "relative",
                padding: "14px 16px",
                opacity: 0,
                willChange: "opacity,transform",
                /* Keeps card height stable; next pane content fills it */
                minHeight: "inherit",
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-mono font-bold text-[#C4561F]">
                  {String(cardNxt + 1).padStart(2, "0")}
                </span>
                <h2 className="text-sm font-semibold text-[#2A2421] tracking-tight">
                  {MATTRESS_LAYERS_DATA[cardNxt]?.title}
                </h2>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {MATTRESS_LAYERS_DATA[cardNxt]?.text}
              </p>
            </div>
          </div>

          {/* ── Mobile label panel (React-driven) ── */}
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

      {/* ── Bottom: Trust Strip + CTA — always in flow, never overlapping stack ── */}
      <footer className="w-full max-w-7xl mx-auto px-6 sm:px-12 pb-8 sm:pb-12 z-30 flex flex-col sm:flex-row items-center justify-between gap-4">
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
        {/* CTA always visible (opacity driven by render, never unmounted) */}
        <div ref={ctaButtonRef} style={{ opacity: 0.15 }}>
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

/* ─────────────────────────────────────────────────────────────────────
   DEV SCRUBBER  (process.env.NODE_ENV !== "production" only)
   Drag the slider to any p value and render() is called directly.
   Nothing jumps — this verifies continuity.
   Remove this component (and the JSX call above) after sign-off.
───────────────────────────────────────────────────────────────────── */
function DevScrubber({
  masterP,
  renderFn,
}: {
  masterP: MutableRefObject<number>;
  renderFn: MutableRefObject<((p: number) => void) | null>;
}) {
  const [display, setDisplay] = useState("0.000");
  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "rgba(0,0,0,0.78)",
        padding: "5px 12px",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 11,
        color: "#fff",
        fontFamily: "monospace",
        userSelect: "none",
      }}
    >
      <span>DEV p=</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        defaultValue={0}
        style={{ width: 200 }}
        onChange={(e) => {
          const p = parseFloat(e.target.value);
          masterP.current = p;
          renderFn.current?.(p);
          setDisplay(p.toFixed(3));
        }}
      />
      <span style={{ minWidth: 38 }}>{display}</span>
    </div>
  );
}
