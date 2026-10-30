import type { Metadata } from "next";
import { Cormorant_Garamond, Urbanist } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const h = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-heading",
  display: "swap",
});
const b = Urbanist({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Mellosoft | A softer way to live",
  description:
    "Thoughtfully crafted beds. Timeless design. A softer place to begin and end your day.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={h.variable + " " + b.variable}>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}

