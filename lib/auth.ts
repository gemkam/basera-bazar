import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'bazarify-admin-secret-2026-change-me';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function signAdminToken(email: string) {
  return await new SignJWT({ email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifyAdminToken(
  token: string
): Promise<{ email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    // Only accept tokens explicitly issued as admin sessions. Other tokens
    // signed with the same secret (e.g. checkout email tokens) must not pass.
    if (payload.role !== 'admin' || typeof payload.email !== 'string') {
      return null;
    }
    return payload as { email: string; role: string };
  } catch {
    return null;
  }
}
