import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PromoShowcase from "@/components/PromoShowcase";
import ShopByCategory from "@/components/ShopByCategory";
import CuratedGrid from "@/components/CuratedGrid";
import ProductCarousel from "@/components/ProductCarousel";
import MattressLayers from "@/components/layers/MattressLayers";
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
        <Hero />
        <PromoShowcase />
        <ShopByCategory />
        <CuratedGrid />
        <ProductCarousel />
        <MattressLayers />
        <Showcase />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
