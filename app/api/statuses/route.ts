import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const status = await prisma.log.create({
      data: {
        statusId: data.statusId as ApplicationStatus,
        description: data.description,
        createdBy: {
          connect: {
            id: data.userId,
          },
        },
      },
    });

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error creating status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const statuses = await prisma.log.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Error fetching statuses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
