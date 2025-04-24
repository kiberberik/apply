import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const groups = await prisma.educationalProgramGroup.findMany({
      where: {
        isDeleted: false, // Получаем только неудаленные группы
      },
      include: {
        programs: {
          where: {
            isDeleted: false,
          },
          include: {
            languages: {
              include: {
                language: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json(groups);
  } catch (error) {
    console.error('Ошибка при получении групп:', error);
    return NextResponse.json({ error: 'Ошибка при получении групп' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Валидация обязательных полей
    if (!body.code) {
      return NextResponse.json({ error: 'Код группы обязателен' }, { status: 400 });
    }

    // Создание группы
    const group = await prisma.educationalProgramGroup.create({
      data: {
        ...body,
        isDeleted: false, // Явно устанавливаем флаг удаления
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Ошибка при создании группы:', error);
    return NextResponse.json({ error: 'Ошибка при создании группы' }, { status: 500 });
  }
}

// Обновить группу образовательных программ
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID группы обязателен' }, { status: 400 });
    }

    // Проверка существования группы
    const existingGroup = await prisma.educationalProgramGroup.findUnique({
      where: { id },
    });

    if (!existingGroup) {
      return NextResponse.json({ error: 'Группа не найдена' }, { status: 404 });
    }

    // Если обновляется код, проверяем его уникальность, исключая текущую группу
    if (body.code && body.code !== existingGroup.code) {
      const codeExists = await prisma.educationalProgramGroup.findFirst({
        where: {
          code: body.code,
          id: { not: id }, // Исключаем текущую группу из проверки
        },
      });

      if (codeExists) {
        return NextResponse.json({ error: 'Группа с таким кодом уже существует' }, { status: 409 });
      }
    }

    // Подготовка данных для обновления
    const updateData = { ...body };
    delete updateData.id;

    // Обновление группы
    const updatedGroup = await prisma.educationalProgramGroup.update({
      where: { id },
      data: updateData,
    });

    // Если изменился academic_level, обновляем все программы в группе
    if (body.academic_level && body.academic_level !== existingGroup.academic_level) {
      await prisma.educationalProgram.updateMany({
        where: { groupId: id },
        data: { academic_level: body.academic_level },
      });
    }

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error('Ошибка при обновлении группы:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении группы' }, { status: 500 });
  }
}

// Удалить группу образовательных программ (мягкое удаление)
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID группы обязателен' }, { status: 400 });
    }

    // Проверка существования группы
    const existingGroup = await prisma.educationalProgramGroup.findUnique({
      where: { id },
    });

    if (!existingGroup) {
      return NextResponse.json({ error: 'Группа не найдена' }, { status: 404 });
    }

    // Мягкое удаление группы
    await prisma.educationalProgramGroup.update({
      where: { id },
      data: { isDeleted: true },
    });

    // Мягкое удаление всех программ в группе
    await prisma.educationalProgram.updateMany({
      where: { groupId: id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ message: 'Группа и все её программы помечены как удаленные' });
  } catch (error) {
    console.error('Ошибка при удалении группы:', error);
    return NextResponse.json({ error: 'Ошибка при удалении группы' }, { status: 500 });
  }
}
