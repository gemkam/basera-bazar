import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  const supabase = getServiceSupabase();

  // Rank products by total quantity sold across all orders (real demand signal)
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('product_id, quantity');

  const salesCount: Record<string, number> = {};
  for (const item of orderItems || []) {
    if (!item.product_id) continue;
    salesCount[item.product_id] = (salesCount[item.product_id] || 0) + item.quantity;
  }

  const topProductIds = Object.entries(salesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id]) => id);

  if (topProductIds.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .in('id', topProductIds)
    .eq('is_active', true);

  // preserve ranking order
  const ordered = topProductIds
    .map((id) => products?.find((p) => p.id === id))
    .filter(Boolean);

  return NextResponse.json({ products: ordered });
}
