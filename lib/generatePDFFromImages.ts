import { PDFDocument } from 'pdf-lib';

export const generatePDFFromImages = async (imageUrls: string[]) => {
  // Размеры A4 в пунктах (1 пункт = 1/72 дюйма)
  const A4_WIDTH = 595.28; // 210 мм
  const A4_HEIGHT = 841.89; // 297 мм
  const PAGE_PADDING = 20; // Отступы по краям страницы
  const pdfDoc = await PDFDocument.create();

  for (const imageUrl of imageUrls) {
    try {
      const response = await fetch(imageUrl);
      const fileBytes = await response.arrayBuffer();

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
    } catch (error) {
      console.error(`Ошибка при обработке файла ${imageUrl}:`, error);
      continue;
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return blob;
};
