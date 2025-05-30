// Функция для форматирования номера телефона в формат E.164
export const formatPhoneNumber = (value: string): string => {
  // Удаляем все нецифровые символы, кроме +
  const cleaned = value.replace(/[^\d+]/g, '');

  // Удаляем все плюсы, кроме первого в начале
  const singlePlus = cleaned.startsWith('+')
    ? '+' + cleaned.slice(1).replace(/\+/g, '')
    : cleaned.replace(/\+/g, '');

  // Если номер начинается с +87 или 87, заменяем на +77
  if (singlePlus.startsWith('+87') || singlePlus.startsWith('87')) {
    return '+77' + singlePlus.slice(singlePlus.startsWith('+') ? 3 : 2);
  }

  // Если номер уже начинается с +, оставляем как есть
  if (singlePlus.startsWith('+')) {
    return singlePlus;
  }

  // Если номер начинается с 7, добавляем +
  if (singlePlus.startsWith('7')) {
    return '+' + singlePlus;
  }

  // Для других стран добавляем + в начало
  return '+' + singlePlus;
};
