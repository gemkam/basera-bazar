import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServiceSupabase } from '@/lib/supabase';
import { signAdminToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { data: admin } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single();

  if (!admin) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signAdminToken(admin.email);
  const res = NextResponse.json({ success: true });
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}
