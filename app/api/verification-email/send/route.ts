import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  const { email, locale } = await request.json();
  const t = await getTranslations({ locale, namespace: 'emailVerification' });
  const c = await getTranslations({ locale, namespace: 'Common' });

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
        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #eef2fa; height: 800px;">
          <tr>
            <td align="center" valign="top" style="padding: 40px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="width: 600px; background-color: #fbfbfb; border-radius: 12px;">
                <tr>
                  <td style="background-color: #262626; padding: 20px; border-top-left-radius: 12px; border-top-right-radius: 12px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                      <tr>
                        <td style="text-align: left;">
                          <a href="https://apply.mnu.kz" style="text-decoration: none; cursor: pointer;">
                            <h1 style="color: white; font-size: 20px; margin: 0;">Apply</h1>
                          </a>
                        </td>
                        <td style="text-align: right;">
                          <img src="https://spaces.mnu.kz/wp-content/uploads/2024/12/logo_ff.png" alt="MNU Logo" style="width: 100px; height: 33px;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <h1 style="font-size: 24px; margin: 0; padding-bottom: 10px;">${t('emailTitle')}</h1>
                    <p style="font-size: 16px; margin: 0; padding-bottom: 10px;">${t('emailDescription')}</p>
                    <p style="font-size: 16px; margin: 0; padding-bottom: 10px;">${t('emailInstruction')}</p>
                    <p style="margin: 0; padding-bottom: 10px;">
                      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        ${t('confirmationButton')}
                      </a>
                    </p>
                    <p style="font-size: 16px; margin: 0; padding-bottom: 10px;">${t('validityPeriod')}</p>
                    <p style="font-size: 16px; margin: 0; padding-bottom: 10px;">${t('ignoreMessage')}</p>
                    <div style="width: 100%; border-top: solid 1px #EBEBEB; padding-top: 10px; margin-top: 10px;">
                      <p style="font-size: 12px; font-weight: 300; color: #666666; margin: 0;">
                        ${c('emailDescription')} <span style="font-weight: 700;">apply@mnu.kz</span>
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `,
    });

    return NextResponse.json({ message: 'Токен отправлен на email' }, { status: 200 });
  } catch (error) {
    console.error('Ошибка при отправке email:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}
