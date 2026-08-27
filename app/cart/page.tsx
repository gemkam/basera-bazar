'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-3">
          Your <span className="gold-gradient">Cart</span> is Empty
        </h1>
        <p className="text-neutral-500 mb-6">Add some products to get started.</p>
        <Link
          href="/products"
          className="inline-block bg-[var(--gold)] text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-[var(--gold-light)] transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
      <h1 className="text-2xl font-bold mb-8">
        Your <span className="gold-gradient">Cart</span>
      </h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.productId} className="card rounded-xl p-4 flex items-center gap-4">
            <div className="relative w-20 h-20 bg-neutral-900 rounded-lg overflow-hidden flex-shrink-0">
              {item.image && (
                <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm line-clamp-2">{item.title}</p>
              <p className="text-[var(--gold)] font-semibold mt-1">Rs. {item.price.toLocaleString()}</p>
            </div>
            <div className="flex items-center border border-neutral-700 rounded-lg">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="px-3 py-1 text-neutral-400 hover:text-white"
              >
                −
              </button>
              <span className="px-3 text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="px-3 py-1 text-neutral-400 hover:text-white"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(item.productId)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="card rounded-xl p-6 flex items-center justify-between">
        <div>
          <p className="text-neutral-400 text-sm">Subtotal</p>
          <p className="text-2xl font-bold text-[var(--gold)]">Rs. {subtotal.toLocaleString()}</p>
        </div>
        <Link
          href="/checkout"
          className="bg-[var(--gold)] text-black font-semibold px-8 py-3 rounded-lg hover:bg-[var(--gold-light)] transition-colors"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
