import { useAuthStore } from '@/store/useAuthStore';
import { useSingleApplication } from '@/store/useSingleApplication';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';

interface OpenAIResponseProps {
  images: string[];
  onResponse: (response: string | object) => void;
  applicationId?: string;
  activeTab?: string;
  isProcessing?: boolean;
}

export const OpenAIResponse = ({
  images,
  onResponse,
  applicationId,
  activeTab,
  isProcessing,
}: OpenAIResponseProps): React.ReactElement | null => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { application } = useSingleApplication();
  const t = useTranslations('Common');

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      setError('API ключ OpenAI не найден. Пожалуйста, проверьте файл .env');
    }
  }, []);

  const analyzeImages = async () => {
    if (images.length === 0) return;
    setError(null);
    setIsLoading(true);

    try {
      const base64Images = await Promise.all(
        images.map(async (imageUrl) => {
          try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error('Ошибка при загрузке изображения');
            const blob = await response.blob();
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result as string;
                resolve(base64.split(',')[1]);
              };
              reader.readAsDataURL(blob);
            });
          } catch (error) {
            console.error('Error processing image:', error);
            throw new Error('Ошибка при обработке изображения');
          }
        }),
      );

      const prompt = `Ты — мощная OCR-система с поддержкой русского, казахского и английского языков. Твоя задача — распознать и извлечь данные из всех загруженных изображений или PDF-документов, содержащих:

✅ Удостоверение личности (на русском или казахском языке)(ID_CARD) - передняя и задняя сторона могут быть на разных изображениях
✅ Паспорт (данные только на английском языке)(PASSPORT)

Определи тип каждого загруженного документа (docType). Если ты видишь переднюю и заднюю стороны документа на разных изображениях, объедини информацию с обеих сторон.

📌 Если загружено удостоверение личности или паспорт, извлеки:
- ФИО (Фамилия - surname, Имя - givennames, Отчество - patronymic) - на русском или казахском как указано в документе, включая все казахские буквы (ә, ғ, қ, ң, ө, ұ, ү, h, і)
- Дата рождения (ДД.ММ.ГГГГ) - birthDate
- ИИН (12-значный идентификационный номер) - identificationNumber
- Номер документа (documentNumber)
- Дата выдачи (issueDate)
- Срок действия (expirationDate)
- Орган, выдавший документ (issuingAuthority) - на русском или казахском как указано в документе, сохраняя все казахские буквы
- Место рождения (birthPlace) - на русском или казахском как указано в документе, сохраняя все казахские буквы
- Гражданство (citizenship) - если документ удостоверение то гражданство Казахстан, если паспорт и гражданство Казахстан написанное в любом языке и формате, то укажи Казахстан, иначе гражданство указанное в паспорте

⚠️ Правила обработки данных:
1. Если какое-то поле отсутствует в документе или не предусмотрено форматом документа, оставь пустым
2. Если поле есть в документе, но его невозможно прочитать, укажи "Не удалось распознать"
3. Для полей, где возможны оба языка:
   - Если информация на казахском языке, сохраняй все казахские буквы (ә, Ә, ғ, Ғ, қ, Қ, ң, Ң, ө, Ө, ұ, Ұ, ү, Ү, h, H, і, І)
   - Не заменяй казахские буквы на русские аналоги
   - Если информация доступна только на одном языке, укажи её только на этом языке
   - Если в паспорте есть информация на двух языках, бери данные только из английского языка
4. Всегда указывай все поля, даже если они пустые или нечитаемые
5. Не переводи значения, пиши как в документе

⚠️ Если загруженный файл не является удостоверением личности, паспортом, укажи:
error: "criteriaError" json.

Формат результата:
- Удостоверение личности обозначай как 'ID_CARD'
- Паспорт обозначай как 'PASSPORT'

Обязательно учитывай язык и делай точно также как в документе, сохраняя все казахские буквы без изменений.

Ответ должен быть строго в json формате, без лишних комментариев. Нужны поля: docType, givennames, surname, patronymic, birthDate, birthPlace, documentNumber, issueDate, expirationDate, issuingAuthority, identificationNumber, citizenship`;

      try {
        console.log('Подготовка запроса к API...');

        const requestBody = {
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt,
                },
                ...base64Images.map((base64) => ({
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64}`,
                    detail: 'high',
                  },
                })),
              ],
            },
          ],
          max_tokens: 1000,
        };

        console.log('Отправка запроса к API...');

        const response = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('Статус ответа:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Данные ошибки:', errorData);

          if (response.status === 401) {
            throw new Error(`Ошибка авторизации. Проверьте правильность API ключа в файле .env`);
          }
          const errorMessage =
            errorData.error?.message || `Ошибка API: ${response.status} ${response.statusText}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('data', data);

        if (data.choices[0].message.content && data.choices[0].message.content.includes('error')) {
          onResponse(data.choices[0].message.content);
          return;
        }
        console.log('Успешный ответ от API');

        if (!data.choices?.[0]?.message?.content) {
          throw new Error('Некорректный ответ от API');
        }

        // Сохраняем документы в базе данных
        try {
          // Извлекаем JSON из сообщения для определения типа документа и других данных
          let parsedContent;
          const content = data.choices[0].message.content;

          // Проверяем, содержит ли ответ markdown-обёртку
          const jsonMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
            // Парсим из markdown-блока
            parsedContent = JSON.parse(jsonMatch[1]);
          } else {
            // Пробуем напрямую распарсить
            try {
              parsedContent = JSON.parse(content);
            } catch (error) {
              console.error('Ошибка при парсинге JSON:', error);
              // Если не удалось распарсить, передаем как есть
              onResponse(content);
              return;
            }
          }

          // Добавляем информацию о вкладке, в которой был загружен документ
          parsedContent.activeTab = activeTab || '';
          console.log('Добавляем информацию о вкладке:', activeTab);

          // Сначала сохраняем все изображения
          const savedFiles = await Promise.all(
            images.map(async (imageUrl, index) => {
              const formData = new FormData();

              // Получаем blob из URL
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              const file = new File([blob], `document-${index + 1}.jpg`, { type: 'image/jpeg' });

              // Добавляем файл в formData
              formData.append('file', file);

              // Добавляем метаданные для обновления документов
              formData.append('activeTab', activeTab || 'applicant');
              formData.append('applicantId', application?.applicantId || '');
              formData.append('representativeId', application?.representativeId || '');

              // Дополнительные данные для записи в документ, если в будущем понадобится
              formData.append('uploadedById', user?.id || '');
              formData.append('applicationId', applicationId || '');

              // Код документа
              formData.append('code', parsedContent.docType || '');

              // Номер документа
              formData.append('number', parsedContent.documentNumber || '');

              // Орган, выдавший документ
              formData.append('issuingAuthority', parsedContent.issuingAuthority || '');

              // Дата выдачи
              if (parsedContent.issueDate) {
                // Проверяем формат даты и преобразуем соответствующим образом
                const dateParts = parsedContent.issueDate.match(/(\d+)[.\/-](\d+)[.\/-](\d+)/);

                if (dateParts) {
                  let day = dateParts[1];
                  let month = dateParts[2];
                  let year = dateParts[3];

                  // Если год короткий (например, 95 вместо 1995)
                  if (year.length === 2) {
                    // Определяем век по году (2000+ для 00-23, 1900+ для 24-99)
                    const century = parseInt(year) >= 0 && parseInt(year) <= 23 ? 2000 : 1900;
                    year = String(century + parseInt(year));
                    console.log(`Короткий год: добавляем век ${century}, получаем ${year}`);
                  }

                  // Нормализация для однозначных значений
                  day = day.padStart(2, '0');
                  month = month.padStart(2, '0');

                  formData.append('issueDate', `${year}-${month}-${day}`);
                }
              }

              // Дата окончания срока действия
              if (parsedContent.expirationDate) {
                // Проверяем формат даты и преобразуем соответствующим образом
                const dateParts = parsedContent.expirationDate.match(/(\d+)[.\/-](\d+)[.\/-](\d+)/);

                if (dateParts) {
                  let day = dateParts[1];
                  let month = dateParts[2];
                  let year = dateParts[3];

                  // Если год короткий (например, 95 вместо 1995)
                  if (year.length === 2) {
                    // Определяем век по году (2000+ для 00-23, 1900+ для 24-99)
                    const century = parseInt(year) >= 0 && parseInt(year) <= 23 ? 2000 : 1900;
                    year = String(century + parseInt(year));
                    console.log(`Короткий год: добавляем век ${century}, получаем ${year}`);
                  }

                  // Нормализация для однозначных значений
                  day = day.padStart(2, '0');
                  month = month.padStart(2, '0');

                  formData.append('expirationDate', `${year}-${month}-${day}`);
                }
              }

              const uploadResponse = await fetch('/api/upload-document', {
                method: 'POST',
                body: formData,
              });

              if (!uploadResponse.ok) {
                throw new Error(`Ошибка при загрузке файла: ${uploadResponse.statusText}`);
              }

              const uploadData = await uploadResponse.json();
              console.log('Документ успешно загружен:', uploadData);

              // Добавляем URL документа к распознанным данным
              if (!parsedContent.documentUrls) {
                parsedContent.documentUrls = [];
              }
              if (uploadData.url) {
                parsedContent.documentUrls.push(uploadData.url);
              }

              return true;
            }),
          );

          if (savedFiles.every(Boolean)) {
            console.log('Все документы успешно загружены');
          }

          // Передаем обновленные данные с URL документов
          onResponse(parsedContent);
        } catch (error) {
          const uploadError = error as Error;
          console.error('Ошибка при сохранении документов:', uploadError);
          setError(`Ошибка при сохранении документов: ${uploadError.message}`);
          // При ошибке загрузки документов все равно передаем распознанные данные
          onResponse(data.choices[0].message.content);
        }
      } catch (error) {
        const apiError = error as Error;
        console.error('Ошибка API:', apiError);
        setError(apiError.message);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      const parsedError = error as Error;
      console.error('Ошибка:', parsedError);
      setError(`Не удалось обработать изображения: ${parsedError.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <Button
        onClick={analyzeImages}
        disabled={images.length === 0 || isLoading || isProcessing}
        className="w-full"
      >
        {isLoading || isProcessing ? t('analyzing') : t('analyzeDocuments')}
      </Button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};
