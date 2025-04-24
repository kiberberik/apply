import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    console.log(`[API] GET request for log ID: ${id}`);

    // Получаем лог из базы данных
    const log = await prisma.log.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!log) {
      console.log(`[API] Log not found for ID: ${id}`);
      return NextResponse.json({ error: 'Лог не найден' }, { status: 404 });
    }

    console.log(`[API] Returning log with ID: ${id}`);
    return NextResponse.json(log);
  } catch (error) {
    console.error('[API] Error fetching log:', error);
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    console.log(`[API] PATCH request for log ID: ${id}`);

    // Получаем данные из запроса
    const data = await request.json();
    console.log(`[API] Received data for log update:`, JSON.stringify(data, null, 2));

    // Проверяем, существует ли лог
    const existingLog = await prisma.log.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingLog) {
      console.log(`[API] Log not found for ID: ${id}`);
      return NextResponse.json({ error: 'Лог не найден' }, { status: 404 });
    }

    // Обновляем лог
    const log = await prisma.log.update({
      where: { id },
      data: {
        statusId: data.statusId as ApplicationStatus | null,
        description: data.description,
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`[API] Log updated successfully: ${log.id}`);
    return NextResponse.json(log);
  } catch (error) {
    console.error('[API] Error updating log:', error);
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    console.log(`[API] DELETE request for log ID: ${id}`);

    // Проверяем, существует ли лог
    const existingLog = await prisma.log.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingLog) {
      console.log(`[API] Log not found for ID: ${id}`);
      return NextResponse.json({ error: 'Лог не найден' }, { status: 404 });
    }

    // Удаляем лог
    await prisma.log.delete({
      where: { id },
    });

    console.log(`[API] Log deleted successfully: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting log:', error);
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}
