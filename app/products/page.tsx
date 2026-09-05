import ProductCard from "@/components/ProductCard";
import CategoryFilters from "@/components/CategoryFilters";
import Pagination from "@/components/Pagination";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

const PRODUCTS_PER_PAGE = 12;

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; sale?: string; page?: string }>;
}) {
  const { sort, sale, page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10) || 1);

  let baseQuery = supabase.from("products").select("*", { count: "exact" }).eq("is_active", true);

  if (sale === "1") {
    baseQuery = baseQuery.not("compare_at_price", "is", null).gt("compare_at_price", 0);
  }

  switch (sort) {
    case "price_asc":
      baseQuery = baseQuery.order("price", { ascending: true });
      break;
    case "price_desc":
      baseQuery = baseQuery.order("price", { ascending: false });
      break;
    case "name_asc":
      baseQuery = baseQuery.order("title", { ascending: true });
      break;
    case "newest":
    default:
      baseQuery = baseQuery.order("created_at", { ascending: false });
  }

  const from = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  const { data: products, count } = await baseQuery.range(from, to);

  // Extra safety filter for "on sale" in case compare_at_price exists but
  // isn't actually higher than price for some rows
  const filteredProducts =
    sale === "1"
      ? (products || []).filter((p) => p.compare_at_price && p.compare_at_price > p.price)
      : products || [];

  const totalCount = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PRODUCTS_PER_PAGE));

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">
        All <span className="gold-gradient">Products</span>
      </h1>

      <CategoryFilters productCount={totalCount} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-neutral-500 text-center py-20">
          {sale === "1" ? "No products on sale right now." : "No products found."}
        </p>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}