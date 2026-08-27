import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function signAdminToken(email: string) {
  return jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): { email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { email: string; role: string };
  } catch {
    return null;
  }
}
