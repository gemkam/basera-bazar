import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://basera-bazar-lac.vercel.app';

  const { data: products } = await supabase.from('products').select('handle, updated_at').eq('is_active', true);
  const { data: categories } = await supabase.from('categories').select('slug');

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/policies/shipping`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/policies/returns`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/policies/privacy`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/policies/terms`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${baseUrl}/products/${p.handle}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((c) => ({
    url: `${baseUrl}/categories/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
