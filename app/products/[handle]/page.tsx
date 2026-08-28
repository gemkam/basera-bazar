import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ProductDetailPanel from "./ProductDetailPanel";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const { data: product } = await supabase
    .from("products")
    .select("title, description_html, images, price")
    .eq("handle", handle)
    .single();

  if (!product) return { title: "Product Not Found | BaZariFy" };

  const description = (product.description_html || "").slice(0, 155);

  return {
    title: `${product.title} | BaZariFy`,
    description: description || `Buy ${product.title} at BaZariFy - Rs. ${product.price}`,
    openGraph: {
      title: product.title,
      description: description,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("handle", handle)
    .single();

  if (!product) notFound();

  const outOfStock = product.stock <= 0;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://basera-bazar-lac.vercel.app';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: (product.description_html || "").slice(0, 500),
    image: product.images || [],
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: product.price,
      availability: outOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailPanel product={product} siteUrl={siteUrl} />
    </>
  );
}
