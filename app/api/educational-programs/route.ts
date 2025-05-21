import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkServerAccess } from '@/lib/serverAuth';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const programs = await prisma.educationalProgram.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        group: true,
        languages: {
          include: {
            language: true,
          },
        },
      },
    });
    return NextResponse.json(programs);
  } catch (error) {
    console.error('Ошибка при получении программ:', error);
    return NextResponse.json({ error: 'Ошибка при получении программ' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const hasAccess = await checkServerAccess(Role.ADMIN);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { languages, ...data } = body;

    if (!data.code) {
      return NextResponse.json({ error: 'Код программы обязателен' }, { status: 400 });
    }

    if (data.groupId) {
      const group = await prisma.educationalProgramGroup.findUnique({
        where: { id: data.groupId },
      });

      if (!group) {
        return NextResponse.json({ error: 'Указанная группа не существует' }, { status: 400 });
      }
    }

    const newProgram = await prisma.educationalProgram.create({
      data: {
        ...data,
        languages: {
          create: languages.map((languageId: string) => ({
            language: {
              connect: { id: languageId },
            },
          })),
        },
      },
      include: {
        languages: {
          include: {
            language: true,
          },
        },
      },
    });

    return NextResponse.json(newProgram, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании программы:', error);
    return NextResponse.json({ error: 'Ошибка при создании программы' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const hasAccess = await checkServerAccess(Role.ADMIN);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { id, languages, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID программы не указан' }, { status: 400 });
    }

    const existingProgram = await prisma.educationalProgram.findUnique({
      where: { id },
      include: { languages: true },
    });

    if (!existingProgram) {
      return NextResponse.json({ error: 'Программа не найдена' }, { status: 404 });
    }

    if (data.groupId) {
      const group = await prisma.educationalProgramGroup.findUnique({
        where: { id: data.groupId },
      });

      if (!group) {
        return NextResponse.json({ error: 'Указанная группа не существует' }, { status: 400 });
      }
    }

    // Удаляем старые языки и создаем новые
    if (languages) {
      await prisma.educationalProgramLanguage.deleteMany({
        where: { educationalProgramId: id },
      });
    }

    const updatedProgram = await prisma.educationalProgram.update({
      where: { id },
      data: {
        ...data,
        languages: languages
          ? {
              create: languages.map((languageId: string) => ({
                language: {
                  connect: { id: languageId },
                },
              })),
            }
          : undefined,
      },
      include: {
        languages: {
          include: {
            language: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProgram);
  } catch (error) {
    console.error('Ошибка при обновлении программы:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении программы' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const hasAccess = await checkServerAccess(Role.ADMIN);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID программы обязателен' }, { status: 400 });
    }

    const existingProgram = await prisma.educationalProgram.findUnique({
      where: { id },
    });

    if (!existingProgram) {
      return NextResponse.json({ error: 'Программа не найдена' }, { status: 404 });
    }

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
