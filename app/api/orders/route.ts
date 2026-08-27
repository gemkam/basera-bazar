import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customer_name, phone, address, city, notes, items } = body;

  if (!customer_name || !phone || !address || !city || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const total = items.reduce(
    (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
    0
  );

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name,
      phone,
      address,
      city,
      notes: notes || null,
      payment_method: 'cod',
      status: 'pending',
      total,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message || 'Failed to create order' }, { status: 500 });
  }

  const orderItems = items.map((i: { productId: string; title: string; price: number; quantity: number }) => ({
    order_id: order.id,
    product_id: i.productId,
    title: i.title,
    price: i.price,
    quantity: i.quantity,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ orderId: order.id });
}
