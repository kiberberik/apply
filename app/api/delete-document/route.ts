import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';

/**
 * Обработчик удаления документов
 *
 * Этот маршрут удаляет файл документа из файловой системы и обновляет ссылки в соответствующей модели
 */
export async function DELETE(request: NextRequest) {
  try {
    const { fileUrl, applicantId, representativeId, role } = await request.json();

    if (!role) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!fileUrl) {
      return NextResponse.json({ error: 'URL файла не указан' }, { status: 400 });
    }

    console.log('Запрос на удаление файла:', { fileUrl, applicantId, representativeId });

    // Извлекаем имя файла из URL
    const fileName = fileUrl.split('/').pop();
    if (!fileName) {
      return NextResponse.json({ error: 'Некорректный URL файла' }, { status: 400 });
    }

    // Полный путь к файлу в файловой системе
    const filePath = join(process.cwd(), 'public', 'upload-docs', fileName);

    console.log('Путь к файлу для удаления:', filePath);

    // Проверяем существование файла перед удалением
    const fileExists = existsSync(filePath);
    console.log('Файл существует:', fileExists);

    if (fileExists) {
      try {
        // Удаляем файл
        await unlink(filePath);
        console.log('Файл успешно удален');
      } catch (error) {
        console.error('Ошибка при удалении файла:', error);
        // Если произошла ошибка при удалении файла, возвращаем ошибку
        return NextResponse.json(
          {
            error: 'Ошибка при удалении файла',
            details: (error as Error).message,
          },
          { status: 500 },
        );
      }
    } else {
      console.log('Файл не найден, продолжаем удаление ссылки из БД');
    }

    let documentUpdated = false;

    // Удаляем ссылку из базы данных, в зависимости от типа (applicant или representative)
    if (applicantId) {
      const applicant = await prisma.applicant.findUnique({
        where: { id: applicantId },
        select: { documentFileLinks: true },
      });

      console.log('Найденный applicant:', applicant);

      if (applicant?.documentFileLinks) {
        try {
          let links: string[] = [];

          try {
            links = JSON.parse(applicant.documentFileLinks);
            if (!Array.isArray(links)) {
              links = [];
            }
          } catch (e) {
            console.error('Ошибка при парсинге documentFileLinks:', e);
            links = [];
          }

          console.log('Текущие ссылки applicant:', links);

          // Фильтруем массив, оставляя все ссылки, кроме той, что нужно удалить
          const newLinks = links.filter((link) => link !== fileUrl);
          console.log('Новые ссылки applicant после фильтрации:', newLinks);

          // Обновляем только если массив изменился (ссылка была найдена и удалена)
          if (newLinks.length !== links.length) {
            // Важно: сохраняем пустой массив в виде JSON-строки "[]", а не null
            const newLinksJson = newLinks.length > 0 ? JSON.stringify(newLinks) : '[]';

            await prisma.applicant.update({
              where: { id: applicantId },
              data: { documentFileLinks: newLinksJson },
            });

            console.log('Ссылки applicant обновлены в БД:', newLinksJson);
            documentUpdated = true;
          } else {
            console.log('Ссылка не найдена в documentFileLinks applicant');
          }
        } catch (error) {
          console.error('Ошибка при обновлении ссылок applicant:', error);
          return NextResponse.json(
            {
              error: 'Ошибка при обновлении ссылок',
              details: (error as Error).message,
            },
            { status: 500 },
          );
        }
      }
    } else if (representativeId) {
      const representative = await prisma.representative.findUnique({
        where: { id: representativeId },
        select: {
          documentFileLinks: true,
          representativeDocumentFileLinks: true,
        },
      });

      console.log('Найденный representative:', representative);

      // Сначала проверяем documentFileLinks
      if (representative?.documentFileLinks) {
        try {
          let links: string[] = [];

          try {
            links = JSON.parse(representative.documentFileLinks);
            if (!Array.isArray(links)) {
              links = [];
            }
          } catch (e) {
            console.error('Ошибка при парсинге documentFileLinks representative:', e);
            links = [];
          }

          console.log('Текущие ссылки documentFileLinks representative:', links);

          // Фильтруем массив, оставляя все ссылки, кроме той, что нужно удалить
          const newLinks = links.filter((link) => link !== fileUrl);
          console.log('Новые ссылки documentFileLinks после фильтрации:', newLinks);

          // Обновляем только если массив изменился (ссылка была найдена и удалена)
          if (newLinks.length !== links.length) {
            // Важно: сохраняем пустой массив в виде JSON-строки "[]", а не null
            const newLinksJson = newLinks.length > 0 ? JSON.stringify(newLinks) : '[]';

            await prisma.representative.update({
              where: { id: representativeId },
              data: { documentFileLinks: newLinksJson },
            });

            console.log('Ссылки documentFileLinks representative обновлены в БД:', newLinksJson);
            documentUpdated = true;
          } else {
            console.log('Ссылка не найдена в documentFileLinks representative');
          }
        } catch (error) {
          console.error('Ошибка при обновлении documentFileLinks представителя:', error);
          return NextResponse.json(
            {
              error: 'Ошибка при обновлении ссылок',
              details: (error as Error).message,
            },
            { status: 500 },
          );
        }
      }

      // Если ссылка не была найдена в documentFileLinks, проверяем representativeDocumentFileLinks
      if (!documentUpdated && representative?.representativeDocumentFileLinks) {
        try {
          let links: string[] = [];

          try {
            links = JSON.parse(representative.representativeDocumentFileLinks);
            if (!Array.isArray(links)) {
              links = [];
            }
          } catch (e) {
            console.error('Ошибка при парсинге representativeDocumentFileLinks:', e);
            links = [];
          }

          console.log('Текущие ссылки representativeDocumentFileLinks:', links);

          // Фильтруем массив, оставляя все ссылки, кроме той, что нужно удалить
          const newLinks = links.filter((link) => link !== fileUrl);
          console.log('Новые ссылки representativeDocumentFileLinks после фильтрации:', newLinks);

          // Обновляем только если массив изменился (ссылка была найдена и удалена)
          if (newLinks.length !== links.length) {
            // Важно: сохраняем пустой массив в виде JSON-строки "[]", а не null
            const newLinksJson = newLinks.length > 0 ? JSON.stringify(newLinks) : '[]';

            await prisma.representative.update({
              where: { id: representativeId },
              data: { representativeDocumentFileLinks: newLinksJson },
            });

            console.log('Ссылки representativeDocumentFileLinks обновлены в БД:', newLinksJson);
            documentUpdated = true;
          } else {
            console.log('Ссылка не найдена в representativeDocumentFileLinks');
          }
        } catch (error) {
          console.error('Ошибка при обновлении representativeDocumentFileLinks:', error);
          return NextResponse.json(
            {
              error: 'Ошибка при обновлении ссылок',
              details: (error as Error).message,
            },
            { status: 500 },
          );
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Не указан ID applicant или representative' },
        { status: 400 },
      );
    }

    if (documentUpdated) {
      return NextResponse.json({ success: true, message: 'Документ успешно удален' });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Документ не найден в базе данных',
        },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
