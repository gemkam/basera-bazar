import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyCheckoutEmailToken, normalizeEmail } from '@/lib/verification';

export async function POST(req: NextRequest) {
  const supabase = getServiceSupabase();
  const body = await req.json();
  const { customer_name, email, phone, address, city, notes, items, verificationToken } = body;

  if (!customer_name || !email || !phone || !address || !city || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Require a valid email-verification token, and make sure it was issued for
  // the exact email being ordered with (no verifying one address then swapping).
  const verified = verificationToken
    ? await verifyCheckoutEmailToken(verificationToken)
    : null;

  if (!verified || verified.email !== normalizeEmail(email)) {
    return NextResponse.json(
      { error: 'Please verify your email address before placing the order.' },
      { status: 403 }
    );
  }

  const total = items.reduce(
    (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
    0
  );

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name,
      email: normalizeEmail(email),
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
