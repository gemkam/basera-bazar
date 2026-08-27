import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const supabase = getServiceSupabase();
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
  }

  const { error } = await supabase.from('subscribers').insert({ email });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This email is already subscribed' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
