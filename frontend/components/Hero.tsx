"use client";
import Image from "next/image";
import BedPreview from "./BedPreview";
import { useState } from "react";
import { useLayoutEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { gsap } from "@/lib/gsap";
export default function Hero() {
  const [preview, setPreview] = useState(false);
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(".hero-word", {
        y: 35,
        opacity: 0,
        duration: 1,
        stagger: 0.085,
        ease: "power3.out",
      });
      gsap.from(document.querySelector(".navbar"), { opacity: 0, y: -12, delay: 0.35, duration: 1 });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=85%",
          scrub: 1,
          pin: true,
        },
      });
      tl.to(
        ".hero-photo",
        {
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          borderRadius: 0,
          ease: "none",
        },
        0,
      )
        .to(".hero-crossfade", { opacity: 1 }, 0)
        .to(".hero-shade", { opacity: 0.45 }, 0)
        .to(".hero-copy", { y: -35 }, 0)
        .to(".hero-inset", { opacity: 0 }, 0);
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section id="home" className="hero" ref={root}>
      <div className="hero-photo">
        <Image
          src="/images/hero.jpg"
          alt="Warm sunlit bedroom with a linen bed, oak furniture and sculptural lighting"
          fill
          priority
          sizes="100vw"
        />
        <Image
          className="hero-crossfade"
          src="/images/bed-1.jpg"
          alt="A tranquil linen bedroom with soft natural light"
          fill
          sizes="100vw"
        />
        <div className="hero-shade" />
      </div>
      <div className="hero-copy">
        <p className="eyebrow hero-word">
          CRAFTED FOR REST. DESIGNED FOR LIFE.
        </p>
        <h1>
          {["Turn Your Bedroom", "Into a Place Worth", "Waking Up In"].map(
            (t) => (
              <span className="hero-word" key={t}>
                {t}
              </span>
            ),
          )}
        </h1>
        <p className="hero-sub hero-word">
          Beautiful beds. Thoughtful details. A little more comfort, every day.
        </p>
        <a className="pill hero-word" href="#products">
          Shop Now{" "}
          <span>
            <ArrowUpRight size={19} />
          </span>
        </a>
      </div>
      <div className="hero-inset">
        <span className="tiny-stars">&#10022;</span>
        <p>
          A softer place.
          <br />A better everyday.
        </p>
      </div>
      <button
        className="hero-preview-button"
        onClick={() => setPreview(!preview)}
        aria-expanded={preview}
      >
        {preview ? "Close 3D preview" : "Explore in 3D"}
      </button>
      {preview && (
        <div className="hero-3d">
          <BedPreview />
        </div>
      )}
      <div className="hero-bottom">
        <span>SCROLL TO GET COMFORTABLE</span>
        <ArrowDown size={16} />
        <span>01 / THE ART OF REST</span>
      </div>
    </section>
  );
}
