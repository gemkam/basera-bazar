import HeroSlideshow from "@/components/HeroSlideshow";
import HeroExtras from "@/components/HeroExtras";
import ProductCard from "@/components/ProductCard";
import TrendingSection from "@/components/TrendingSection";
import RecentlyViewed from "@/components/RecentlyViewed";
import PromoBanner from "@/components/PromoBanner";
import ContactForm from "@/components/ContactForm";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

export default async function Home() {
  const [categories, featured] = await Promise.all([getCategories(), getFeatured()]);

  return (
    <div>
      <HeroSlideshow />
      <HeroExtras />

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

      <TrendingSection />

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            🔥 Best <span className="gold-gradient">Deals</span>
          </h2>
          <Link href="/products" className="text-sm text-neutral-600 hover:text-neutral-900">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <RecentlyViewed />

      <PromoBanner />

      <ContactForm />
    </div>
  );
}
