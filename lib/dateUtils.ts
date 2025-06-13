/**
 * Утилиты для работы с датами
 */

/**
 * Преобразует дату из любого формата в строку YYYY-MM-DD для input[type="date"]
 * Всегда возвращает строку (пустую строку для null/undefined)
 */
export const formatToInputDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';

  try {
    let d: Date;

    if (typeof date === 'string') {
      // Проверим, соответствует ли формат yyyy-MM-dd
      const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        // Строка уже в нужном формате
        return date;
      } else {
        // Проверим, соответствует ли формат DD.MM.YYYY (русский формат)
        const russianMatch = date.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (russianMatch) {
          // Преобразуем из русского формата в YYYY-MM-DD
          const [, day, month, year] = russianMatch;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          // Попробуем создать дату обычным способом
          d = new Date(date);
        }
      }
    } else {
      d = new Date(date);
    }

    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Ошибка форматирования даты для input:', error);
    return '';
  }
};

/**
 * Создает объект Date из строки YYYY-MM-DD (из input[type="date"])
 * Устанавливает время на полдень для предотвращения проблем с часовым поясом
 */
export const createDateFromInputValue = (dateStr: string | null | undefined): Date | undefined => {
  if (!dateStr) return undefined;

  try {
    // Простая проверка формата даты
    if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
      console.warn(`Неверный формат даты: ${dateStr}`);
      return undefined;
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    // Используем полдень для избежания проблем с часовым поясом
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);

    if (isNaN(date.getTime())) {
      console.warn(`Создана невалидная дата из строки: ${dateStr}`);
      return undefined;
    }

    return date;
  } catch (error) {
    console.error('Ошибка создания объекта Date из строки:', error);
    return undefined;
  }
};

/**
 * Преобразует строку YYYY-MM-DD из input[type="date"] в формат для БД ISO
 */
export const formatToDatabaseDate = (
  dateInput: string | Date | null | undefined,
): string | null => {
  if (!dateInput) return null;
  try {
    // Проверяем, если передан объект Date
    if (Object.prototype.toString.call(dateInput) === '[object Date]') {
      const dateObj = dateInput as Date;
      if (isNaN(dateObj.getTime())) {
        console.warn('Невалидный объект Date');
        return null;
      }
      return dateObj.toISOString();
    }

    // Преобразуем в строку, если это еще не строка
    const dateStr = String(dateInput);

    // Если дата уже в формате ISO (содержит T), просто проверяем её валидность
    if (dateStr.includes('T')) {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.warn(`Невалидная ISO дата: ${dateStr}`);
        return null;
      }
      return dateStr;
    }

    // Проверка на формат YYYY-MM-DD или DD.MM.YYYY
    const isStandardFormat = /^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr);
    const isRussianFormat = /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateStr);

    if (!isStandardFormat && !isRussianFormat) {
      console.warn(`Неподдерживаемый формат даты: ${dateStr}`);
      return null;
    }

    let date: Date;

    if (isRussianFormat) {
      // Преобразуем из DD.MM.YYYY в Date
      const [day, month, year] = dateStr.split('.').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      // Обычный формат YYYY-MM-DD
      const [year, month, day] = dateStr.split('-').map(Number);
      date = new Date(year, month - 1, day);
    }

    // Проверка на валидность даты
    if (isNaN(date.getTime())) {
      console.warn(`Невалидная дата: ${dateStr}`);
      return null;
    }

    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  } catch (error) {
    console.error('Ошибка форматирования даты для БД:', error);
    return null;
  }
};

/**
 * Сравнивает две даты независимо от формата (YYYY-MM-DD или ISO)
 */
export const areDatesEqual = (
  date1: Date | string | null | undefined,
  date2: string | Date | null | undefined,
): boolean => {
  if (!date1 && !date2) return true;
  if (!date1 || !date2) return false;

  try {
    const formattedDate1 =
      typeof date1 === 'string' ? date1.split('T')[0] : new Date(date1).toISOString().split('T')[0];
    const formattedDate2 =
      typeof date2 === 'string' ? date2.split('T')[0] : new Date(date2).toISOString().split('T')[0];

    return formattedDate1 === formattedDate2;
  } catch (error) {
    console.error('Ошибка сравнения дат:', error);
    return false;
  }
};

/**
 * Форматирует дату для отображения пользователю (DD.MM.YYYY)
 */
export const formatDateForDisplay = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;

  try {
    const d = new Date(date);

    // d.setHours(12, 0, 0, 0);
    d.setHours(d.getHours() + 6);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();

    return `${day}.${month}.${year}`;
  } catch (error) {
    console.error('Ошибка форматирования даты для отображения:', error);
    return null;
  }
};

const dateUtils = {
  formatToInputDate,
  formatToDatabaseDate,
  areDatesEqual,
  formatDateForDisplay,
  createDateFromInputValue,
};

export default dateUtils;
