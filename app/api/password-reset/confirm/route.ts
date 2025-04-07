import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

export async function POST(request: Request) {
  const { token, password, locale = 'ru' } = await request.json();
  const t = await getTranslations({ locale, namespace: 'passwordReset' });

  try {
    const resetToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: { gt: new Date() },
      },
    });

    if (!resetToken) {
      return NextResponse.json({ error: t('invalidToken') }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: resetToken.identifier },
      data: { password: hashedPassword },
    });

    const tokenToDelete = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (tokenToDelete) {
      await prisma.verificationToken.delete({
        where: { token },
      });
    }

    return NextResponse.json({
      message: t('passwordChanged'),
    });
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return NextResponse.json({ error: t('error') }, { status: 500 });
  }
}
