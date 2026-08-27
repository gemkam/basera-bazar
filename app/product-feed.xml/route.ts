import { supabase } from '@/lib/supabase';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://basera-bazar-lac.vercel.app';

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('is_active', true);

  const items = (products || [])
    .map((p) => {
      const description = (p.description_html || '').replace(/<[^>]*>/g, '').slice(0, 5000);
      const availability = p.stock > 0 ? 'in stock' : 'out of stock';
      const imageLink = p.images?.[0] || '';
      const additionalImages = (p.images || [])
        .slice(1, 10)
        .map((img: string) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
        .join('\n      ');

      return `
    <item>
      <g:id>${escapeXml(p.handle)}</g:id>
      <title>${escapeXml(p.title)}</title>
      <description>${escapeXml(description)}</description>
      <link>${baseUrl}/products/${p.handle}</link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      ${additionalImages}
      <g:availability>${availability}</g:availability>
      <g:price>${p.price} PKR</g:price>
      ${p.compare_at_price ? `<g:sale_price>${p.price} PKR</g:sale_price>` : ''}
      <g:brand>BaZariFy</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${escapeXml(p.categories?.name || 'General')}</g:product_type>
      <g:google_product_category>${escapeXml(p.categories?.name || 'General')}</g:google_product_category>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
    })
    .join('');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>BaZariFy Product Feed</title>
    <link>${baseUrl}</link>
    <description>BaZariFy — Quality products at unbeatable prices</description>
    ${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
