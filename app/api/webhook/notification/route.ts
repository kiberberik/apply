import { NextResponse } from 'next/server';
// import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';
import { getTranslations } from 'next-intl/server';

export async function POST(request: Request) {
  try {
    // const headersList = await headers();
    // const authorization = headersList.get('Authorization');
    // const expectedToken = process.env.NEXT_PUBLIC_APP_WEBHOOK_TOKEN;

    // Проверка токена
    // if (!authorization || authorization !== expectedToken) {
    //   return NextResponse.json(
    //     {
    //       status: 'Error',
    //       errorText: 'Unauthorized',
    //       data: '',
    //     },
    //     { status: 401 },
    //   );
    // }

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
    const tTrustMeStatus = await getTranslations('TrustMeStatus');
    let statusText = '';
    let newStatusId: ApplicationStatus;
    switch (body.status) {
      case 0:
        statusText = tTrustMeStatus('notSigned');
        newStatusId = 'NEED_SIGNATURE';
        break;
      case 1:
        statusText = tTrustMeStatus('companySigned');
        newStatusId = 'NEED_SIGNATURE';
        break;
      case 2:
        statusText = tTrustMeStatus('clientSigned');
        newStatusId = 'NEED_SIGNATURE';
        break;
      case 3:
        statusText = tTrustMeStatus('fullSigned');
        newStatusId = 'CHECK_DOCS';
        break;
      case 4:
        statusText = tTrustMeStatus('revokedCompany');
        newStatusId = 'RE_PROCESSING';
        break;
      case 5:
        statusText = tTrustMeStatus('companyInitiatedTermination');
        newStatusId = 'NEED_SIGNATURE_TERMINATE_CONTRACT';
        break;
      case 6:
        statusText = tTrustMeStatus('clientInitiatedTermination');
        newStatusId = 'RE_PROCESSING';
        break;
      case 7:
        statusText = tTrustMeStatus('clientRefusedTermination');
        newStatusId = 'CHECK_DOCS';
        break;
      case 8:
        statusText = tTrustMeStatus('terminated');
        newStatusId = 'RE_PROCESSING';
        break;
      case 9:
        statusText = tTrustMeStatus('clientRefusedSignature');
        newStatusId = 'RE_PROCESSING'; // REFUSED_TO_SIGN
        break;
      default:
        statusText = tTrustMeStatus('unknownStatus');
        newStatusId = 'NEED_SIGNATURE';
    }

    // Создаем новый лог
    await prisma.log.create({
      data: {
        applicationId: application.id,
        statusId: newStatusId,
        description: `TrustMe webhook: ${statusText}`,
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
