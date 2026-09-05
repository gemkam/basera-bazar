import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import CartIcon from './CartIcon';
import SearchBar from './SearchBar';
import LangToggleButton from './LangToggleButton';
import AnimatedAnnouncement from './AnimatedAnnouncement';

export const revalidate = 60;

async function getCategories() {
  const { data } = await supabase.from('categories').select('*').order('name');
  return data || [];
}

async function getAnnouncementText() {
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'announcement_text')
    .single();
  return (
    data?.value ||
    "Welcome to BaZariFy: Pakistan's Trusted Store for Quality Products at Unbeatable Prices"
  );
}

const pillLink =
  'btn-pill text-xs px-3 py-1.5 border border-neutral-300 rounded-full';

export default async function Nav() {
  const [categories, announcementText] = await Promise.all([getCategories(), getAnnouncementText()]);
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-neutral-200">
      <div className="text-center text-sm md:text-base py-2 bg-black text-white tracking-wide">
        <AnimatedAnnouncement text={announcementText} />
      </div>
      <nav className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-16 gap-3">
        <Link href="/" className="text-xl md:text-2xl font-bold tracking-tight shrink-0">
          <span className="glass-logo">BaZariFy</span>
        </Link>
        <SearchBar />
        <div className="hidden lg:flex items-center gap-2 text-sm text-neutral-700 shrink-0">
          <Link href="/" className={pillLink}>
            Home
          </Link>
          <Link href="/products" className={pillLink}>
            All Products
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/categories/${c.slug}`} className={pillLink}>
              {c.name}
            </Link>
          ))}
          <Link href="/#contact" className={pillLink}>
            Contact
          </Link>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LangToggleButton />
          <CartIcon />
          <Link href="/admin" className={pillLink}>
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}