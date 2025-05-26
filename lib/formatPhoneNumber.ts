// Функция для форматирования номера телефона в формат E.164
export const formatPhoneNumber = (value: string): string => {
  // Удаляем все нецифровые символы, кроме +
  const cleaned = value.replace(/[^\d+]/g, '');

  // Если номер начинается с +87 или 87, заменяем на +77
  if (cleaned.startsWith('+87') || cleaned.startsWith('87')) {
    return '+77' + cleaned.slice(cleaned.startsWith('+') ? 3 : 2);
  }

  // Если номер уже начинается с +, оставляем как есть
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Если номер начинается с 7, добавляем +
  if (cleaned.startsWith('7')) {
    return '+' + cleaned;
  }

  // Для других стран добавляем + в начало
  return '+' + cleaned;
};
