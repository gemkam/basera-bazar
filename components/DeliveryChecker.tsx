'use client';

import { useState } from 'react';

const COVERED_CITIES = [
  'karachi',
  'lahore',
  'islamabad',
  'multan',
  'faisalabad',
  'rawalpindi',
  'hyderabad',
  'gujranwala',
  'sialkot',
];

export default function DeliveryChecker() {
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState('');
  const [result, setResult] = useState<'yes' | 'no' | null>(null);

  function check() {
    const c = city.trim().toLowerCase();
    if (!c) return;
    setResult(COVERED_CITIES.includes(c) ? 'yes' : 'no');
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-black/5 border border-black/20 text-neutral-900 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-black/10 transition-colors"
      >
        Check Delivery to Your Area
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-neutral-900">Check Delivery to Your Area</h3>
              <button
                onClick={() => {
                  setOpen(false);
                  setResult(null);
                  setCity('');
                }}
                className="text-neutral-600 hover:text-neutral-900 text-xl"
              >
                ×
              </button>
            </div>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && check()}
              type="text"
              placeholder="Enter your city"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[var(--gold)] text-neutral-900"
            />
            <button
              onClick={check}
              className="btn-solid w-full bg-[var(--gold)] text-white text-sm font-semibold py-2 rounded-lg"
            >
              Check
            </button>
            {result === 'yes' && (
              <p className="text-xs mt-3 text-[var(--gold)]">✓ Delivery available in your city</p>
            )}
            {result === 'no' && (
              <p className="text-xs mt-3 text-neutral-600">
                Not confirmed yet — contact us and we&apos;ll check for your area
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
