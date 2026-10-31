export interface ShowcaseSpec {
  value: number;
  label: string;
}

export interface ShowcaseSlide {
  slug: string;
  title: string;
  subtitle: string;
  label: string;
  color: string;
  side: "left" | "right";
  image: string;
  specs: ShowcaseSpec[];
}

export const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    slug: "cloud",
    title: "Your Dream Bed Awaits",
    subtitle: "Discover your next night's sleep",
    label: "CLOUD",
    color: "#C4561F", // terracotta
    side: "right",
    image: "/images/showcase/cloud.png",
    specs: [
      { value: 5, label: "Comfort layers" },
      { value: 7, label: "Cooling zones" },
      { value: 10, label: "Year warranty" },
    ],
  },
  {
    slug: "zen",
    title: "Sleep Beyond Limits",
    subtitle: "Comfort in every layer",
    label: "ZEN",
    color: "#E8A33D", // warm gold
    side: "left",
    image: "/images/showcase/zen.png",
    specs: [
      { value: 7, label: "Comfort layers" },
      { value: 9, label: "Cooling zones" },
      { value: 15, label: "Year warranty" },
    ],
  },
  {
    slug: "foam",
    title: "Wake Up Renewed",
    subtitle: "Memory foam, made for you",
    label: "FOAM",
    color: "#1F6F63", // deep teal
    side: "right",
    image: "/images/showcase/foam.png",
    specs: [
      { value: 6, label: "Comfort layers" },
      { value: 8, label: "Cooling zones" },
      { value: 12, label: "Year warranty" },
    ],
  },
];

export const SHOWCASE_CONFIG = {
  TIMELINE_DURATION: 2.0,
  TEXT_OUT_DURATION: 0.5,
  TEXT_OUT_OFFSET: 140,
  TEXT_IN_OFFSET: 140,
  TEXT_IN_DURATION: 0.8,
  SLIVER_DURATION: 0.8,
  PANEL_EXPAND_DURATION: 0.9,
  GLITCH_OUT_DURATION: 0.8,
  GLITCH_IN_DURATION: 0.9,
  GHOST_LABEL_DURATION: 1.0,
  SPECS_COUNT_DURATION: 1.0,
  AUTOPLAY_INTERVAL: 6000,
  SWIPE_THRESHOLD: 60,
  POLYGONS: {
    RIGHT: "polygon(55% 0%, 100% 0%, 100% 100%, 25% 100%)",
    LEFT: "polygon(0% 0%, 22% 0%, 78% 100%, 0% 100%)",
    SLIVER: "polygon(47% 0%, 53% 0%, 53% 100%, 47% 100%)",
    MOBILE: "polygon(0% 20%, 100% 0%, 100% 80%, 0% 100%)",
  },
};
