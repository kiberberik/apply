import { checkServerAccess } from '@/lib/serverAuth';
import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET() {
  const hasAccess = await checkServerAccess(Role.ADMIN);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }
  try {
    const URL = process.env.NEXT_PUBLIC_APP_URL;
    const Token = process.env.NEXT_PUBLIC_APP_WEBHOOK_TOKEN;
    const TrustMeToken = process.env.NEXT_PUBLIC_TRUSTME_API_TOKEN;

    if (!URL || !Token || !TrustMeToken) {
      return NextResponse.json(
        {
          status: 'Error',
          errorText: 'Missing required environment variables',
          data: '',
        },
        { status: 500 },
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_TRUSTME_API_URL}/SetHook`, {
      method: 'POST',
      headers: {
        Authorization: TrustMeToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        URL: URL as string,
        Token: Token as string,
      }),
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      {
        status: 'Error',
        errorText: 'Internal server error',
        data: '',
      },
      { status: 500 },
    );
  }
}
