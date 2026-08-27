import HeroSlideshow from "@/components/HeroSlideshow";
import ProductCard from "@/components/ProductCard";
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

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">
          Our <span className="gold-gradient">Collections</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="card rounded-xl p-6 text-center hover:scale-[1.02] transition-transform"
            >
              <span className="text-sm md:text-base font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            🔥 Best <span className="gold-gradient">Deals</span>
          </h2>
          <Link href="/products" className="text-sm text-neutral-400 hover:text-white">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
