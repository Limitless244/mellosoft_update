"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/* ─── card definitions ─────────────────────────────────────────── */
const CARDS = [
  { key: "pillows",  src: "/images/categoryimg/pillow.png",  alt: "Pillows",         rotate: -9, tx: -70, ty: 18, z: 10 },
  { key: "firm",     src: "/images/categoryimg/firm.png",    alt: "Firm Mattresses", rotate: -4, tx: -32, ty:  8, z: 20 },
  { key: "beds",     src: "/images/categoryimg/bed.png",     alt: "Beds",            rotate:  0, tx:   0, ty:  0, z: 30 },
];

/* ─── single card shell ─────────────────────────────────────────── */
function PhotoCard({
  src, alt, style, cardRef, showBadge,
}: {
  src: string;
  alt: string;
  style: React.CSSProperties;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  showBadge?: boolean;
}) {
  return (
    <div
      ref={cardRef}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: "18px",
        overflow: "hidden",
        border: "6px solid #fff",
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {/* plain img avoids next/image fill complexities inside a stack */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        draggable={false}
      />
      {showBadge && (
        <>
          <span className="badge">BESTSELLER</span>
          <span className="circle dark add" aria-label="Explore Beds">
            <Plus size={19} />
          </span>
        </>
      )}
    </div>
  );
}

/* ─── main component ────────────────────────────────────────────── */
export default function FloatingBedsCard() {
  const stackRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const midRef   = useRef<HTMLDivElement>(null);
  const backRef  = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile      = window.matchMedia("(max-width: 767px)").matches;

    if (isMobile) return;

    const front  = frontRef.current;
    const mid    = midRef.current;
    const back   = backRef.current;
    const stack  = stackRef.current;
    const hero   = document.querySelector<HTMLElement>(".hero");
    const target = document.querySelector<HTMLElement>('[data-target="beds"]');
    const categoryRail = document.querySelector<HTMLElement>(".category-rail");

    if (!front || !mid || !back || !stack || !hero || !target) return;

    let idleTween: gsap.core.Tween | null = null;

    const ctx = gsap.context(() => {
      /* idle float on front card */
      if (!reducedMotion) {
        idleTween = gsap.to(front, {
          y: "+=7",
          duration: 2.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      /* ── measurements ── */
      const getMeasurements = () => {
        if (categoryRail) categoryRail.scrollLeft = 0;

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        const curX = (gsap.getProperty(front, "x") as number) || 0;
        const curY = (gsap.getProperty(front, "y") as number) || 0;

        const frontRect  = front.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        const frontDocX  = frontRect.left  + scrollX - curX;
        const frontDocY  = frontRect.top   + scrollY - curY;
        const targetDocX = targetRect.left + scrollX;
        const targetDocY = targetRect.top  + scrollY;

        const computed = window.getComputedStyle(target);

        return {
          deltaX:       targetDocX - frontDocX,
          deltaY:       targetDocY - frontDocY,
          targetWidth:  targetRect.width,
          targetHeight: targetRect.height,
          targetRadius: computed.borderRadius || "22px",
        };
      };

      let m = getMeasurements();

      if (reducedMotion) return; /* static stack, no animation */

      /* ── flight timeline ── */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          endTrigger: target,
          end: "top 60%",
          scrub: 0.5,
          invalidateOnRefresh: true,
          onRefresh: () => { m = getMeasurements(); },
          onToggle: ({ isActive }) => {
            stack.style.pointerEvents = isActive ? "none" : "auto";
            if (idleTween) { isActive ? idleTween.pause() : idleTween.resume(); }
          },
          onUpdate: (self) => {
            /* hide floating front card when it has landed; target stays always visible */
            front.style.visibility = self.progress >= 0.995 ? "hidden" : "visible";
          },
        },
      });

      /* front card flies to the beds target */
      tl.to(
        front,
        {
          x:            () => { m = getMeasurements(); return m.deltaX; },
          y:            () => m.deltaY,
          width:        () => m.targetWidth,
          height:       () => m.targetHeight,
          borderRadius: () => m.targetRadius,
          border:       "0px solid transparent",
          rotation:     0,
          ease:         "none",
          force3D:      true,
        },
        0
      );

      /* back + mid fan out and fade */
      tl.to(
        [back, mid],
        { opacity: 0, scale: 0.88, ease: "none", force3D: true },
        0
      );

      const handleResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      className="floating-beds-layer hidden md:block"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 35 }}
    >
      {/* stack container */}
      <div
        ref={stackRef}
        style={{
          position: "absolute",
          right: "6%",
          top: "clamp(60px, 10vh, 95px)",
          width: "300px",
          height: "340px",
          pointerEvents: "auto",
        }}
      >
        {/* back — pillows */}
        <PhotoCard
          src={CARDS[0].src}
          alt={CARDS[0].alt}
          cardRef={backRef}
          style={{
            transform: `rotate(${CARDS[0].rotate}deg) translate(${CARDS[0].tx}px, ${CARDS[0].ty}px)`,
            zIndex: CARDS[0].z,
          }}
        />

        {/* middle — firm mattresses */}
        <PhotoCard
          src={CARDS[1].src}
          alt={CARDS[1].alt}
          cardRef={midRef}
          style={{
            transform: `rotate(${CARDS[1].rotate}deg) translate(${CARDS[1].tx}px, ${CARDS[1].ty}px)`,
            zIndex: CARDS[1].z,
          }}
        />

        {/* front — beds (flies to target) */}
        <PhotoCard
          src={CARDS[2].src}
          alt={CARDS[2].alt}
          cardRef={frontRef}
          showBadge
          style={{ zIndex: CARDS[2].z }}
        />
      </div>
    </div>
  );
}
