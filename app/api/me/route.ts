import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

export async function GET(req: NextRequest) {
  const locale = req.headers.get('accept-language')?.split(',')[0] || 'ru';
  const t = await getTranslations({ namespace: 'auth', locale });
  try {
    const sessionToken = req.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: t('unauthorized') }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: {
        sessionToken,
        expires: { gt: new Date() },
      },
      include: {
        user: {
          include: {
            createdApplications: {
              include: {
                applicant: true,
                representative: true,
                details: true,
                documents: true,
              },
            },
            consultedApplications: {
              include: {
                applicant: true,
                representative: true,
                details: true,
                documents: true,
              },
            },
            consultants: {
              select: {
                id: true,
                name: true,
                consultedApplications: true, // Только нужные поля
              },
            },
            manager: {
              select: {
                id: true,
                name: true,
                consultants: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: t('sessionExpired') }, { status: 401 });
    }

    const {
      id,
      email,
      name,
      role,
      emailVerified,
      createdApplications,
      consultedApplications,
      consultants,
      manager,
    } = session.user;

    // console.log('User data:', {
    //   id,
    //   email,
    //   name,
    //   role,
    //   createdApplications,
    //   consultedApplications,
    //   consultants,
    //   manager,
    // });

    return NextResponse.json({
      id,
      email,
      name,
      role,
      emailVerified,
      createdApplications,
      consultedApplications,
      consultants,
      manager,
    });
  } catch (error) {
    console.error('Ошибка в /api/me:', error);
    return NextResponse.json({ error: t('serverError') }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const locale = req.headers.get('accept-language')?.split(',')[0] || 'ru';
  const t = await getTranslations({ namespace: 'auth', locale });
  try {
    const sessionToken = req.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: t('unauthorized') }, { status: 401 });
    }

    const session = await prisma.session.findFirst({
      where: {
        sessionToken,
        expires: { gt: new Date() },
      },
      include: {
        user: {
          include: {
            createdApplications: true,
            consultedApplications: true,
          },
        },
      },
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: t('sessionExpired') }, { status: 401 });
    }

    const { id } = session.user;
    const { name, password } = await req.json();
    const updateData: Partial<Prisma.UserUpdateInput> = {};

    if (name) {
      updateData.name = name;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        createdApplications: true,
        consultedApplications: true,
      },
    });

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      createdApplications: updatedUser.createdApplications,
      consultedApplications: updatedUser.consultedApplications,
    });
  } catch (error) {
    console.error('Ошибка в /api/me POST:', error);
    return NextResponse.json({ error: t('serverError') }, { status: 500 });
  }
}
