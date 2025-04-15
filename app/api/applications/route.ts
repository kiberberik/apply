import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      include: {
        applicant: true,
        representative: true,
        details: true,
        Log: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
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

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const application = await prisma.application.create({
      data: {
        ...data,
        createdById: null,
        Log: {
          create: {
            status: 'DRAFT',
            createdById: null,
          },
        },
      },
      include: {
        applicant: true,
        representative: true,
        details: true,
        Log: true,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
