import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  const { email, locale } = await request.json();
  const t = await getTranslations({ locale, namespace: 'emailVerification' });

  if (!email) {
    return NextResponse.json({ message: 'Email обязателен' }, { status: 400 });
  }

  const vToken = crypto.randomBytes(32).toString('hex');
  const vTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

  try {
    const isVerified = await prisma.user.findUnique({
      where: { email },
    });

    if (isVerified?.emailVerified)
      return NextResponse.json({ message: 'Email already verified' }, { status: 200 });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: vToken,
        expires: vTokenExpiry,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/verify-email/${vToken}`;

    await sendEmail({
      to: email,
      subject: t('emailSubject'),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${t('emailTitle')}</h2>
          <p>${t('emailDescription')}</p>
          <p>${t('emailInstruction')}</p>
          <p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
              ${t('confirmationButton')}
            </a>
          </p>
          <p>${t('validityPeriod')}</p>
          <p>${t('ignoreMessage')}</p>
        </div>
      `,
    });

    return NextResponse.json({ message: 'Токен отправлен на email' }, { status: 200 });
  } catch (error) {
    console.error('Ошибка при отправке email:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}
