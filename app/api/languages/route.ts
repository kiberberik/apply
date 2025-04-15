import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      orderBy: {
        code: 'asc',
      },
    });
    return NextResponse.json(languages);
  } catch (error) {
    console.error('Ошибка при получении языков:', error);
    return NextResponse.json({ error: 'Ошибка при получении языков' }, { status: 500 });
  }
}
