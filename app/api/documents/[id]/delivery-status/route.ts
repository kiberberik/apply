import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { isDelivered } = await request.json();
    const id = (await params).id;

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: { isDelivered },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document delivery status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
