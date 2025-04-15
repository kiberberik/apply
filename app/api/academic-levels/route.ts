import { NextResponse } from 'next/server';
import { AcademicLevel } from '@prisma/client';

export async function GET() {
  try {
    const academicLevels = Object.values(AcademicLevel).map((value) => ({
      id: value,
      name: value,
    }));

    return NextResponse.json(academicLevels);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
