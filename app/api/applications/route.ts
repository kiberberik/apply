import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // console.log('Fetching applications...');
    const applications = await prisma.application.findMany({
      where: {
        isDeleted: {
          not: true,
        },
      },
      include: {
        applicant: true,
        representative: true,
        consultant: true,
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

    // console.log(`Found ${applications.length} non-deleted applications`);
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // console.log('Creating new application with data:', data);

    const { createdById, ...restData } = data;

    const application = await prisma.application.create({
      data: {
        ...restData,
        createdById: createdById || null,
        Log: {
          create: {
            statusId: 'DRAFT',
            createdById: createdById || null,
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

    // console.log('Application created successfully:', application.id);
    return NextResponse.json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
