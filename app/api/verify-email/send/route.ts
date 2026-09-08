import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import bcrypt from 'bcryptjs';
import { getServiceSupabase } from '@/lib/supabase';
import { sendEmail, verificationEmailHtml } from '@/lib/email';
import { normalizeEmail } from '@/lib/verification';

const CODE_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail } = await req.json();

    if (!rawEmail || !EMAIL_RE.test(rawEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const email = normalizeEmail(rawEmail);
    const supabase = getServiceSupabase();

    // Cooldown: block resends within RESEND_COOLDOWN_SECONDS of the last one.
    const { data: existing } = await supabase
      .from('email_verifications')
      .select('created_at')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.created_at) {
      const ageMs = Date.now() - new Date(existing.created_at).getTime();
      const waitMs = RESEND_COOLDOWN_SECONDS * 1000 - ageMs;
      if (waitMs > 0) {
        return NextResponse.json(
          { error: `Please wait ${Math.ceil(waitMs / 1000)}s before requesting a new code.` },
          { status: 429 }
        );
      }
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString();

    // One active code per email: clear any previous ones first.
    await supabase.from('email_verifications').delete().eq('email', email);

    const { error: insertError } = await supabase
      .from('email_verifications')
      .insert({ email, code_hash: codeHash, expires_at: expiresAt, attempts: 0 });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const sent = await sendEmail({
      to: email,
      subject: `Your Bazarify verification code: ${code}`,
      html: verificationEmailHtml(code),
    });

    if (!sent.ok) {
      // Roll back the stored code so a stale one can't linger after a send failure.
      await supabase.from('email_verifications').delete().eq('email', email);
      return NextResponse.json({ error: sent.error }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('verify-email/send error:', err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
