import { NextResponse } from 'next/server';
import { AgeCategory } from '@prisma/client';

export async function GET() {
  try {
    const ageCategories = Object.values(AgeCategory).map((value) => ({
      id: value,
      name: value,
    }));

    return NextResponse.json(ageCategories);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
