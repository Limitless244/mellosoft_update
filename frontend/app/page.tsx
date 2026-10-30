import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ShopByCategory from "@/components/ShopByCategory";
import FloatingBedsCard from "@/components/FloatingBedsCard";
import CuratedGrid from "@/components/CuratedGrid";
import ProductCarousel from "@/components/ProductCarousel";
import Showcase from "@/components/Showcase";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
export default function Page() {
  return (
    <>
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      <Navbar />
      <main>
        <div className="relative">
          <FloatingBedsCard />
          <Hero />
          <ShopByCategory />
        </div>
        <CuratedGrid />
        <ProductCarousel />
        <Showcase />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
