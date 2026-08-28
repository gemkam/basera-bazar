import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyAdminToken } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value;
  const payload = token ? await verifyAdminToken(token) : null;

  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Both current and new password are required' }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { data: admin } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', payload.email)
    .single();

  if (!admin) {
    return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
  }

  const valid = await bcrypt.compare(currentPassword, admin.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  const { error } = await supabase
    .from('admin_users')
    .update({ password_hash: newHash })
    .eq('email', payload.email);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
