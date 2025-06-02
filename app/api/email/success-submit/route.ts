import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getTranslations } from 'next-intl/server';
import { checkServerAccess } from '@/lib/serverAuth';
import { Role } from '@prisma/client';

export async function POST(request: Request) {
  const { email, locale, applicant, consultant } = await request.json();
  const t = await getTranslations({ locale, namespace: 'EmailSubmit' });
  const c = await getTranslations({ locale, namespace: 'Common' });
  const hasAccess = await checkServerAccess(Role.USER);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }
  try {
    // Отправляем email
    await sendEmail({
      to: email,
      subject: t('subject'),
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
                    <h1 style="font-size: 24px; margin: 0; padding-bottom: 10px;">${t('greeting', {
                      applicant,
                    })}!</h1>
                    <p style="font-size: 16px; margin: 0; padding-bottom: 10px;">${t(
                      'description',
                      {
                        consultant,
                      },
                    )}</p>
                    <p style="font-size: 16px; margin: 0; padding-bottom: 10px;">${t('instruction')}</p>
                    <p style="font-size: 16px; margin: 0; padding-bottom: 10px;">${t('footer')}</p>
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

    return NextResponse.json({
      message: c('successMessage'),
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: c('error') }, { status: 500 });
  }
}
