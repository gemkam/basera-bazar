'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function Confirmation() {
  const params = useSearchParams();
  const orderId = params.get('id');

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 py-20 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-3">
        Order <span className="gold-gradient">Confirmed!</span>
      </h1>
      <p className="text-neutral-400 mb-2">
        Thank you for your order. We&apos;ll contact you shortly to confirm delivery.
      </p>
      {orderId && (
        <p className="text-neutral-600 text-xs mb-6">Order ID: {orderId.slice(0, 8).toUpperCase()}</p>
      )}
      <p className="text-neutral-400 mb-8">
        Payment: <span className="text-[var(--gold)]">Cash on Delivery</span>
      </p>
      <Link
        href="/products"
        className="inline-block bg-[var(--gold)] text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-[var(--gold-light)] transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-neutral-500">Loading...</div>}>
      <Confirmation />
    </Suspense>
  );
}
