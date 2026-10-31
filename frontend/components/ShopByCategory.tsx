"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowRight, Plus } from "lucide-react";
import Reveal from "./Reveal";

const categories = [
  {
    name: "Beds",
    slug: "beds",
    image: "/images/categoryimg/bed.png",
    subtitle: "Crafted for deep rest",
    items: "18 designs",
    badge: "BESTSELLER",
  },
  {
    name: "Pillows",
    slug: "pillows",
    image: "/images/categoryimg/pillow.png",
    subtitle: "A softer kind of support",
    items: "12 styles",
  },
  {
    name: "Firm Mattresses",
    slug: "firm-mattresses",
    image: "/images/categoryimg/firm.png",
    subtitle: "Comfort that holds its shape",
    items: "8 models",
  },
  {
    name: "Bed Frames",
    slug: "bed-frames",
    image: "/images/categoryimg/frames.png",
    subtitle: "Solid wood & upholstery",
    items: "14 options",
  },
  {
    name: "Protectors",
    slug: "protectors",
    image: "/images/categoryimg/covers.png",
    subtitle: "Breathable & waterproof",
    items: "6 sizes",
  },
  {
    name: "Memory Foam",
    slug: "memory-foam",
    image: "/images/categoryimg/foam.png",
    subtitle: "Pressure-relieving comfort",
    items: "10 models",
  },
];

export default function ShopByCategory() {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, x: 0, left: 0 });

  return (
    <section id="categories" className="section shop-categories">
      <Reveal>
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow">FIND YOUR FIT</p>
            <h2>
              Shop by Category<span className="accent">.</span>
            </h2>
          </div>
          <a className="text-link" href="#categories">
            Explore all categories <ArrowRight size={14} />
          </a>
        </div>

        <div
          className="product-rail category-rail"
          ref={rail}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest("button, a")) return;
            drag.current = {
              active: true,
              x: e.clientX,
              left: rail.current?.scrollLeft ?? 0,
            };
          }}
          onPointerMove={(e) => {
            if (
              drag.current.active &&
              rail.current &&
              e.pointerType === "mouse"
            )
              rail.current.scrollLeft =
                drag.current.left - (e.clientX - drag.current.x);
          }}
          onPointerUp={() => (drag.current.active = false)}
          onPointerLeave={() => (drag.current.active = false)}
        >
          {categories.map((c, i) => (
            <article className="product category-item" key={c.slug}>
              <a href={`/shop/${c.slug}`} className="block">
                <div className="product-image">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width:600px) 80vw, (max-width:1000px) 45vw, 23vw"
                    loading={i < 3 ? "eager" : undefined}
                    draggable={false}
                  />
                  {c.badge && <span className="badge">{c.badge}</span>}
                  <span
                    className="circle dark add"
                    aria-label={`Explore ${c.name}`}
                  >
                    <Plus size={19} />
                  </span>
                </div>
                <div className="product-info">
                  <h3>{c.name}</h3>
                  <span>{c.items}</span>
                </div>
                <p>{c.subtitle}</p>
              </a>
            </article>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
