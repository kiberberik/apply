// ts-ignore
/**
 * Экспортирует массив тикетов в Google Sheets
 * @param {Array} applications - Массив заявок с полными данными
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function exportApplicationsToSheets(applications: any[]) {
  try {
    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (!appsScriptUrl) {
      throw new Error('GOOGLE_APPS_SCRIPT_URL не настроен');
    }

    console.log('🔧 Начинаем экспорт в Google Sheets...');
    console.log('📊 URL Apps Script:', appsScriptUrl);
    console.log('📋 Количество тикетов для экспорта:', applications.length);

    // Формируем данные для экспорта
    const exportData = {
      action: 'export',
      applications: applications.map((app) => ({
        ...app,
      })),
    };

    console.log('📤 Отправляем данные в Apps Script...');

    // Отправляем данные в Apps Script
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exportData),
    });

    console.log('📥 Получен ответ от Apps Script:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка ответа от Apps Script:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Данные тикетов успешно экспортированы в Google Sheets:', result);
    return result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Ошибка при экспорте в Google Sheets:', error);

    // Добавляем дополнительную диагностику
    if (error.message.includes('403')) {
      console.error('🔍 Диагностика ошибки 403:');
      console.error('- Проверьте настройки доступа в Google Apps Script');
      console.error('- Убедитесь, что "Who has access" установлено в "Anyone"');
      console.error('- Проверьте правильность URL Apps Script');
      console.error('- Убедитесь, что Apps Script развернут как веб-приложение');
    }

    throw error;
  }
}
