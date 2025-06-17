import { fillPdfPlaceholders } from '@/lib/pdfFill';
import path from 'path';
import { NextResponse } from 'next/server';
import { Role, Document } from '@prisma/client';
import dateUtils from '@/lib/dateUtils';
import { checkServerAccess } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic'; // если нужно всегда получать свежие данные

export async function POST(req: Request) {
  const hasAccess = await checkServerAccess(Role.CONSULTANT);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }

  const body = await req.json();
  const { data } = body;
  const createdAt = new Date();
  // console.log('data', data);
  const convertedData = {
    contract_number: data.contractNumber as string,
    created_at: dateUtils.formatDateForDisplay(createdAt.toISOString()),
    surname: data.applicant.surname as string,
    givennames: data.applicant.givennames as string,
    patronymic: data.applicant.patronymic as string,
    fullname:
      (data.applicant.surname as string) +
      ' ' +
      (data.applicant.givennames as string) +
      ' ' +
      (data.applicant.patronymic as string),
    representative_fullname: data.representative
      ? `${data.representative.surname || ''} ${data.representative.givennames || ''} ${data.representative.patronymic || ''}`.trim()
      : '',
    edu_program_name: data.details.educationalProgram.name as string,
    edu_program_code: data.details.educationalProgram.code as string,
    diploma_series:
      data.documents?.find((doc: Document) => doc.code === 'education_document')
        ?.diplomaSerialNumber || '',
    diploma_number:
      data.documents?.find((doc: Document) => doc.code === 'education_document')?.number || '',
  };

  // console.log('convertedData', convertedData);

  const termination_offline = 'public/template-docs/termination_offline.pdf';

  const templatePath = path.join(process.cwd(), termination_offline);
  const pdfBytes = await fillPdfPlaceholders(templatePath, convertedData);

  return new NextResponse(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="termination_offline.pdf"`,
    },
  });
}
