import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const body = await req.json();
    const { countries, academicLevels, studyTypes, ageCategories, ...documentData } = body;

    const document = await prisma.requiredDocument.update({
      where: { id },
      data: {
        ...documentData,
        countries: JSON.stringify(countries || []),
        academicLevels: JSON.stringify(academicLevels || []),
        studyTypes: JSON.stringify(studyTypes || []),
        ageCategories: JSON.stringify(ageCategories || []),
      },
    });

    return NextResponse.json({
      ...document,
      countries: JSON.parse(document.countries || '[]'),
      academicLevels: JSON.parse(document.academicLevels || '[]'),
      studyTypes: JSON.parse(document.studyTypes || '[]'),
      ageCategories: JSON.parse(document.ageCategories || '[]'),
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.isAdmin) {
    //   return new NextResponse('Unauthorized', { status: 401 });
    // }

    await prisma.requiredDocument.update({
      where: { id },
      data: { isDeleted: true },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
