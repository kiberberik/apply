import { fillPdfStudentIdCard } from '@/lib/pdfFillStudentIdCard';
import path from 'path';
import { NextResponse } from 'next/server';
import { checkServerAccess } from '@/lib/serverAuth';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const hasAccess = await checkServerAccess(Role.CONSULTANT);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }
  try {
    const data = await req.json();
    // console.log('data', data);

    const convertedData = {
      lastname: data.lastname,
      givennames: data.givennames,
      eduprogram: data.eduprogram,
      degree: data.degree,
      image: data.image,
      expiration: data.expiration,
    };

    const idCard = 'public/template-docs/student-id-card.pdf';
    const templatePath = path.join(process.cwd(), idCard);
    const pdfBytes = await fillPdfStudentIdCard(templatePath, convertedData);

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="id-card.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
