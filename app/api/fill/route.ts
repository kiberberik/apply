// app/api/fill/route.ts
import { fillPdfPlaceholders } from '@/lib/pdfFill';
import path from 'path';
import { NextResponse } from 'next/server';
import { Role, StudyType } from '@prisma/client';
import dateUtils from '@/lib/dateUtils';
import { checkServerAccess } from '@/lib/serverAuth';
import countries from '@/data/countries.json';
import platonusIds from '@/data/platonusIds.json';

export const dynamic = 'force-dynamic'; // если нужно всегда получать свежие данные

export async function POST(req: Request) {
  const hasAccess = await checkServerAccess(Role.CONSULTANT);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }

  const body = await req.json();
  const { data } = body;
  console.log('data', data);
  const convertedData = {
    contract_number: data.contractNumber as string,
    created_at: dateUtils.formatDateForDisplay(data.submittedAt as string),
    surname: data.applicant.surname as string,
    givennames: data.applicant.givennames as string,
    patronymic: data.applicant.patronymic as string,
    fullname:
      (data.applicant.surname as string) +
      ' ' +
      (data.applicant.givennames as string) +
      ' ' +
      (data.applicant.patronymic as string),
    identification_number: data.applicant.identificationNumber as string,
    doc_type: data.applicant.documentType == 'ID_CARD' ? 'Удостоверение личности' : 'Паспорт',
    doc_number: data.applicant.documentNumber as string,
    doc_issuing_authority: data.applicant.documentIssuingAuthority
      ? (platonusIds.icdepartments.find(
          (department) => department.id == data.applicant.documentIssuingAuthority,
        )?.ru as string)
      : '',
    doc_issue_date: dateUtils.formatDateForDisplay(data.applicant.documentIssueDate as string),
    citizenship: data.applicant.citizenship
      ? (countries.find((country) => country.id == data.applicant.citizenship)?.ru as string)
      : '',
    phone: data.applicant.phone as string,
    address_residential: data.applicant.addressResidential as string,
    address_registration: data.applicant.addressRegistration as string,
    representative_fullname: data.representative
      ? `${data.representative.surname || ''} ${data.representative.givennames || ''} ${data.representative.patronymic || ''}`.trim()
      : '',
    representative_identification_number: data.representative?.identificationNumber || '',
    representative_doc_type: data.representative?.documentType || '',
    representative_doc_number: data.representative?.documentNumber || '',
    representative_doc_issue_date: data.representative?.documentIssueDate || '',
    representative_doc_expiry_date: data.representative?.documentExpiryDate || '',
    representative_doc_issuing_authority: data.representative?.documentIssuingAuthority || '',
    representative_relationship_degree: data.representative?.relationshipDegree || '',
    representative_email: data.representative?.email || '',
    representative_phone: data.representative?.phone || '',
    representative_address_residential: data.representative?.addressResidential || '',
    representative_address_registration: data.representative?.addressRegistration || '',
    is_dorm_needs: data.details.isDormsNeed ? 'Нуждаюсь' : 'Не нуждаюсь',
    academic_level: data.details.academicLevel as string,
    edu_group_name: data.details.educationalProgram.group as string,
    edu_program_name: data.details.educationalProgram.name as string,
    edu_program_code: data.details.educationalProgram.code as string,
    edu_program_duration: data.details.educationalProgram.duration as string,
    edu_program_price: data.details.educationalProgram.costPerCredit as string,
    studying_language:
      (data.details.studyingLanguage as string) === 'RUS'
        ? 'Русский'
        : (data.details.studyingLanguage as string) === 'KAZ'
          ? 'Қазақша'
          : 'English',
  };

  const paid_adult = 'public/template-docs/paid_adult_application_for_accession.pdf';
  const paid_minor = 'public/template-docs/paid_minor_application_for_accession.pdf';
  const conditional_adult = 'public/template-docs/conditional_adult_application_for_accession.pdf';
  const conditional_minor = 'public/template-docs/conditional_minor_application_for_accession.pdf';
  const nd_adult = 'public/template-docs/nd_adult_application_for_accession.pdf';
  const nd_minor = 'public/template-docs/nd_minor_application_for_accession.pdf';
  const grant_adult = 'public/template-docs/grant_adult_application_for_accession.pdf';
  const grant_minor = 'public/template-docs/grant_minor_application_for_accession.pdf';

  const isAdult = (birthDate: string) => {
    if (birthDate) {
      try {
        const birthDateObj = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
          age--;
        }
        return age >= 18;
      } catch (e) {
        console.error('Ошибка при расчете возраста:', e);
      }
    }
  };
  let currentTemplate;
  let templateName;
  switch (data.details.type) {
    case StudyType.PAID:
      currentTemplate = isAdult(data.applicant.birthDate) ? paid_adult : paid_minor;
      templateName = isAdult(data.applicant.birthDate) ? 'paid_adult' : 'paid_minor';
      break;
    case StudyType.CONDITIONAL:
      currentTemplate = isAdult(data.applicant.birthDate) ? conditional_adult : conditional_minor;
      templateName = isAdult(data.applicant.birthDate) ? 'conditional_adult' : 'conditional_minor';
      break;
    case StudyType.NONE_DEGREE:
      currentTemplate = isAdult(data.applicant.birthDate) ? nd_minor : nd_adult;
      templateName = isAdult(data.applicant.birthDate) ? 'nd_minor' : 'nd_adult';
      break;
    case StudyType.GRANT:
      currentTemplate = isAdult(data.applicant.birthDate) ? grant_adult : grant_minor;
      templateName = isAdult(data.applicant.birthDate) ? 'grant_adult' : 'grant_minor';
      break;
    default:
      currentTemplate = paid_adult;
      templateName = 'paid_adult';
      break;
  }

  currentTemplate = 'public/template-docs/test4.pdf';

  const templatePath = path.join(
    process.cwd(),
    currentTemplate,
    //'public/template-docs/test4.pdf',
  );
  const pdfBytes = await fillPdfPlaceholders(templatePath, convertedData);

  return new NextResponse(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${templateName}.pdf"`,
    },
  });
}
