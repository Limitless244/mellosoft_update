"use client";
import Image from "next/image";
import { useState, useEffect, useRef, ComponentType } from "react";
import ModelBoundary from "./three/ModelBoundary";

interface SceneProps {
  color?: string;
  variant?: number;
}

export default function BedPreview({ variant = 0 }: { variant?: number }) {
  const [color, setColor] = useState("#c7b69f");
  const [ready, setReady] = useState(false);
  const [SceneComponent, setSceneComponent] = useState<ComponentType<SceneProps> | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    if (!matchMedia("(min-width:768px)").matches || (nav.deviceMemory ?? 8) < 4)
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150px" },
    );
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!ready) return;
    let mounted = true;
    import("./three/Scene")
      .then((mod) => {
        if (mounted) setSceneComponent(() => mod.default);
      })
      .catch((err) => {
        console.warn("Could not load 3D scene:", err);
      });
    return () => {
      mounted = false;
    };
  }, [ready]);

  const fallbackImage = (
    <div className="scene">
      <Image
        src={
          ["/images/hero.jpg", "/images/bed-2.jpg", "/images/bed-1.jpg", "/images/bed-3.jpg"][
            variant % 4
          ]
        }
        alt="A softly upholstered bed in a warm, neutral bedroom"
        fill
        sizes="(max-width:768px) 100vw, 50vw"
        style={{
          filter:
            color === "#8c8a85"
              ? "saturate(.25)"
              : color === "#b96341"
                ? "sepia(.25)"
                : "none",
        }}
      />
    </div>
  );

  return (
    <div ref={root} className="bed-preview">
      {ready && SceneComponent ? (
        <ModelBoundary fallback={fallbackImage}>
          <SceneComponent color={color} variant={variant} />
        </ModelBoundary>
      ) : (
        fallbackImage
      )}
      <div className="swatches" aria-label="Fabric color">
        {[
          ["Natural linen", "#c7b69f"],
          ["Stone grey", "#8c8a85"],
          ["Terracotta", "#b96341"],
        ].map(([name, value]) => (
          <button
            key={name}
            aria-label={name}
            aria-pressed={color === value}
            style={{ background: value }}
            onClick={() => setColor(value)}
          />
        ))}
      </div>
    </div>
  );
}
