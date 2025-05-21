import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus, Role } from '@prisma/client';
import { checkServerAccess } from '@/lib/serverAuth';

export async function GET(request: Request) {
  // const hasAccess = await checkServerAccess(Role.CONSULTANT);
  // if (!hasAccess) {
  //   return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  // }

  try {
    const url = new URL(request.url);
    const applicationId = url.searchParams.get('applicationId');

    const where = applicationId ? { applicationId } : {};

    // console.log('[API] Fetching logs with criteria:', where);

    const logs = await prisma.log.findMany({
      where,
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

    // console.log(`[API] Found ${logs.length} logs`);
    return NextResponse.json(logs);
  } catch (error) {
    // console.error('[API] Error fetching logs:', error);
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const hasAccess = await checkServerAccess(Role.CONSULTANT);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }

  try {
    const data = await request.json();
    // console.log('[API] Creating new log with data:', data);

    // Проверяем наличие необходимых полей
    if (!data.applicationId) {
      return NextResponse.json({ error: 'Не указан ID заявки (applicationId)' }, { status: 400 });
    }

    // Создаем новый лог
    const log = await prisma.log.create({
      data: {
        applicationId: data.applicationId,
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

    // console.log('[API] Log created successfully:', log.id);
    return NextResponse.json(log);
  } catch (error) {
    // console.error('[API] Error creating log:', error);
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}
