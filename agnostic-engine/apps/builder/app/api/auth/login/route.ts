import { NextResponse } from 'next/server';

const AUTH_COOKIE = 'ae_builder_auth';

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get('username') ?? '');
  const password = String(formData.get('password') ?? '');

  const response = NextResponse.redirect(new URL('/builder', request.url));
  if (username.length > 0 && password.length > 0) {
    response.cookies.set(AUTH_COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return response;
}
