import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

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
    console.log('Received webhook notification:', {
      body,
      headers: request.headers,
      method: request.method,
      url: request.url,
    });

    // Ищем заявку по trustMeId или trustMeUrl
    const application = await prisma.application.findFirst({
      where: {
        OR: [{ trustMeId: body.contract_id }, { trustMeUrl: body.contract_url }],
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          status: 'Error',
          errorText: 'Application not found',
          data: '',
        },
        { status: 404 },
      );
    }

    // Определяем новый статус на основе status из body
    let newStatusId: ApplicationStatus;
    switch (body.status) {
      case 0:
        newStatusId = 'NEED_SIGNATURE';
        break;
      case 1:
        newStatusId = 'NEED_SIGNATURE';
        break;
      case 2:
        newStatusId = 'NEED_SIGNATURE';
        break;
      case 3:
        newStatusId = 'CHECK_DOCS';
        break;
      case 4:
        newStatusId = 'RE_PROCESSING';
        break;
      case 5:
        newStatusId = 'NEED_SIGNATURE_TERMINATE_CONTRACT';
        break;
      case 6:
        newStatusId = 'RE_PROCESSING';
        break;
      case 7:
        newStatusId = 'CHECK_DOCS';
        break;
      case 8:
        newStatusId = 'RE_PROCESSING';
        break;
      case 9:
        newStatusId = 'RE_PROCESSING';
        break;
      default:
        newStatusId = 'NEED_SIGNATURE';
    }

    // Создаем новый лог
    await prisma.log.create({
      data: {
        applicationId: application.id,
        statusId: newStatusId,
        description: `TrustMe webhook: status ${body.status}`,
      },
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
