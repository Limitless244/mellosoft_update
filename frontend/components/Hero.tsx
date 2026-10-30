"use client";
import Image from "next/image";
import BedPreview from "./BedPreview";
import { useState, useLayoutEffect, useEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { gsap } from "@/lib/gsap";

const heroSlides = [
  {
    eyebrow: "CRAFTED FOR REST. DESIGNED FOR LIFE.",
    lines: [
      [{ text: "Turn Your Bedroom" }],
      [{ text: "Into a " }, { text: "Place Worth", highlight: "hero-highlight-sand" }],
      [{ text: "Waking Up In", highlight: "hero-highlight-clay" }],
    ],
    paragraph: "Beautiful beds. Thoughtful details. A little more comfort, every day.",
    button: "Shop Now",
    counter: "01 / THE ART OF REST",
    theme: "hero-slide-one",
  },
  {
    eyebrow: "SLEEP SOFTER. LIVE BETTER.",
    lines: [
      [{ text: "Sleep Softer," }],
      [{ text: "Wake Up", highlight: "hero-highlight-sand" }],
      [{ text: "Ready for More", highlight: "hero-highlight-clay" }],
    ],
    paragraph: "Layered comfort, premium mattresses and pillows made for deeper sleep.",
    button: "Explore Collection",
    counter: "02 / THE ART OF REST",
    theme: "hero-slide-two",
  },
];

export default function Hero() {
  const [preview, setPreview] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".hero-slide-one .hero-word", {
        y: 35,
        opacity: 0,
        duration: 1,
        stagger: 0.085,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });

      gsap.from(document.querySelector(".navbar"), {
        opacity: 0,
        y: -12,
        delay: 0.35,
        duration: 1,
        clearProps: "opacity,transform",
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="home" className="hero" ref={root}>
      <div className="hero-photo">
        <Image
          className="hero-bg-image hero-slide-1-img"
          src="/images/hero.jpg"
          alt="Warm sunlit bedroom with a linen bed, oak furniture and sculptural lighting"
          fill
          priority
          sizes="100vw"
        />
        <Image
          className={`hero-bg-image hero-slide-2-img hero-crossfade ${
            activeSlide === 1 ? "is-active" : ""
          }`}
          src="/images/bed-1.jpg"
          alt="A tranquil linen bedroom with soft natural light"
          fill
          sizes="100vw"
        />
        <div className="hero-shade" />
      </div>

      <div className="hero-copy grid" style={{ zIndex: 10 }}>
        {heroSlides.map((slide, slideIndex) => {
          const isActive = activeSlide === slideIndex;
          return (
            <div
              className={`hero-slide-copy col-start-1 row-start-1 ${slide.theme} ${
                isActive ? "is-active" : "is-inactive"
              }`}
              key={slide.theme}
            >
              <p className="eyebrow hero-word">{slide.eyebrow}</p>
              <h1>
                {slide.lines.map((line, lineIndex) => (
                  <span className="hero-word" key={`${slide.theme}-${lineIndex}`}>
                    {line.map((part, partIndex) =>
                      part.highlight ? (
                        <span
                          className={`hero-highlight ${part.highlight}`}
                          key={partIndex}
                        >
                          {part.text}
                        </span>
                      ) : (
                        part.text
                      )
                    )}
                  </span>
                ))}
              </h1>
              <p className="hero-sub hero-word">{slide.paragraph}</p>
              <a className="pill hero-word" href="#products">
                {slide.button}{" "}
                <span>
                  <ArrowUpRight size={19} />
                </span>
              </a>
            </div>
          );
        })}
      </div>

      <div className="hero-inset">
        <span className="tiny-stars">
          <Image
            src="/images/logo.png"
            width={80}
            height={80}
            className="mx-auto h-auto w-20 max-w-full object-contain"
            alt="Mellosoft logo"
          />
        </span>
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
        <div
          className={`hero-bottom-slide hero-bottom-slide-one ${
            activeSlide === 0 ? "is-active" : "is-inactive"
          }`}
        >
          <span>SCROLL TO GET COMFORTABLE</span>
          <ArrowDown size={16} />
          <span>{heroSlides[0].counter}</span>
        </div>
        <div
          className={`hero-bottom-slide hero-bottom-slide-two ${
            activeSlide === 1 ? "is-active" : "is-inactive"
          }`}
        >
          <span>SCROLL TO GET COMFORTABLE</span>
          <ArrowDown size={16} />
          <span>{heroSlides[1].counter}</span>
        </div>
      </div>
    </section>
  );
}
