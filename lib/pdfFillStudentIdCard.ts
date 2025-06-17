// lib/pdfFill.ts
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'; // legacy — совместимость
import fs from 'fs/promises'; // или fetch
import path from 'path';
import fontkit from '@pdf-lib/fontkit';
import { fetchImage } from '@/lib/utils';

pdfjsLib.GlobalWorkerOptions.workerSrc = `pdfjs-dist/build/pdf.worker.js`;

interface PlaceholderMap {
  [key: string]: string | null;
}

export async function fillPdfStudentIdCard(
  templatePath: string,
  data: PlaceholderMap,
): Promise<Uint8Array> {
  const buffer = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(buffer);
  pdfDoc.registerFontkit(fontkit);
  // Загружаем кириллический шрифт Roboto
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf');
  const fontBytes = await fs.readFile(fontPath);
  const font = await pdfDoc.embedFont(fontBytes);

  const pages = pdfDoc.getPages();
  const page = pages[0]; // Работаем с первой страницей

  // Вставляем фото, если оно есть
  if (data.image) {
    try {
      const imageBuffer = await fetchImage(data.image);
      const imagePdf = await PDFDocument.load(imageBuffer);
      const [imagePage] = await pdfDoc.embedPdf(imagePdf);

      // Размеры и позиция для фото
      const imageWidth = 470;
      const imageHeight = 600;
      const imageX = 90;
      const imageY = page.getHeight() - 180 - imageHeight;

      page.drawPage(imagePage, {
        x: imageX,
        y: imageY,
        width: imageWidth,
        height: imageHeight,
      });
    } catch (error) {
      console.error('Error embedding image:', error);
    }
  }

  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;

  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const content = await page.getTextContent();

    for (const item of content.items) {
      if ('str' in item && item.str.includes('{@')) {
        const match = item.str.match(/\{@([\w.]+)\}/);
        if (!match) continue;

        const key = match[1];
        // Пропускаем поле image, так как оно обрабатывается отдельно
        if (key === 'image') continue;

        const value = data[key] || '';

        const transform = item.transform as number[];
        const x = transform[4];
        const y = transform[5];
        const width = item.width || 0; // используем точную ширину текста из PDF

        const pageRef = pages[i];

        // Определяем размер шрифта в зависимости от поля
        const fontSize = key === 'lastname' || key === 'givennames' ? 80 : 30;
        const rectHeight = key === 'lastname' || key === 'givennames' ? 80 : 32;

        // Удаляем старый текст с переменной
        pageRef.drawRectangle({
          x,
          y: y - 8, // центрируем по высоте
          width,
          height: rectHeight,
          color: rgb(1, 1, 1),
          opacity: 1,
        });

        // Рисуем новый текст
        pageRef.drawText(value, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      }
    }
  }

  return await pdfDoc.save();
}
