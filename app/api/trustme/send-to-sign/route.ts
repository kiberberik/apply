import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Получаем токен из переменных окружения
    const token = process.env.TRUSTME_API_TOKEN;
    if (!token) {
      throw new Error('TRUSTME_API_TOKEN не настроен');
    }

    // Формируем URL для TrustMe API
    const trustMeUrl =
      process.env.TRUSTME_API_URL ||
      `${process.env.NEXT_PUBLIC_TRUSTME_API_URL}/SendToSignBase64FileExt/file_extension`;

    // Отправляем запрос в TrustMe
    const response = await fetch(trustMeUrl, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'multipart/form-data',
      },
      body: JSON.stringify({
        downloadURL: data.downloadURL,
        NumberDial: data.NumberDial,
        AdditionalInfo: data.AdditionalInfo,
        KzBmg: data.KzBmg,
        FaceId: data.FaceId,
        Requisites: data.Requisites,
        contractName: data.contractName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Ошибка TrustMe API: ${errorData}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Ошибка при отправке в TrustMe:', error);
    return NextResponse.json({ error: 'Ошибка при отправке в TrustMe' }, { status: 500 });
  }
}
