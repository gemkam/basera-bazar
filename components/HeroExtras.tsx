'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DeliveryChecker from './DeliveryChecker';

function Counter({ target, label }: { target: number; label: string }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.round(target / 40));
    const iv = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(iv);
      }
      setValue(current);
    }, 30);
    return () => clearInterval(iv);
  }, [target]);
  return (
    <div className="text-center">
      <div className="text-xl md:text-3xl font-bold gold-gradient">{value}</div>
      <div className="text-[10px] md:text-xs text-neutral-600 uppercase tracking-wide">{label}</div>
    </div>
  );
}

export default function HeroExtras() {
  const [categoryCount, setCategoryCount] = useState(0);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .then(({ count }) => setCategoryCount(count || 0));
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .then(({ count }) => setProductCount(count || 0));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col items-center text-center">
      <div className="flex items-center gap-6 md:gap-10 mb-6">
        <Counter target={categoryCount} label="categories" />
        <Counter target={productCount} label="products" />
        <Counter target={48} label="hr delivery nationwide" />
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/products"
          className="btn-solid bg-[var(--gold)] text-white text-sm font-semibold px-5 py-2.5 rounded-full"
        >
          Start Shopping
        </Link>
        <DeliveryChecker />
      </div>
    </div>
  );
}
