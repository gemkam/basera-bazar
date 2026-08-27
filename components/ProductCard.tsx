'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/supabase';
import { useCart } from '@/lib/cart-context';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  const outOfStock = product.stock <= 0;
  const primaryImage = product.images?.[0];
  const hoverImage = product.images?.[1] || primaryImage;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      handle: product.handle,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || '',
    });
  }

  return (
    <Link
      href={`/products/${product.handle}`}
      className="card rounded-xl overflow-hidden group transition-colors relative"
    >
      <div className="relative aspect-square bg-neutral-900 overflow-hidden">
        {primaryImage && (
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            className="object-cover transition-opacity duration-300 group-hover:opacity-0"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized
          />
        )}
        {hoverImage && (
          <Image
            src={hoverImage}
            alt={product.title}
            fill
            className="object-cover absolute inset-0 opacity-0 scale-105 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized
          />
        )}
        {onSale && (
          <span className="absolute top-2 left-2 bg-[var(--gold)] text-black text-[10px] font-bold px-2 py-1 rounded-full z-10">
            SALE
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs font-semibold tracking-wide z-10">
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
        {!outOfStock && (
          <button
            onClick={handleAddToCart}
            className="mt-2 w-full text-xs font-semibold bg-[var(--gold)] text-black rounded-lg py-1.5 hover:bg-[var(--gold-light)] transition-colors"
          >
            + Add to Cart
          </button>
        )}
      </div>
    </Link>
  );
}
