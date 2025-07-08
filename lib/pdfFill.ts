// lib/pdfFill.ts
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'; // legacy — совместимость
import fs from 'fs/promises'; // или fetch
import path from 'path';
import fontkit from '@pdf-lib/fontkit';

pdfjsLib.GlobalWorkerOptions.workerSrc = `pdfjs-dist/build/pdf.worker.js`;

interface PlaceholderMap {
  [key: string]: string | null;
}

export async function fillPdfPlaceholders(
  templatePath: string,
  data: PlaceholderMap,
): Promise<Uint8Array> {
  const buffer = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(buffer);
  pdfDoc.registerFontkit(fontkit);
  // Загружаем кириллический шрифт Roboto
  const fontPath = path.join(
    process.cwd(),
    'public',
    'fonts',
    'Montserrat',
    'Montserrat-Regular.ttf',
  );
  const fontBytes = await fs.readFile(fontPath);
  const font = await pdfDoc.embedFont(fontBytes);

  const pages = pdfDoc.getPages();

  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;

  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const content = await page.getTextContent();

    for (const item of content.items) {
      if ('str' in item && item.str.includes('{@')) {
        const match = item.str.match(/\{@([\w.]+)\}/);
        if (!match) continue;

        const key = match[1];
        const value = data[key] || '';

        const transform = item.transform as number[];
        const x = transform[4];
        const y = transform[5];
        // const width = item.width || 0; // используем точную ширину текста из PDF
        // const height = item.height || 0;

        const pageRef = pages[i];

        // Удаляем старый текст с переменной
        // pageRef.drawRectangle({
        //   x,
        //   y: y - 1.7, // центрируем по высоте
        //   width,
        //   height: 8,
        //   color: rgb(1, 1, 1),
        //   opacity: 1,
        // });

        // Рисуем новый текст
        pageRef.drawText(value, {
          x,
          y,
          size: 7.5,
          font,
          color: rgb(0, 0, 0),
        });
      }
    }
  }

  return await pdfDoc.save();
}
