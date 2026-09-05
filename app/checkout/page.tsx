'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';

// Pakistan mobile network prefixes, grouped by carrier, with each
// carrier's brand color used as a small identifying dot (no logo
// images used, to avoid any trademark/logo licensing issues).
const NETWORK_CODES: { code: string; carrier: string; color: string }[] = [
  { code: '0300', carrier: 'Jazz', color: '#E4002B' },
  { code: '0301', carrier: 'Jazz', color: '#E4002B' },
  { code: '0302', carrier: 'Jazz', color: '#E4002B' },
  { code: '0303', carrier: 'Jazz', color: '#E4002B' },
  { code: '0304', carrier: 'Jazz', color: '#E4002B' },
  { code: '0305', carrier: 'Jazz', color: '#E4002B' },
  { code: '0306', carrier: 'Jazz', color: '#E4002B' },
  { code: '0307', carrier: 'Jazz', color: '#E4002B' },
  { code: '0308', carrier: 'Jazz', color: '#E4002B' },
  { code: '0309', carrier: 'Jazz', color: '#E4002B' },
  { code: '0310', carrier: 'Zong', color: '#6A1B9A' },
  { code: '0311', carrier: 'Zong', color: '#6A1B9A' },
  { code: '0312', carrier: 'Zong', color: '#6A1B9A' },
  { code: '0313', carrier: 'Zong', color: '#6A1B9A' },
  { code: '0314', carrier: 'Zong', color: '#6A1B9A' },
  { code: '0315', carrier: 'Zong', color: '#6A1B9A' },
  { code: '0316', carrier: 'Zong', color: '#6A1B9A' },
  { code: '0317', carrier: 'Zong', color: '#6A1B9A' },
  { code: '0318', carrier: 'Zong', color: '#6A1B9A' },
  { code: '0319', carrier: 'Zong', color: '#6A1B9A' },
  { code: '0320', carrier: 'Jazz (Warid)', color: '#8B0000' },
  { code: '0321', carrier: 'Jazz (Warid)', color: '#8B0000' },
  { code: '0322', carrier: 'Jazz (Warid)', color: '#8B0000' },
  { code: '0323', carrier: 'Jazz (Warid)', color: '#8B0000' },
  { code: '0324', carrier: 'Jazz (Warid)', color: '#8B0000' },
  { code: '0325', carrier: 'Jazz (Warid)', color: '#8B0000' },
  { code: '0326', carrier: 'Jazz (Warid)', color: '#8B0000' },
  { code: '0327', carrier: 'Jazz (Warid)', color: '#8B0000' },
  { code: '0328', carrier: 'Jazz (Warid)', color: '#8B0000' },
  { code: '0329', carrier: 'Jazz (Warid)', color: '#8B0000' },
  { code: '0330', carrier: 'Ufone', color: '#F58220' },
  { code: '0331', carrier: 'Ufone', color: '#F58220' },
  { code: '0332', carrier: 'Ufone', color: '#F58220' },
  { code: '0333', carrier: 'Jazz', color: '#E4002B' },
  { code: '0334', carrier: 'Ufone', color: '#F58220' },
  { code: '0335', carrier: 'Jazz', color: '#E4002B' },
  { code: '0336', carrier: 'Jazz', color: '#E4002B' },
  { code: '0337', carrier: 'Jazz', color: '#E4002B' },
  { code: '0338', carrier: 'Jazz', color: '#E4002B' },
  { code: '0339', carrier: 'Jazz', color: '#E4002B' },
  { code: '0340', carrier: 'Telenor', color: '#0066B3' },
  { code: '0341', carrier: 'Telenor', color: '#0066B3' },
  { code: '0342', carrier: 'Telenor', color: '#0066B3' },
  { code: '0343', carrier: 'Telenor', color: '#0066B3' },
  { code: '0344', carrier: 'Telenor', color: '#0066B3' },
  { code: '0345', carrier: 'Telenor', color: '#0066B3' },
  { code: '0346', carrier: 'Telenor', color: '#0066B3' },
  { code: '0347', carrier: 'Telenor', color: '#0066B3' },
  { code: '0348', carrier: 'Telenor', color: '#0066B3' },
  { code: '0349', carrier: 'Telenor', color: '#0066B3' },
  { code: '0355', carrier: 'SCOM', color: '#00843D' },
];

// Major Pakistani cities. "Other" lets someone type a city not listed.
const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar',
  'Gujranwala', 'Islamabad', 'Quetta', 'Bahawalpur', 'Sargodha', 'Sialkot',
  'Sukkur', 'Larkana', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Gujrat',
  'Kasur', 'Mardan', 'Mingora', 'Dera Ghazi Khan', 'Sahiwal', 'Nawabshah',
  'Okara', 'Mirpur Khas', 'Chiniot', 'Kamoke', 'Hafizabad', 'Kohat',
  'Jacobabad', 'Muzaffargarh', 'Khanpur', 'Gojra', 'Bahawalnagar', 'Muridke',
  'Pak Pattan', 'Abbottabad', 'Turbat', 'Dera Ismail Khan', 'Chaman', 'Attock',
  'Vehari', 'Jhelum', 'Nowshera', 'Shikarpur', 'Mianwali', 'Kot Addu',
  'Khairpur', 'Khuzdar', 'Hyderabad', 'Sadiqabad', 'Burewala', 'Kohlu',
  'Kotli', 'Muzaffarabad', 'Mirpur (AJK)', 'Gilgit', 'Skardu', 'Chitral',
  'Swabi', 'Charsadda', 'Nowshehra', 'Toba Tek Singh', 'Wazirabad', 'Daska',
  'Chakwal', 'Taxila', 'Wah Cantt', 'Other',
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    customer_name: '',
    email: '',
    phoneCode: '0300',
    phoneRest: '',
    address: '',
    city: '',
    cityOther: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fullPhone = `${form.phoneCode}${form.phoneRest}`.replace(/\s+/g, '');
    const finalCity = form.city === 'Other' ? form.cityOther : form.city;

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: form.customer_name,
        email: form.email,
        phone: fullPhone,
        address: form.address,
        city: finalCity,
        notes: form.notes,
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

  const selectedNetwork = NETWORK_CODES.find((n) => n.code === form.phoneCode);

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
            <label className="text-xs text-neutral-600">Phone Number / WhatsApp Number</label>
            <div className="flex gap-2 mt-1">
              <div className="relative">
                <select
                  required
                  value={form.phoneCode}
                  onChange={(e) => setForm({ ...form, phoneCode: e.target.value })}
                  className="h-full bg-neutral-50 border border-neutral-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-[var(--gold)] outline-none cursor-pointer"
                >
                  {NETWORK_CODES.map((n) => (
                    <option key={n.code} value={n.code}>
                      {n.code} · {n.carrier}
                    </option>
                  ))}
                </select>
                <span
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold pointer-events-none"
                  style={{ background: selectedNetwork?.color || '#999' }}
                >
                  {selectedNetwork?.carrier.charAt(0) || '?'}
                </span>
              </div>
              <input
                required
                type="tel"
                inputMode="numeric"
                placeholder="1234567"
                value={form.phoneRest}
                onChange={(e) => setForm({ ...form, phoneRest: e.target.value.replace(/[^0-9]/g, '') })}
                maxLength={7}
                className="flex-1 min-w-0 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:border-[var(--gold)] outline-none"
              />
            </div>
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
            <select
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:border-[var(--gold)] outline-none cursor-pointer"
            >
              <option value="" disabled>
                Select your city
              </option>
              {PAKISTAN_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {form.city === 'Other' && (
              <input
                required
                placeholder="Enter your city"
                value={form.cityOther}
                onChange={(e) => setForm({ ...form, cityOther: e.target.value })}
                className="w-full mt-2 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:border-[var(--gold)] outline-none"
              />
            )}
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
            {loading ? 'Placing Order...' : `Place Order: Rs. ${subtotal.toLocaleString()}`}
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