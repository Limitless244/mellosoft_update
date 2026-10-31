"use client";
import Image from "next/image";
import BedPreview from "./BedPreview";
import HeroSunrise from "./HeroSunrise";
import { useState, useEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight, Plus } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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

/* ─── Static PhotoCard Component ─────────────────────────────────── */
function PhotoCard({
  src,
  alt,
  style,
  showBadge,
}: {
  src: string;
  alt: string;
  style: React.CSSProperties;
  showBadge?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: "18px",
        overflow: "hidden",
        border: "6px solid #fff",
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
        ...style,
      }}
    >
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

  useEffect(() => {
    if (!root.current) return;
    if (typeof window === "undefined") return;

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
      <HeroSunrise activeSlide={activeSlide} />
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
        <div className="hero-mobile-gradient" />
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

      {/* ── Static 3-Card Stack in the Hero (Right Side, Preserved Appearance) ── */}
      <div
        className="hero-card-stack hidden md:block"
        style={{
          position: "absolute",
          right: "6%",
          top: "clamp(60px, 10vh, 95px)",
          width: "300px",
          height: "340px",
          zIndex: 25,
          pointerEvents: "auto",
        }}
      >
        {/* back — pillows */}
        <PhotoCard
          src="/images/categoryimg/pillow.png"
          alt="Pillows"
          style={{
            transform: "rotate(-9deg) translate(-70px, 18px)",
            zIndex: 10,
          }}
        />

        {/* middle — firm mattresses */}
        <PhotoCard
          src="/images/categoryimg/firm.png"
          alt="Firm Mattresses"
          style={{
            transform: "rotate(-4deg) translate(-32px, 8px)",
            zIndex: 20,
          }}
        />

        {/* front — beds */}
        <PhotoCard
          src="/images/categoryimg/bed.png"
          alt="Beds"
          showBadge
          style={{ zIndex: 30 }}
        />
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
          <span className="hero-bottom-scroll">SCROLL TO GET COMFORTABLE</span>
          <span className="hero-bottom-scroll">
            <ArrowDown size={16} />
          </span>
          <span className="hero-bottom-counter">{heroSlides[0].counter}</span>
        </div>
        <div
          className={`hero-bottom-slide hero-bottom-slide-two ${
            activeSlide === 1 ? "is-active" : "is-inactive"
          }`}
        >
          <span className="hero-bottom-scroll">SCROLL TO GET COMFORTABLE</span>
          <span className="hero-bottom-scroll">
            <ArrowDown size={16} />
          </span>
          <span className="hero-bottom-counter">{heroSlides[1].counter}</span>
        </div>
      </div>
    </section>
  );
}
