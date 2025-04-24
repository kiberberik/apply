import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const documents = await prisma.requiredDocument.findMany({
      where: { isDeleted: false },
    });

    // Преобразуем JSON строки обратно в массивы
    const documentsWithArrays = documents.map((doc) => ({
      ...doc,
      countries: JSON.parse(doc.countries || '[]'),
      academicLevels: JSON.parse(doc.academicLevels || '[]'),
      studyTypes: JSON.parse(doc.studyTypes || '[]'),
      ageCategories: JSON.parse(doc.ageCategories || '[]'),
    }));

    return NextResponse.json(documentsWithArrays);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { countries, academicLevels, studyTypes, ageCategories, ...documentData } = body;

    // Создаем документ с JSON строками
    const document = await prisma.requiredDocument.create({
      data: {
        ...documentData,
        countries: JSON.stringify(countries || []),
        academicLevels: JSON.stringify(academicLevels || []),
        studyTypes: JSON.stringify(studyTypes || []),
        ageCategories: JSON.stringify(ageCategories || []),
      },
    });

    // Возвращаем документ с преобразованными массивами
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
