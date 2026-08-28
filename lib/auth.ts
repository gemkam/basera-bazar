import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'basera-bazaar-admin-secret-2026-change-me';
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
    return payload as { email: string; role: string };
  } catch {
    return null;
  }
}
