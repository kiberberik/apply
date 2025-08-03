import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('documentId');
    if (!documentId) {
      return NextResponse.json({ error: 'documentId is required' }, { status: 400 });
    }

    console.log('Downloading contract for documentId:', documentId);

    const trustmeApiUrl = process.env.NEXT_PUBLIC_TRUSTME_API_URL;
    const trustmeApiToken = process.env.NEXT_PUBLIC_TRUSTME_API_TOKEN;

    console.log('TrustMe API URL:', trustmeApiUrl);
    console.log('TrustMe API Token exists:', !!trustmeApiToken);

    if (!trustmeApiUrl || !trustmeApiToken) {
      console.error('TrustMe API config missing');
      return NextResponse.json({ error: 'TrustMe API config missing' }, { status: 500 });
    }

    const downloadUrl = `${trustmeApiUrl}/doc/DownloadContractFile/${documentId}`;
    console.log('Download URL:', downloadUrl);

    const headers = {
      Authorization: `Bearer ${trustmeApiToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, application/pdf, */*',
    };

    console.log('Request headers:', {
      Authorization: `Bearer ${trustmeApiToken.substring(0, 10)}...`,
      'Content-Type': headers['Content-Type'],
      Accept: headers['Accept'],
    });

    const trustmeRes = await fetch(downloadUrl, {
      method: 'GET',
      headers,
    });

    console.log('TrustMe response status:', trustmeRes.status);
    console.log('TrustMe response headers:', Object.fromEntries(trustmeRes.headers.entries()));

    if (!trustmeRes.ok) {
      const errorText = await trustmeRes.text();
      console.error('TrustMe API error response:', errorText);
      return NextResponse.json(
        {
          error: 'Ошибка при скачивании контракта из TrustMe',
          details: {
            status: trustmeRes.status,
            statusText: trustmeRes.statusText,
            response: errorText,
          },
        },
        { status: trustmeRes.status },
      );
    }

    const arrayBuffer = await trustmeRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Downloaded file size:', buffer.length, 'bytes');

    // Генерируем имя файла
    const fileName = `contract_${documentId}.pdf`;
    const contractsDir = path.join(process.cwd(), 'private', 'contracts');
    const filePath = path.join(contractsDir, fileName);

    console.log('Saving file to:', filePath);

    // Убедимся, что директория существует
    await fs.mkdir(contractsDir, { recursive: true });
    // Сохраняем файл
    await fs.writeFile(filePath, buffer);

    console.log('File saved successfully');

    return NextResponse.json({ success: true, filePath: `/private/contracts/${fileName}` });
  } catch (error) {
    console.error('Ошибка при скачивании и сохранении контракта:', error);
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
