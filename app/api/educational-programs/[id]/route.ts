import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const { searchParams } = new URL(request.url);
    const includeGroup = searchParams.get('includeGroup') === 'true';

    const program = await prisma.educationalProgram.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      select: {
        id: true,
        name_rus: true,
        name_kaz: true,
        name_eng: true,
        code: true,
        duration: true,
        costPerCredit: true,
        academic_level: true,
        visibility: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        languages: {
          select: {
            language: {
              select: {
                id: true,
                name_rus: true,
                name_kaz: true,
                name_eng: true,
                code: true,
              },
            },
          },
        },
        group: includeGroup
          ? {
              select: {
                id: true,
                name_rus: true,
                name_kaz: true,
                name_eng: true,
                code: true,
                academic_level: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
              },
            }
          : undefined,
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Образовательная программа не найдена' }, { status: 404 });
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error('Ошибка при получении деталей программы:', error);
    return NextResponse.json({ error: 'Ошибка при получении деталей программы' }, { status: 500 });
  }
}
