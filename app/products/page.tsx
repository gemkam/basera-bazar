import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export default async function AllProductsPage() {
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">
        All <span className="gold-gradient">Products</span>
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(products || []).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
