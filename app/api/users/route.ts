import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Получение всех пользователей
export async function GET() {
  try {
    const users = await prisma.user.findMany({
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
