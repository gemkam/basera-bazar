import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function PUT(req: NextRequest) {
  const supabase = getServiceSupabase();
  const body = await req.json();
  const { key, value } = body;

  if (!key || value === undefined) {
    return NextResponse.json({ error: 'key and value are required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value: String(value), updated_at: new Date().toISOString() });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
