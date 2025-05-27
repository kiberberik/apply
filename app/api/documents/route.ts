import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const documents = await prisma.document.findMany({
      where: {
        applicationId,
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { applicationId, userId, code, link, name, diplomaSerialNumber, number, issueDate } =
      body;

    if (!applicationId || !userId || !code || !link) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, userId, code, link' },
        { status: 400 },
      );
    }

    const document = await prisma.document.create({
      data: {
        applicationId,
        userId,
        uploadedById: body.uploadedById || null,
        code,
        link,
        name,
        ...(code === 'education_document' && {
          diplomaSerialNumber,
          number,
          issueDate: issueDate ? new Date(issueDate) : null,
        }),
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
