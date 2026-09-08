import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServiceSupabase } from '@/lib/supabase';
import { signCheckoutEmailToken, normalizeEmail } from '@/lib/verification';

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail, code } = await req.json();

    if (!rawEmail || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const email = normalizeEmail(rawEmail);
    const supabase = getServiceSupabase();

    const { data: record } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!record) {
      return NextResponse.json(
        { error: 'No code found. Please request a new one.' },
        { status: 400 }
      );
    }

    if (new Date(record.expires_at).getTime() < Date.now()) {
      await supabase.from('email_verifications').delete().eq('id', record.id);
      return NextResponse.json(
        { error: 'This code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      await supabase.from('email_verifications').delete().eq('id', record.id);
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    const valid = await bcrypt.compare(String(code), record.code_hash);

    if (!valid) {
      await supabase
        .from('email_verifications')
        .update({ attempts: record.attempts + 1 })
        .eq('id', record.id);
      const left = MAX_ATTEMPTS - (record.attempts + 1);
      return NextResponse.json(
        {
          error:
            left > 0
              ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.`
              : 'Incorrect code. Please request a new one.',
        },
        { status: 400 }
      );
    }

    // Correct code: consume it and hand back a short-lived proof token.
    await supabase.from('email_verifications').delete().eq('id', record.id);
    const token = await signCheckoutEmailToken(email);

    return NextResponse.json({ success: true, token });
  } catch (err) {
    console.error('verify-email/confirm error:', err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
