import { NextResponse } from 'next/server';
import { StudyType } from '@prisma/client';

export async function GET() {
  try {
    const studyTypes = Object.values(StudyType).map((value) => ({
      id: value,
      name: value,
    }));

    return NextResponse.json(studyTypes);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
