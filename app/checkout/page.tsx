'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ customer_name: '', email: '', phone: '', address: '', city: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        items: items.map((i) => ({
          productId: i.productId,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
        })),
      }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      clearCart();
      router.push(`/order-confirmed?id=${data.orderId}`);
    } else {
      const data = await res.json();
      setError(data.error || 'Something went wrong. Please try again.');
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 md:px-6 py-20 text-center">
        <p className="text-neutral-500">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 grid md:grid-cols-2 gap-10">
      <div>
        <h1 className="text-2xl font-bold mb-6">
          <span className="gold-gradient">Checkout</span>
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div>
            <label className="text-xs text-neutral-600">Full Name</label>
            <input
              required
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:border-[var(--gold)] outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-600">Phone Number</label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:border-[var(--gold)] outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-600">Email Address</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:border-[var(--gold)] outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-600">Delivery Address</label>
            <textarea
              required
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:border-[var(--gold)] outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-600">City</label>
            <input
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:border-[var(--gold)] outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-600">Order Notes (optional)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:border-[var(--gold)] outline-none"
            />
          </div>

          <div className="card rounded-xl p-4">
            <p className="text-sm font-semibold mb-1">Payment Method</p>
            <p className="text-neutral-600 text-sm">💵 Cash on Delivery (COD)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--gold)] text-white font-semibold rounded-lg py-3 hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50"
          >
            {loading ? 'Placing Order...' : `Place Order — Rs. ${subtotal.toLocaleString()}`}
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-semibold mb-4">Order Summary</h2>
        <div className="card rounded-xl p-4 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-neutral-700">
                {item.title} × {item.quantity}
              </span>
              <span className="text-[var(--gold)]">
                Rs. {(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="border-t border-neutral-200 pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-[var(--gold)]">Rs. {subtotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
