import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '@/lib/prisma';
import { checkServerAccess } from '@/lib/serverAuth';
import { Role } from '@prisma/client';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf'];

export async function POST(request: Request) {
  const hasAccess = await checkServerAccess(Role.CONSULTANT);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }

  try {
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
    const terminationsDir = path.join(process.cwd(), 'private', 'terminations');
    if (!fs.existsSync(terminationsDir)) {
      fs.mkdirSync(terminationsDir, { recursive: true });
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const uniqueFilename = `${applicationId}-${timestamp}.pdf`;
    const filePath = path.join(terminationsDir, uniqueFilename);

    // Сохраняем файл
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, fileBuffer);

    // Получаем информацию о заявке
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { terminateContractFileLinks: true },
    });

    // Обновляем ссылки на расторжение контракта
    let terminateContractFileLinks = [];
    if (application?.terminateContractFileLinks) {
      try {
        terminateContractFileLinks = JSON.parse(application.terminateContractFileLinks);
        if (!Array.isArray(terminateContractFileLinks)) terminateContractFileLinks = [];
      } catch {
        terminateContractFileLinks = [];
      }
    }
    terminateContractFileLinks.push(uniqueFilename);

    // Обновляем запись в базе данных
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        terminateContractFileLinks: JSON.stringify(terminateContractFileLinks),
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
