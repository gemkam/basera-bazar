import HeroSlideshow from "@/components/HeroSlideshow";
import HeroExtras from "@/components/HeroExtras";
import ProductCard from "@/components/ProductCard";
import TrendingSection from "@/components/TrendingSection";
import RecentlyViewed from "@/components/RecentlyViewed";
import PromoBanner from "@/components/PromoBanner";
import ContactForm from "@/components/ContactForm";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BaZariFy | Quality Products & Best Deals Online in Pakistan",
  description:
    "Shop the best selection of home & kitchen tools, electronics, beauty care, and lifestyle accessories online in Pakistan. Enjoy Cash on Delivery nationwide and unbeatable prices.",
  keywords: [
    "online shopping Pakistan",
    "best deals online",
    "Cash on Delivery store",
    "trending gadgets Pakistan",
    "BaZariFy",
  ],
};

// New sections — all bundled in one file, components/HomepageExtras.tsx
import {
  ScrollReveal,
  TrustBadges,
  StatsCounter,
  HowItWorks,
  WhyChooseUs,
  Testimonials,
  CountdownTimer,
  ScrollIndicator,
} from "@/components/HomepageExtras";

export const revalidate = 60;

async function getCategories() {
  const { data } = await supabase.from("categories").select("*").order("name");
  return data || [];
}

async function getFeatured() {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);
  return data || [];
}

// Real counts for the stats bar — replaces guessed marketing numbers
async function getCounts() {
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { count: categoryCount } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });

  return {
    productCount: productCount || 0,
    categoryCount: categoryCount || 0,
  };
}

// Rolling weekly deadline for the Best Deals countdown (resets every Sunday night).
// Swap this out for a real sale end date whenever you run an actual promotion.
function getNextSaleEnd(): string {
  const now = new Date();
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  const end = new Date(now);
  end.setDate(now.getDate() + daysUntilSunday);
  end.setHours(23, 59, 59, 0);
  return end.toISOString();
}

export default async function Home() {
  const [categories, featured, counts] = await Promise.all([
    getCategories(),
    getFeatured(),
    getCounts(),
  ]);

  const saleEnd = getNextSaleEnd();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: "BaZariFy",
    url: "https://basera-bazar-lac.vercel.app",
    description:
      "Shop quality home, kitchen, electronics, beauty, and lifestyle products at BaZariFy. Cash on Delivery available nationwide.",
    paymentAccepted: "Cash on Delivery",
    areaServed: "PK",
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScrollIndicator />

      {/* Sticky hero — stays pinned while the rest of the page scrolls
          up and over it. Remove the two wrapping divs below (keep
          HeroSlideshow/HeroExtras as before) if this doesn't look
          right with your hero's actual height. */}
      <div className="sticky-hero-wrap">
        <HeroSlideshow />
        <HeroExtras />
      </div>

      <div className="content-overlap">
      <ScrollReveal direction="up">
        <TrustBadges />
      </ScrollReveal>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Our <span className="gold-gradient">Collections</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="category-card relative overflow-hidden card rounded-xl p-6 text-center hover:scale-[1.02] transition-all duration-300"
            >
              <img
                src="/icons/shopping-bag.svg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-contain p-6 opacity-[0.06] pointer-events-none select-none"
              />
              <span className="relative z-10 text-sm md:text-base font-medium">{c.name}</span>
              <span className="category-glow" />
            </Link>
          ))}
        </div>
      </section>

      <ScrollReveal direction="up">
        <StatsCounter
          stats={[
            { label: "Products Available", value: counts.productCount, suffix: "+" },
            { label: "Categories", value: counts.categoryCount },
            // Placeholders below — update with your real figures once you have them
            { label: "Cities Delivered", value: 50, suffix: "+" },
            { label: "Customer Rating", value: 4.8, suffix: "★" },
          ]}
        />
      </ScrollReveal>

      <TrendingSection />

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
          <h2 className="text-2xl font-bold">
            🔥 Best <span className="gold-gradient">Deals</span>
          </h2>
          <div className="flex items-center gap-4">
            <CountdownTimer endTime={saleEnd} label="Deals end in" />
            <Link href="/products" className="text-sm text-neutral-600 hover:text-neutral-900">
              View all →
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <HowItWorks />

      <WhyChooseUs />

      <Testimonials />

      <RecentlyViewed />
      <PromoBanner />
      <ContactForm />
      </div>
    </div>
  );
}
