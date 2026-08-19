import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { createSessionToken, SESSION_COOKIE } from '@/lib/auth';

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json().catch(() => ({}));

  const expectedUser = process.env.AUTH_USERNAME ?? '';
  const expectedPass = process.env.AUTH_PASSWORD ?? '';

  const ok =
    typeof username === 'string' &&
    typeof password === 'string' &&
    expectedUser.length > 0 &&
    expectedPass.length > 0 &&
    safeEqual(username, expectedUser) &&
    safeEqual(password, expectedPass);

  if (!ok) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}