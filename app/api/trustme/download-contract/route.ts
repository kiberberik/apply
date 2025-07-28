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

    const trustmeApiUrl = process.env.NEXT_PUBLIC_TRUSTME_API_URL;
    const trustmeApiToken = process.env.NEXT_PUBLIC_TRUSTME_API_TOKEN;
    if (!trustmeApiUrl || !trustmeApiToken) {
      return NextResponse.json({ error: 'TrustMe API config missing' }, { status: 500 });
    }

    const downloadUrl = `${trustmeApiUrl}/doc/DownloadContractFile/${documentId}`;
    const trustmeRes = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${trustmeApiToken}`,
      },
    });

    if (!trustmeRes.ok) {
      return NextResponse.json(
        { error: 'Ошибка при скачивании контракта из TrustMe' },
        { status: 500 },
      );
    }

    const arrayBuffer = await trustmeRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Генерируем имя файла
    const fileName = `contract_${documentId}.pdf`;
    const contractsDir = path.join(process.cwd(), 'private', 'contracts');
    const filePath = path.join(contractsDir, fileName);

    // Убедимся, что директория существует
    await fs.mkdir(contractsDir, { recursive: true });
    // Сохраняем файл
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ success: true, filePath: `/private/contracts/${fileName}` });
  } catch (error) {
    console.error('Ошибка при скачивании и сохранении контракта:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
