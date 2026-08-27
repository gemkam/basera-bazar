import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const supabase = getServiceSupabase();
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filename, buffer, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filename);

  return NextResponse.json({ url: publicUrlData.publicUrl });
}
