import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: true,
        representative: true,
        details: true,
        documents: true,
        Log: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const application = await prisma.application.findUnique({
      where: { id },
      include: { Log: true, createdBy: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const data = await request.json();

    // Обновляем заявку
    await prisma.application.update({
      where: { id },
      data: {
        Log: {
          create: {
            status: data.status || application.Log[0]?.status,
            createdById: application.createdBy?.id || null,
          },
        },
      },
    });

    // Обновляем связанные сущности
    if (data.applicant) {
      try {
        await prisma.applicant.update({
          where: { id: application.applicantId || '' },
          data: {
            ...data.applicant,
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        console.error('Error updating applicant:', error);
        return NextResponse.json({ error: 'Error updating applicant' }, { status: 500 });
      }
    }

    if (data.representative) {
      try {
        if (application.representativeId) {
          await prisma.representative.update({
            where: { id: application.representativeId },
            data: {
              ...data.representative,
              updatedAt: new Date(),
            },
          });
        } else {
          const newRepresentative = await prisma.representative.create({
            data: {
              ...data.representative,
              applicationId: application.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          await prisma.application.update({
            where: { id: application.id },
            data: { representativeId: newRepresentative.id },
          });
        }
      } catch (error) {
        console.error('Error updating representative:', error);
        return NextResponse.json({ error: 'Error updating representative' }, { status: 500 });
      }
    }

    if (data.details) {
      try {
        await prisma.details.update({
          where: { id: application.detailsId || '' },
          data: {
            ...data.details,
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        console.error('Error updating details:', error);
        return NextResponse.json({ error: 'Error updating details' }, { status: 500 });
      }
    }

    // Получаем обновленную заявку со всеми связанными данными
    const finalApplication = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: true,
        representative: true,
        details: true,
        documents: true,
        Log: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(finalApplication);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const application = await prisma.application.findUnique({
      where: { id },
      include: { Log: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
