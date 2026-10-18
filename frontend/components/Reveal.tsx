"use client";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
export default function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-reveal]", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 88%" },
      });
      root.current
        ?.querySelectorAll<HTMLElement>("[data-count]")
        .forEach((el) => {
          const state = { value: 0 };
          gsap.to(state, {
            value: Number(el.dataset.count),
            duration: 1.5,
            scrollTrigger: { trigger: el, start: "top 95%" },
            onUpdate: () => {
              el.textContent =
                Math.round(state.value) + (el.dataset.suffix ?? "+");
            },
          });
        });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
