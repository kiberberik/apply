import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

const JWT_SECRET = process.env.JWT_SECRET || '123654789';

export async function POST(request: Request) {
  try {
    const { email, password, locale: requestLocale } = await request.json();

    const locale = requestLocale || 'ru';
    const t = await getTranslations({ namespace: 'auth', locale });

    if (!email || !password) {
      return NextResponse.json({ error: t('emailPasswordRequired') }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: t('invalidCredentials') }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: t('invalidCredentials') }, { status: 401 });
    }

    const session = await prisma.session.create({
      data: {
        sessionToken: sign({ userId: user.id }, JWT_SECRET),
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      message: t('loginSuccess'),
      user: userWithoutPassword,
    });

    response.cookies.set({
      name: 'session-token',
      value: session.sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: session.expires,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    const { locale: requestLocale } = await request.json().catch(() => ({ locale: 'ru' }));
    const locale = requestLocale || 'ru';
    const t = await getTranslations({ namespace: 'auth', locale });

    return NextResponse.json({ error: t('loginError') }, { status: 500 });
  }
}
