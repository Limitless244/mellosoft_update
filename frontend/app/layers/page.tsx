import type { Metadata } from "next";
import MattressLayers from "@/components/layers/MattressLayers";

export const metadata: Metadata = {
  title: "Inside the Mattress | Mellosoft",
  description:
    "Explore the 5-layer anatomy of our luxury mattress with an interactive 3D scroll-driven breakdown.",
};

export default function LayersPage() {
  return (
    <main className="w-full bg-[#EDE6DC]">
      <MattressLayers />
    </main>
  );
}
