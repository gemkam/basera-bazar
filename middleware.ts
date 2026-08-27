import { NextResponse } from 'next/server';

// Admin login requirement removed — /admin is now open.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
