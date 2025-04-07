// Скрипт для исправления формата поля languages в базе данных
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixLanguagesJson() {
  try {
    console.log('Начинаем исправление формата поля languages...');

    // Получаем все программы
    const programs = await prisma.educationalProgram.findMany();
    console.log(`Найдено ${programs.length} программ`);

    // Обрабатываем каждую программу
    for (const program of programs) {
      if (program.languages) {
        let languages;

        // Проверяем, является ли languages строкой
        if (typeof program.languages === 'string') {
          try {
            // Пытаемся распарсить как JSON
            languages = JSON.parse(program.languages);
          } catch {
            console.log(`Ошибка парсинга для программы ${program.id}: ${program.languages}`);

            // Если строка содержит экранированные кавычки, исправляем её
            if (program.languages.includes('\\"')) {
              // Удаляем экранированные кавычки и парсим
              const fixedString = program.languages.replace(/\\"/g, '"');
              try {
                languages = JSON.parse(fixedString);
                console.log(`Исправлено для программы ${program.id}: ${fixedString}`);
              } catch {
                console.log(`Не удалось исправить для программы ${program.id}`);
                languages = [];
              }
            } else {
              // Это не массив, преобразуем в массив с одним элементом
              languages = [program.languages];
            }
          }
        } else if (Array.isArray(program.languages)) {
          // Если это уже массив, оставляем как есть
          languages = program.languages;
        } else {
          // Если это что-то другое, преобразуем в пустой массив
          languages = [];
        }

        // Преобразуем в валидный JSON
        const languagesJson = JSON.stringify(languages);

        // Обновляем программу
        await prisma.educationalProgram.update({
          where: { id: program.id },
          data: { languages: languagesJson },
        });

        console.log(`Исправлена программа ${program.id}: ${program.code}`);
      }
    }

    console.log('Исправление формата поля languages завершено');
  } catch (error) {
    console.error('Ошибка при исправлении формата поля languages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLanguagesJson();
