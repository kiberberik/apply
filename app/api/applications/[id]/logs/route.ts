import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    console.log(`[API] GET request for logs of application ID: ${id}`);

    // Проверяем, существует ли заявка
    const application = await prisma.application.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!application) {
      console.log(`[API] Application not found for ID: ${id}`);
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    // Получаем логи для заявки
    const logs = await prisma.log.findMany({
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

    console.log(`[API] Found ${logs.length} logs for application ID: ${id}`);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('[API] Error fetching logs:', error);
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    console.log(`[API] POST request to create log for application ID: ${id}`);

    // Проверяем, существует ли заявка
    const application = await prisma.application.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!application) {
      console.log(`[API] Application not found for ID: ${id}`);
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    // Получаем данные из запроса
    const data = await request.json();
    console.log(`[API] Received data for new log:`, JSON.stringify(data, null, 2));

    // Создаем новый лог
    const log = await prisma.log.create({
      data: {
        applicationId: id,
        statusId: data.statusId as ApplicationStatus,
        description: data.description,
        createdById: data.createdById || null,
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

    console.log(`[API] Log created successfully: ${log.id}`);
    return NextResponse.json(log);
  } catch (error) {
    console.error('[API] Error creating log:', error);
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}
