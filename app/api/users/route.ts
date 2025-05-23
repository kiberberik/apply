import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { checkServerAccess } from '@/lib/serverAuth';

// Получение всех пользователей
export async function GET(request: Request) {
  try {
    const hasAccess = await checkServerAccess(Role.USER);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as Role | null;

    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        emailVerified: true,
        managerId: true,
        createdApplications: true,
        consultedApplications: true,
        consultants: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            consultedApplications: true,
          },
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            consultants: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// Обновление email или роли пользователя
export async function PATCH(req: Request) {
  try {
    // Проверяем доступ
    const hasAccess = await checkServerAccess(Role.CONSULTANT);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const { id, name, email, role, managerId } = await req.json();
    if (!id) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
        managerId: managerId || null,
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
