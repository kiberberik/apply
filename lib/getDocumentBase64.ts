import { Document } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getDocumentBase64(application: any, code: string): Promise<string | null> {
  const doc = application?.documents?.find((doc: Document) => doc?.code?.trim() === code);

  if (!doc?.link) {
    console.log(`Документ с кодом "${code}" не найден или не содержит ссылку.`);
    return null;
  }

  const fileUrl = `${process.env.NEXT_PUBLIC_APP_URL}${doc.link.trim()}`;

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      console.log(`Ошибка при загрузке файла: ${response.status}`);
      return null;
    }

    const blob = await response.blob();

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string); // "data:application/pdf;base64,..."
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    return base64;
  } catch (error) {
    console.error(`Ошибка при получении base64 для документа "${code}":`, error);
    return null;
  }
}
