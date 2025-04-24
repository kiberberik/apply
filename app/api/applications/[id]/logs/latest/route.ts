import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    console.log(`[API] GET request for latest log of application ID: ${id}`);

    // Проверяем, существует ли заявка
    const application = await prisma.application.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!application) {
      console.log(`[API] Application not found for ID: ${id}`);
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    // Получаем последний лог для заявки
    const log = await prisma.log.findFirst({
      where: { applicationId: id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!log) {
      console.log(`[API] No logs found for application ID: ${id}`);
      return NextResponse.json({ error: 'Логи не найдены' }, { status: 404 });
    }

    console.log(`[API] Found latest log for application ID: ${id}`);
    return NextResponse.json(log);
  } catch (error) {
    console.error('[API] Error fetching latest log:', error);
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}
