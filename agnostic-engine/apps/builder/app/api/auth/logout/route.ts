import { NextResponse } from 'next/server';

const AUTH_COOKIE = 'ae_builder_auth';

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
