import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/supabase';

export default function ProductCard({ product }: { product: Product }) {
  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/products/${product.handle}`}
      className="card rounded-xl overflow-hidden group transition-colors"
    >
      <div className="relative aspect-square bg-neutral-900 overflow-hidden">
        {product.images?.[0] && (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized
          />
        )}
        {onSale && (
          <span className="absolute top-2 left-2 bg-[var(--gold)] text-black text-[10px] font-bold px-2 py-1 rounded-full">
            SALE
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs font-semibold tracking-wide">
            OUT OF STOCK
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm text-neutral-200 line-clamp-2 min-h-[2.5rem]">{product.title}</h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[var(--gold)] font-semibold">Rs. {product.price.toLocaleString()}</span>
          {onSale && (
            <span className="text-neutral-500 text-xs line-through">
              Rs. {product.compare_at_price!.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
