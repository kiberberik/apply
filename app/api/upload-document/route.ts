import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';

/**
 * Обработчик загрузки документов
 *
 * Этот маршрут принимает файлы документов, сохраняет их в файловой системе
 * и обновляет ссылки в соответствующей модели
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const applicantId = formData.get('applicantId') as string;
    const representativeId = formData.get('representativeId') as string;
    const activeTab = formData.get('activeTab') as string;

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    // Создаем уникальное имя файла
    const buffer = await file.arrayBuffer();
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;

    // Создаем папку, если она не существует
    const uploadDir = join(process.cwd(), 'public', 'upload-docs');

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    try {
      // Сохраняем файл
      await writeFile(join(uploadDir, uniqueFilename), Buffer.from(buffer));

      // Получаем информацию о файле
      const fileSize = Buffer.from(buffer).length;
      const fileType = file.type;
      const fileUrl = `/upload-docs/${uniqueFilename}`;

      // Обновляем ссылки на документы в соответствующей модели
      if (activeTab === 'applicant' && applicantId) {
        // Получаем текущие ссылки на документы
        const applicant = await prisma.applicant.findUnique({
          where: { id: applicantId },
          select: { documentFileLinks: true },
        });

        // Добавляем новую ссылку к существующим или создаем новый массив
        let links = [];
        if (applicant?.documentFileLinks) {
          try {
            links = JSON.parse(applicant.documentFileLinks);
            if (!Array.isArray(links)) links = [];
          } catch {
            links = [];
          }
        }
        links.push(fileUrl);

        // Обновляем запись в базе данных
        await prisma.applicant.update({
          where: { id: applicantId },
          data: { documentFileLinks: JSON.stringify(links) },
        });
      } else if (activeTab === 'representative' && representativeId) {
        // Получаем текущие ссылки на документы
        const representative = await prisma.representative.findUnique({
          where: { id: representativeId },
          select: { documentFileLinks: true },
        });

        // Добавляем новую ссылку к существующим или создаем новый массив
        let links = [];
        if (representative?.documentFileLinks) {
          try {
            links = JSON.parse(representative.documentFileLinks);
            if (!Array.isArray(links)) links = [];
          } catch {
            links = [];
          }
        }
        links.push(fileUrl);

        // Обновляем запись в базе данных
        await prisma.representative.update({
          where: { id: representativeId },
          data: { documentFileLinks: JSON.stringify(links) },
        });
      } else if (activeTab === 'representative-document' && representativeId) {
        // Получаем текущие ссылки на документы
        const representative = await prisma.representative.findUnique({
          where: { id: representativeId },
          select: { representativeDocumentFileLinks: true },
        });

        // Добавляем новую ссылку к существующим или создаем новый массив
        let links = [];
        if (representative?.representativeDocumentFileLinks) {
          try {
            links = JSON.parse(representative.representativeDocumentFileLinks);
            if (!Array.isArray(links)) links = [];
          } catch {
            links = [];
          }
        }
        links.push(fileUrl);

        // Обновляем запись в базе данных
        await prisma.representative.update({
          where: { id: representativeId },
          data: { representativeDocumentFileLinks: JSON.stringify(links) },
        });
      }

      return NextResponse.json({
        name: file.name,
        size: fileSize,
        type: fileType,
        url: fileUrl,
      });
    } catch (error) {
      console.error('Ошибка при сохранении файла:', error);
      return NextResponse.json({ error: 'Ошибка при сохранении файла' }, { status: 500 });
    }
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
