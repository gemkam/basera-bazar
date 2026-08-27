import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";

export const revalidate = 60;

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

  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  const outOfStock = product.stock <= 0;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 grid md:grid-cols-2 gap-10">
      <div className="space-y-3">
        <div className="relative aspect-square bg-neutral-900 rounded-xl overflow-hidden">
          {product.images?.[0] && (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover"
              unoptimized
              priority
            />
          )}
        </div>
        {product.images?.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(1, 5).map((img: string, i: number) => (
              <div key={i} className="relative aspect-square bg-neutral-900 rounded-lg overflow-hidden">
                <Image src={img} alt="" fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.title}</h1>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-bold text-[var(--gold)]">
            Rs. {product.price.toLocaleString()}
          </span>
          {onSale && (
            <span className="text-neutral-500 line-through">
              Rs. {product.compare_at_price.toLocaleString()}
            </span>
          )}
        </div>

        <div className="mb-6">
          {outOfStock ? (
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-red-950 text-red-400 border border-red-900">
              Out of Stock
            </span>
          ) : (
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-green-950 text-green-400 border border-green-900">
              In Stock ({product.stock} available)
            </span>
          )}
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-neutral-300 leading-relaxed whitespace-pre-line">
          {product.description_html}
        </div>
      </div>
    </div>
  );
}
