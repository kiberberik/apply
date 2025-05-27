import { PDFDocument } from 'pdf-lib';
import { useState } from 'react';

interface PDFGeneratorProps {
  images: string[];
}

// Размеры A4 в пунктах (1 пункт = 1/72 дюйма)
const A4_WIDTH = 595.28; // 210 мм
const A4_HEIGHT = 841.89; // 297 мм
const PAGE_PADDING = 20; // Отступы по краям страницы

export const PDFGenerator = ({ images }: PDFGeneratorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const generatePDF = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    if (images.length === 0) return;

    const pdfDoc = await PDFDocument.create();

    for (const imageUrl of images) {
      try {
        const url = imageUrl.startsWith('pdf:') ? imageUrl.substring(4) : imageUrl;
        const response = await fetch(url);
        const fileBytes = await response.arrayBuffer();

        // Проверяем, является ли файл PDF
        if (imageUrl.startsWith('pdf:')) {
          const pdfBytes = new Uint8Array(fileBytes);
          const pdfToMerge = await PDFDocument.load(pdfBytes);

          // Конвертируем каждую страницу в A4
          for (let i = 0; i < pdfToMerge.getPageCount(); i++) {
            const [copiedPage] = await pdfDoc.copyPages(pdfToMerge, [i]);
            const { width, height } = copiedPage.getSize();
            const scale = Math.min(
              (A4_WIDTH - PAGE_PADDING * 2) / width,
              (A4_HEIGHT - PAGE_PADDING * 2) / height,
            );

            const newPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
            const embeddedPages = await pdfDoc.embedPdf(pdfToMerge);
            newPage.drawPage(embeddedPages[i], {
              x: (A4_WIDTH - width * scale) / 2,
              y: (A4_HEIGHT - height * scale) / 2,
              width: width * scale,
              height: height * scale,
            });
          }
        } else {
          // Обработка изображений
          let image;
          if (imageUrl.toLowerCase().endsWith('.png')) {
            image = await pdfDoc.embedPng(fileBytes);
          } else {
            try {
              image = await pdfDoc.embedJpg(fileBytes);
            } catch {
              // Если не удалось загрузить как JPG, пробуем как PNG
              image = await pdfDoc.embedPng(fileBytes);
            }
          }

          // Создаем страницу A4
          const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

          // Вычисляем масштаб для изображения
          const scale = Math.min(
            (A4_WIDTH - PAGE_PADDING * 2) / image.width,
            (A4_HEIGHT - PAGE_PADDING * 2) / image.height,
          );

          // Центрируем изображение на странице
          const scaledWidth = image.width * scale;
          const scaledHeight = image.height * scale;
          const x = (A4_WIDTH - scaledWidth) / 2;
          const y = (A4_HEIGHT - scaledHeight) / 2;

          page.drawImage(image, {
            x,
            y,
            width: scaledWidth,
            height: scaledHeight,
          });
        }
      } catch (error) {
        console.error(`Ошибка при обработке файла ${imageUrl}:`, error);
        // Продолжаем обработку следующих файлов
        continue;
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.pdf';
    a.click();
    URL.revokeObjectURL(url);
    setIsLoading(false);
  };

  if (images.length === 0) return null;

  return (
    <div className="p-6">
      <button
        onClick={generatePDF}
        disabled={isLoading}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        {isLoading ? 'Скачивание...' : 'Сгенерировать PDF и загрузить'}
      </button>
    </div>
  );
};
