import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '@/lib/prisma';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf'];

export async function POST(request: Request) {
  try {
    // const session = await getServerSession(authOptions);

    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const applicationId = formData.get('applicationId') as string;
    const userId = formData.get('userId') as string;
    const uploadedById = formData.get('uploadedById') as string;

    if (!file || !applicationId || !userId || !uploadedById) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Проверка типа файла
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF files are allowed' },
        { status: 400 },
      );
    }

    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 10MB' },
        { status: 400 },
      );
    }

    // Создаем директорию для контрактов, если она не существует
    const contractsDir = path.join(process.cwd(), 'private', 'contracts');
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const uniqueFilename = `${applicationId}-${timestamp}.pdf`;
    const filePath = path.join(contractsDir, uniqueFilename);

    // Сохраняем файл
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, fileBuffer);

    // Получаем информацию о заявке
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { contractFileLinks: true },
    });

    // Обновляем ссылки на контракты
    let contractLinks = [];
    if (application?.contractFileLinks) {
      try {
        contractLinks = JSON.parse(application.contractFileLinks);
        if (!Array.isArray(contractLinks)) contractLinks = [];
      } catch {
        contractLinks = [];
      }
    }
    contractLinks.push(uniqueFilename);

    // Обновляем запись в базе данных
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        contractFileLinks: JSON.stringify(contractLinks),
        contractSignType: 'OFFLINE',
      },
    });

    return NextResponse.json({
      success: true,
      filename: uniqueFilename,
    });
  } catch (error) {
    console.error('Error uploading contract:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
