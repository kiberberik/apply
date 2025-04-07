import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';

export async function POST(req: NextRequest) {
  const locale = req.headers.get('accept-language')?.split(',')[0] || 'ru';
  const t = await getTranslations({ locale, namespace: 'auth' });
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session-token');

    if (sessionToken) {
      await prisma.session.delete({
        where: {
          sessionToken: sessionToken.value,
        },
      });
    }

    const response = NextResponse.json({
      message: t('successLogout'),
    });

    response.cookies.delete('session-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: t('serverError') }, { status: 500 });
  }
}
