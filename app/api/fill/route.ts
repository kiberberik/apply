// app/api/fill/route.ts
import { fillPdfPlaceholders } from '@/lib/pdfFill';
import path from 'path';
import { NextResponse } from 'next/server';
import { Role, StudyType, Document } from '@prisma/client';
import dateUtils from '@/lib/dateUtils';
import { checkServerAccess } from '@/lib/serverAuth';
import countries from '@/data/countries.json';
import platonusIds from '@/data/platonusIds.json';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // если нужно всегда получать свежие данные

export async function POST(req: Request) {
  const hasAccess = await checkServerAccess(Role.CONSULTANT);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }
  const tAcademicLevel = getTranslations('AcademicLevel');
  const tStudyingLanguage = getTranslations('SupportLanguages');

  const body = await req.json();
  const { data } = body;

  const consultant = await prisma.user.findFirst({
    where: {
      id: data.consultantId,
    },
  });
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
    email: data.applicant.email?.toLowerCase() as string,
    address_residential: data.applicant.addressResidential as string,
    address_registration: data.applicant.addressRegistration as string,
    representative_fullname: data.representative
      ? `${data.representative.surname || ''} ${data.representative.givennames || ''} ${data.representative.patronymic || ''}`.trim()
      : '',
    representative_identification_number: data.representative?.identificationNumber || '',
    representative_doc_type:
      data.representative?.relationshipDegree == 'PARENT'
        ? 'Свидетельство о рождении'
        : data.representative?.relationshipDegree == 'GUARDIAN'
          ? 'Документ на опекунство'
          : data.representative?.relationshipDegree == 'TRUSTEE'
            ? 'Доверенность'
            : '',
    representative_doc_number:
      data.documents?.find((doc: Document) => doc.code === 'representative_document')?.number || '',
    representative_doc_issuing_authority:
      data.documents?.find((doc: Document) => doc.code === 'representative_document')
        ?.issuingAuthority || '',
    representative_doc_issue_date:
      dateUtils.formatDateForDisplay(
        data.documents?.find((doc: Document) => doc.code === 'representative_document')?.issueDate,
      ) || '',
    representative_doc_expiry_date:
      dateUtils.formatDateForDisplay(
        data.documents?.find((doc: Document) => doc.code === 'representative_document')
          ?.expirationDate,
      ) || '',
    representative_relationship_degree: data.representative?.relationshipDegree || '',
    representative_email: data.representative?.email || '',
    representative_phone: data.representative?.phone || '',
    representative_address_residential: data.representative?.addressResidential || '',
    representative_address_registration: data.representative?.addressRegistration || '',
    is_dorm_needs: Boolean(data.details.isDormNeeds) == true ? 'Нуждаюсь' : 'Не нуждаюсь',
    academic_level: (await tAcademicLevel)(data.details.academicLevel as string) as string,
    edu_group_name: data.details.educationalProgram.group as string,
    edu_group_code: data.details.educationalProgram.groupCode as string,
    edu_program_name: data.details.educationalProgram.name as string,
    edu_program_code: data.details.educationalProgram.code as string,
    edu_program_duration: data.details.educationalProgram.duration as string,
    edu_program_price: data.details.educationalProgram.costPerCredit as string,
    studying_language: (await tStudyingLanguage)(data.details.studyingLanguage as string) as string,
    application_check: '+',
    identity_document: '+',
    admission_fee_check: data.documents?.find((doc: Document) => doc.code === 'admission_fee')
      ?.isDelivered
      ? '+'
      : '-',
    photo_check: data.documents?.find((doc: Document) => doc.code === 'photo')?.isDelivered
      ? '+'
      : '-',
    medical_certificate_check: data.documents?.find(
      (doc: Document) => doc.code === 'medical_certificate_075u',
    )?.isDelivered
      ? '+'
      : '-',
    vaccination_check: data.documents?.find((doc: Document) => doc.code === 'vaccination')
      ?.isDelivered
      ? '+'
      : '-',
    diploma_check: data.documents?.find((doc: Document) => doc.code === 'education_document')
      ?.isDelivered
      ? '+'
      : '-',
    diploma_series:
      data.documents?.find((doc: Document) => doc.code === 'education_document')
        ?.diplomaSerialNumber || '',
    diploma_number:
      data.documents?.find((doc: Document) => doc.code === 'education_document')?.number || '',
    diploma_issue_date: dateUtils.formatDateForDisplay(
      data.documents?.find((doc: Document) => doc.code === 'education_document')?.issueDate || '',
    ),
    ent_number:
      data.documents?.find((doc: Document) => doc.code === 'ent_certificate')?.number || '',
    ent_check: data.documents?.find((doc: Document) => doc.code === 'ent_certificate')?.isDelivered
      ? '+'
      : '-',
    grant_number:
      data.documents?.find((doc: Document) => doc.code === 'grant_certificate')?.number || '',
    grant_check: data.documents?.find((doc: Document) => doc.code === 'grant_certificate')
      ?.isDelivered
      ? '+'
      : '-',
    id_card_check: '+',
    // data.documents?.find((doc: Document) => doc.code === 'identity_document')
    //   ?.isDelivered
    //   ? '+'
    //   : '-',
    preferential_doc_check: data.documents?.find(
      (doc: Document) => doc.code === 'preferential_document',
    )?.isDelivered
      ? '+'
      : '-',
    ielts_check: data.documents?.find(
      (doc: Document) => doc.code === 'international_language_certificate',
    )?.isDelivered
      ? '+'
      : '-',
    motivation_letter_check: data.documents?.find(
      (doc: Document) => doc.code === 'motivation_letter',
    )?.isDelivered
      ? '+'
      : '-',
    qaztest_check: data.documents?.find((doc: Document) => doc.code === 'kaztest_certificate')
      ?.isDelivered
      ? '+'
      : '-',
    recommendational_check: data.documents?.find(
      (doc: Document) => doc.code === 'recommendation_letter',
    )?.isDelivered
      ? '+'
      : '-',
    military_check: data.documents?.find((doc: Document) => doc.code === 'military')?.isDelivered
      ? '+'
      : '-',
    consultant: consultant?.name || '',
  };

  // console.log('convertedData', convertedData);

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

  // currentTemplate = 'public/template-docs/test.pdf';

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
