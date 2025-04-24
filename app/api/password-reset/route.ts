import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';
import { getTranslations } from 'next-intl/server';

export async function POST(request: Request) {
  const { email, locale } = await request.json();
  const t = await getTranslations({ locale, namespace: 'passwordReset' });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: t('notFound') }, { status: 404 });
    }

    // Создаем токен для сброса пароля
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

    // Сохраняем токен в базе
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: resetToken,
        expires: resetTokenExpiry,
      },
    });

    // console.log("Locale:", locale);
    // console.log("APP_URL:", process.env.NEXT_PUBLIC_APP_URL);
    // console.log("Reset Token:", resetToken);
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/reset-password/${resetToken}`;
    // console.log("Reset URL:", resetUrl);

    // Отправляем email
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
              ${t('resetButton')}
            </a>
          </p>
          <p>${t('validityPeriod')}</p>
          <p>${t('ignoreMessage')}</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: t('successMessage'),
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: t('error') }, { status: 500 });
  }
}
