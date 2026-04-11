import { HeroCarousel } from "@/components/hero-carousel"
import { CategoryGrid } from "@/components/category-grid"
import { FeaturedProducts } from "@/components/featured-products"
import { BenefitsSection } from "@/components/benefits-section"
import { AboutIntro } from "@/components/about-intro"

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <BenefitsSection />
      <FeaturedProducts />
      <CategoryGrid />
      <AboutIntro />
    </>
  )
}
