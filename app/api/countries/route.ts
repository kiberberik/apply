import { NextResponse } from 'next/server';
import { Country } from '@prisma/client';

export async function GET() {
  try {
    const countries = Object.values(Country).map((value) => ({
      id: value,
      name: value,
    }));

    return NextResponse.json(countries);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
