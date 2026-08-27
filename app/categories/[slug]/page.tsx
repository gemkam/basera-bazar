import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", category.id)
    .eq("is_active", true)
    .order("title");

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">
        <span className="gold-gradient">{category.name}</span>
      </h1>
      <p className="text-neutral-500 mb-8">{products?.length || 0} products</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(products || []).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {(!products || products.length === 0) && (
        <p className="text-neutral-500 text-center py-20">No products in this category yet.</p>
      )}
    </div>
  );
}
