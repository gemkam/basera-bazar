'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';

export default function AddToCartBox({
  product,
}: {
  product: { id: string; handle: string; title: string; price: number; images: string[]; stock: number };
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        handle: product.handle,
        title: product.title,
        price: product.price,
        image: product.images?.[0] || '',
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    handleAdd();
    router.push('/cart');
  }

  if (outOfStock) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-neutral-700 rounded-lg">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="px-3 py-2 text-neutral-400 hover:text-white"
        >
          −
        </button>
        <span className="px-3 text-sm">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          className="px-3 py-2 text-neutral-400 hover:text-white"
        >
          +
        </button>
      </div>
      <button
        onClick={handleAdd}
        className="flex-1 bg-[var(--gold)] text-black font-semibold rounded-lg py-2.5 hover:bg-[var(--gold-light)] transition-colors"
      >
        {added ? 'Added ✓' : '+ Add to Cart'}
      </button>
      <button
        onClick={handleBuyNow}
        className="flex-1 border border-[var(--gold)] text-[var(--gold)] font-semibold rounded-lg py-2.5 hover:bg-[var(--gold)] hover:text-black transition-colors"
      >
        Buy Now
      </button>
    </div>
  );
}
