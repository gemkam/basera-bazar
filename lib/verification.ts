import { SignJWT, jwtVerify } from 'jose';

// Reuses the same JWT_SECRET as the admin auth. The `purpose` claim keeps
// checkout tokens strictly separate from admin session tokens, and the admin
// verifier (lib/auth.ts) additionally requires role === 'admin', so a checkout
// token can never be used to reach the admin area.
const JWT_SECRET = process.env.JWT_SECRET || 'bazarify-admin-secret-2026-change-me';
const secretKey = new TextEncoder().encode(JWT_SECRET);

const PURPOSE = 'checkout_email';

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// Issued only after a buyer proves control of their email via the OTP code.
// Short-lived: the buyer is expected to place the order right after verifying.
export async function signCheckoutEmailToken(email: string) {
  return await new SignJWT({ email: normalizeEmail(email), purpose: PURPOSE })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(secretKey);
}

export async function verifyCheckoutEmailToken(
  token: string
): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (payload.purpose !== PURPOSE || typeof payload.email !== 'string') {
      return null;
    }
    return { email: payload.email };
  } catch {
    return null;
  }
}
