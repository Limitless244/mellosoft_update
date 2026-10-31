import type { Metadata } from "next";
import ShowcaseHero from "@/components/showcase/ShowcaseHero";

export const metadata: Metadata = {
  title: "Product Showcase | Mellosoft",
  description: "Experience our luxury beds with full-screen dynamic animations.",
};

export default function ShowcasePage() {
  return (
    <main className="w-full min-h-screen bg-[#262628]">
      <ShowcaseHero />
    </main>
  );
}
