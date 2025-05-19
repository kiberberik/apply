import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const applicationId = formData.get('applicationId') as string;
    const documentCode = formData.get('documentCode') as string;
    const userId = formData.get('userId') as string;
    const uploadedById = formData.get('uploadedById') as string;
    const role = formData.get('role') as string;

    if (!role) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!applicationId || !documentCode || !userId) {
      return NextResponse.json(
        {
          error: 'Required fields missing: applicationId, documentCode, userId',
        },
        { status: 400 },
      );
    }

    // Создаем директорию, если она не существует
    const uploadDir = path.join(process.cwd(), 'public', 'upload-docs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Получаем расширение файла и приводим его к нижнему регистру
    const originalExt = path.extname(file.name).toLowerCase();
    const validExts = ['.pdf', '.jpg', '.jpeg', '.png'];

    if (!validExts.includes(originalExt)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Allowed types: .pdf, .jpg, .jpeg, .png',
        },
        { status: 400 },
      );
    }

    // Генерируем уникальное имя файла
    const uniqueFilename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    // Сохраняем файл
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, fileBuffer);

    // Формируем ссылку на файл
    const fileUrl = `/upload-docs/${uniqueFilename}`;

    // Создаем запись в базе данных
    const document = await prisma.document.create({
      data: {
        applicationId,
        userId,
        uploadedById: uploadedById || null,
        code: documentCode,
        link: fileUrl,
        name: file.name,
      },
    });

    return NextResponse.json({ url: fileUrl, document });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
