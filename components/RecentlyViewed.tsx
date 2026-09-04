'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/supabase';
import ProductCard from './ProductCard';

const STORAGE_KEY = 'bazarify-recently-viewed';

export function trackRecentlyViewed(productId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let ids: string[] = raw ? JSON.parse(raw) : [];
    ids = ids.filter((id) => id !== productId);
    ids.unshift(productId);
    ids = ids.slice(0, 4);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* localStorage unavailable — skip silently */
  }
}

export default function RecentlyViewed() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      let ids: string[] = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        ids = raw ? JSON.parse(raw) : [];
      } catch {
        ids = [];
      }
      if (ids.length) {
        const { data } = await supabase.from('products').select('*').in('id', ids);
        const byId = new Map((data || []).map((p) => [p.id, p]));
        setProducts(ids.map((id) => byId.get(id)).filter(Boolean) as Product[]);
      }
      setLoaded(true);
    }
    load();
  }, []);

  if (!loaded || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <h3 className="text-lg font-semibold mb-4 text-neutral-900">Recently Viewed</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
