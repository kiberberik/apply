import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const authorization = headersList.get('Authorization');
    const expectedToken = process.env.NEXT_PUBLIC_APP_WEBHOOK_TOKEN;

    // Проверка токена
    if (!authorization || authorization !== expectedToken) {
      return NextResponse.json(
        {
          status: 'Error',
          errorText: 'Unauthorized',
          data: '',
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Здесь должна быть логика обработки уведомления
    console.log('Received webhook notification:', {
      body,
      headers: request.headers,
      method: request.method,
      url: request.url,
    });

    return NextResponse.json({
      status: 'Ok',
      errorText: '',
      data: '',
    });
  } catch (error) {
    console.error('Webhook notification error:', error);
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
