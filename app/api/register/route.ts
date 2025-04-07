import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getTranslations } from 'next-intl/server';

export async function POST(request: Request) {
  try {
    const { fullname, email, password, locale: requestLocale } = await request.json();
    const locale = requestLocale || 'ru';

    const t = await getTranslations({ namespace: 'auth', locale });

    if (!email || !password) {
      return NextResponse.json({ error: t('emailPasswordRequired') }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: t('userExists') }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: fullname,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        image: true,
        name: true,
      },
    });

    return NextResponse.json({
      message: t('userRegistrationSuccess'),
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);

    const { locale: requestLocale } = await request.json().catch(() => ({ locale: 'ru' }));
    const locale = requestLocale || 'ru';
    const t = await getTranslations({ namespace: 'auth', locale });

    return NextResponse.json({ error: t('userRegistrationError') }, { status: 500 });
  }
}
