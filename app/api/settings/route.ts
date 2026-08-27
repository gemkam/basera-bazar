import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase.from('site_settings').select('key, value');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const settings: Record<string, string> = {};
  for (const row of data || []) settings[row.key] = row.value;
  return NextResponse.json({ settings });
}
