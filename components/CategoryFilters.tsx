"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * Filter/sort bar for category pages. Reads current sort/filter from the
 * URL (?sort=price_asc&sale=1) and updates it on change — the page.tsx
 * server component re-fetches products based on these params, so no
 * client-side data fetching is needed here.
 */
export default function CategoryFilters({ productCount }: { productCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "default";
  const onSaleOnly = searchParams.get("sale") === "1";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <p className="text-neutral-500">{productCount} products</p>

      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={onSaleOnly}
            onChange={(e) => updateParams({ sale: e.target.checked ? "1" : null })}
            className="w-4 h-4 accent-black"
          />
          On Sale Only
        </label>

        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value === "default" ? null : e.target.value })}
          className="text-sm border border-neutral-300 rounded-lg px-3 py-2 bg-white cursor-pointer focus:outline-none focus:border-black transition-colors"
        >
          <option value="default">Sort: Featured</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest First</option>
          <option value="name_asc">Name: A to Z</option>
        </select>
      </div>
    </div>
  );
}