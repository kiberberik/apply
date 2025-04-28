import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { identificationNumber } = await req.json();

    if (!identificationNumber) {
      return NextResponse.json({ error: 'ИИН/ID обязательный параметр' }, { status: 400 });
    }

    // Вычисляем дату 6 месяцев назад
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Ищем заявки за последние 6 месяцев со статусом не DRAFT
    const existingApplications = await prisma.application.findMany({
      where: {
        applicant: {
          identificationNumber: identificationNumber,
        },
        isDeleted: false,
        createdAt: {
          gte: sixMonthsAgo,
        },
        Log: {
          some: {
            statusId: {
              not: 'DRAFT',
            },
          },
        },
      },
      include: {
        Log: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        applicant: {
          select: {
            givennames: true,
            surname: true,
            identificationNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      hasDuplicate: existingApplications.length > 0,
      applications: existingApplications,
    });
  } catch (error) {
    console.error('Ошибка при проверке дубликатов заявок:', error);
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}
