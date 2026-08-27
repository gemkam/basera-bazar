import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import CartIcon from './CartIcon';

export const revalidate = 60;

async function getCategories() {
  const { data } = await supabase.from('categories').select('*').order('name');
  return data || [];
}

export default async function Nav() {
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-neutral-800">
      <div className="text-center text-xs py-1.5 bg-neutral-950 text-neutral-400 tracking-wide">
        Welcome to Basera Bazaar — Quality products, unbeatable prices
      </div>
      <nav className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Basera <span className="gold-gradient">Bazaar</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/products" className="hover:text-white transition-colors">All Products</Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="hover:text-white transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <CartIcon />
          <Link
            href="/admin"
            className="text-xs px-3 py-1.5 border border-neutral-700 rounded-full hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
          >
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}
