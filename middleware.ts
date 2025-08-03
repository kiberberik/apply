import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // ✅ Поддерживается в Edge Runtime
import { routing } from './i18n/routing';

export const locales = routing.locales;
export const defaultLocale = 'ru';

const publicRoutes = ['/auth', '/reset-password', '/verify-email'];
const publicApiPaths = [
  '/api/login',
  '/api/register',
  '/api/password-reset',
  '/api/password-reset/confirm',
  '/api/logout',
  '/api/verification-email/send',
  '/api/verification-email/verify',
  '/api/webhook/notification',
  '/api/trustme/download-contract',
];

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// 🔹 Функция для валидации JWT без использования Node.js crypto
async function verifyJWT(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET); // 👈 Кодируем секрет в Uint8Array
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    throw error;
    // console.log(error);

    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ✅ Проверяем API запросы
  if (pathname.startsWith('/api/')) {
    if (publicApiPaths.includes(pathname)) {
      return NextResponse.next();
    }

    const sessionToken = request.cookies.get('session-token');

    if (!sessionToken) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
    }

    const decoded = await verifyJWT(sessionToken.value);

    if (!decoded) {
      return NextResponse.json({ error: 'Сессия истекла или недействительна' }, { status: 401 });
    }

    return NextResponse.next();
  }

  // ✅ Проверяем публичные маршруты
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
  if (publicRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
    return intlMiddleware(request);
  }

  // ✅ Проверяем авторизацию на защищённых страницах
  const sessionToken = request.cookies.get('session-token');
  const referer = request.headers.get('referer');

  if (!sessionToken && !referer?.includes('/auth')) {
    return NextResponse.redirect(new URL(`/${defaultLocale}/auth`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)', '/api/:path*'],
};
