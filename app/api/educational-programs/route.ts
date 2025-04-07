import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const programs = await prisma.educationalProgram.findMany({
      where: {
        isDeleted: false, // Получаем только неудаленные программы
      },
      include: {
        group: true,
      },
    });
    return NextResponse.json(programs);
  } catch (error) {
    console.error('Ошибка при получении программ:', error);
    return NextResponse.json({ error: 'Ошибка при получении программ' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { languages, ...data } = body;

    // Проверяем обязательные поля
    if (!data.code) {
      return NextResponse.json({ error: 'Код программы обязателен' }, { status: 400 });
    }

    // Если указан groupId, проверяем существование группы
    if (data.groupId) {
      const group = await prisma.educationalProgramGroup.findUnique({
        where: { id: data.groupId },
      });

      if (!group) {
        return NextResponse.json({ error: 'Указанная группа не существует' }, { status: 400 });
      }
    }

    // Создаем программу
    const newProgram = await prisma.educationalProgram.create({
      data: {
        ...data,
        // Преобразуем languages в валидный JSON
        languages: languages ? JSON.stringify(languages) : null,
      },
    });

    return NextResponse.json(newProgram, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании программы:', error);
    return NextResponse.json({ error: 'Ошибка при создании программы' }, { status: 500 });
  }
}

// Обновить образовательную программу
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID программы не указан' }, { status: 400 });
    }

    // Проверяем, существует ли программа
    const existingProgram = await prisma.educationalProgram.findUnique({
      where: { id },
    });

    if (!existingProgram) {
      return NextResponse.json({ error: 'Программа не найдена' }, { status: 404 });
    }

    // Если указан groupId, проверяем существование группы
    if (data.groupId) {
      const group = await prisma.educationalProgramGroup.findUnique({
        where: { id: data.groupId },
      });

      if (!group) {
        return NextResponse.json({ error: 'Указанная группа не существует' }, { status: 400 });
      }
    }

    // Обновляем программу
    const updatedProgram = await prisma.educationalProgram.update({
      where: { id },
      data: {
        ...data,
        // Преобразуем languages в валидный JSON, если оно определено
        languages: data.languages !== undefined ? JSON.stringify(data.languages) : undefined,
      },
    });

    return NextResponse.json(updatedProgram);
  } catch (error) {
    console.error('Ошибка при обновлении программы:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении программы' }, { status: 500 });
  }
}

// Удалить образовательную программу (мягкое удаление)
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID программы обязателен' }, { status: 400 });
    }

    // Проверка существования программы
    const existingProgram = await prisma.educationalProgram.findUnique({
      where: { id },
    });

    if (!existingProgram) {
      return NextResponse.json({ error: 'Программа не найдена' }, { status: 404 });
    }

    // Мягкое удаление
    await prisma.educationalProgram.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ message: 'Программа помечена как удаленная' });
  } catch (error) {
    console.error('Ошибка при удалении программы:', error);
    return NextResponse.json({ error: 'Ошибка при удалении программы' }, { status: 500 });
  }
}
