import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const program = await prisma.educationalProgram.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        languages: {
          include: {
            language: true,
          },
        },
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
