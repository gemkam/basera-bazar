import ProductCard from "@/components/ProductCard";
import CategoryFilters from "@/components/CategoryFilters";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

// Per-category SEO content. Add an entry here for any new category slug;
// falls back to a generic description if a slug isn't listed.
const categorySeo: Record<string, { title: string; description: string; intro: string }> = {
  "beauty-personal-care": {
    title: "Beauty & Personal Care Products Online in Pakistan | BaZariFy",
    description:
      "Discover premium beauty items, skin care solutions, and personal care essentials at affordable prices. Shop online with nationwide Cash on Delivery.",
    intro:
      "Upgrade your daily self-care routine with BaZariFy's curated collection of beauty and personal care products. From premium fragrances like Lattafa to daily skincare essentials, we bring you 100% genuine products right to your doorstep anywhere in Pakistan.",
  },
  "electronics-gadgets": {
    title: "Smart Electronics & Tech Gadgets Online in Pakistan | BaZariFy",
    description:
      "Buy innovative electronic gadgets, portable fans, and smart car accessories online. Best prices and fast nationwide delivery in Pakistan.",
    intro:
      "Explore the latest tech innovations and clever electronics designed to make life easier. Whether you are looking for smart vehicle accessories, portable mini desk fans, or practical daily gadgets, BaZariFy offers high-performance tech at unbeatable local prices.",
  },
  "home-kitchen": {
    title: "Home & Kitchen Accessories Online Shopping | BaZariFy",
    description:
      "Make your kitchen smarter with premium oil filters, anti-vibration mats, and modern home utilities. Fast COD delivery across Pakistan.",
    intro:
      "Transform your living space with smart home and kitchen solutions. Find practical tools like stainless steel oil strainers, heavy-duty appliance mats, and efficient daily utilities designed for modern Pakistani households.",
  },
  "lifestyle-accessories": {
    title: "Trendy Lifestyle Accessories & Car Care | BaZariFy",
    description:
      "Shop unique lifestyle goods, anti-glare car mirrors, waterproof mobile pouches, and more. Nationwide Cash on Delivery available.",
    intro:
      "Elevate your everyday lifestyle with unique accessories and car care solutions. Discover handy travel gear, vehicle safety add-ons, and clever lifestyle products tailored for convenience and style.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: category } = await supabase.from("categories").select("name").eq("slug", slug).single();
  if (!category) return { title: "Category Not Found | BaZariFy" };

  const seo = categorySeo[slug];
  return {
    title: seo?.title || `${category.name} | BaZariFy`,
    description:
      seo?.description ||
      `Shop ${category.name} at BaZariFy - quality products at unbeatable prices with Cash on Delivery.`,
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

  const seo = categorySeo[slug];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: seo?.description || `Shop ${category.name} at BaZariFy.`,
    url: `https://basera-bazar-lac.vercel.app/categories/${slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://basera-bazar-lac.vercel.app" },
        {
          "@type": "ListItem",
          position: 2,
          name: category.name,
          item: `https://basera-bazar-lac.vercel.app/categories/${slug}`,
        },
      ],
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-3xl font-bold mb-2">
        <span className="gold-gradient">{category.name}</span>
      </h1>

      {seo?.intro && <p className="text-neutral-600 max-w-3xl mb-6 leading-relaxed">{seo.intro}</p>}

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