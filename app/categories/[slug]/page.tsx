import ProductCard from "@/components/ProductCard";
import CategoryFilters from "@/components/CategoryFilters";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: category } = await supabase.from("categories").select("name").eq("slug", slug).single();
  if (!category) return { title: "Category Not Found | BaZariFy" };
  return {
    title: `${category.name} | BaZariFy`,
    description: `Shop ${category.name} at BaZariFy - quality products at unbeatable prices with Cash on Delivery.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; sale?: string }>;
}) {
  const { slug } = await params;
  const { sort, sale } = await searchParams;

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  let query = supabase
    .from("products")
    .select("*")
    .eq("category_id", category.id)
    .eq("is_active", true);

  // On Sale Only — compare_at_price greater than price means it's discounted
  if (sale === "1") {
    query = query.not("compare_at_price", "is", null).gt("compare_at_price", 0);
  }

  // Sorting
  switch (sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "name_asc":
      query = query.order("title", { ascending: true });
      break;
    default:
      query = query.order("title", { ascending: true });
  }

  const { data: products } = await query;

  // Extra safety filter for "on sale" in case compare_at_price exists but
  // isn't actually higher than price for some rows
  const filteredProducts =
    sale === "1"
      ? (products || []).filter((p) => p.compare_at_price && p.compare_at_price > p.price)
      : products || [];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">
        <span className="gold-gradient">{category.name}</span>
      </h1>

      <CategoryFilters productCount={filteredProducts.length} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-neutral-500 text-center py-20">
          {sale === "1" ? "No products on sale in this category right now." : "No products in this category yet."}
        </p>
      )}
    </div>
  );
}