import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

export async function POST(request: Request) {
  const { token, locale = 'ru' } = await request.json();
  const t = await getTranslations({ locale, namespace: 'emailVerification' });

  try {
    if (!token) {
      return NextResponse.json({ error: t('invalidToken') }, { status: 400 });
    }

    const vToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    const user = await prisma.user.findUnique({
      where: { email: vToken?.identifier },
    });

    if (!user) {
      return NextResponse.json({ error: t('userNotFound') }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' }, { status: 200 });
    }

    if (!vToken) {
      return NextResponse.json({ error: t('invalidToken') }, { status: 400 });
    } else if (vToken && vToken.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } }); // Удаляем истекший токен
      return NextResponse.json({ error: t('invalidToken') }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: vToken.identifier },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json(
      {
        message: 'Email verified',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          emailVerified: updatedUser.emailVerified,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Ошибка при верификации email:', error);
    return NextResponse.json({ error: t('error') }, { status: 500 });
  }
}
