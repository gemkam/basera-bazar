'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/lib/supabase';

export default function TrendingSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/trending')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <h2 className="text-2xl font-bold mb-6">
        📈 Trending <span className="gold-gradient">Now</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
