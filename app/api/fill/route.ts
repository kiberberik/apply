// app/api/fill/route.ts
import { fillPdfPlaceholders } from '@/lib/pdfFill';
import path from 'path';
import { NextResponse } from 'next/server';
import { RelationshipDegree, StudyType } from '@prisma/client';
import dateUtils from '@/lib/dateUtils';

export const dynamic = 'force-dynamic'; // если нужно всегда получать свежие данные

export async function POST(req: Request) {
  const body = await req.json();
  const { data } = body;
  console.log('data', data);
  const convertedData = {
    contract: data.contractNumber as string,
    created: dateUtils.formatDateForDisplay(data.submittedAt as string),
    lastname: data.applicant.surname as string,
    name: data.applicant.givennames as string,
    surname: data.applicant.patronymic as string,
    fullname:
      (data.applicant.surname as string) +
      ' ' +
      (data.applicant.givennames as string) +
      ' ' +
      (data.applicant.patronymic as string),
    iin: data.applicant.identificationNumber as string,
    documents: data.applicant.documentType as string,
    numberdocuments: data.applicant.documentNumber as string,
    organviachi: data.applicant.documentIssuingAuthority as string,
    datevidachidocuments: dateUtils.formatDateForDisplay(
      data.applicant.documentIssueDate as string,
    ),
    grazhdanstvo: data.applicant.citizenship as string,
    telephon: data.applicant.phone as string,
    gorodiadresprozhivani: data.applicant.addressResidential as string,
    adresspropiski: data.applicant.addressRegistration as string,
    fullnameparents:
      (data.representative.surname as string) +
      ' ' +
      (data.representative.givennames as string) +
      ' ' +
      (data.representative.patronymic as string),
    iinparents: data.representative.identificationNumber as string,
    documentrodstvo:
      data.representative.relationshipDegree === RelationshipDegree.PARENT
        ? 'Удостоверение личности'
        : data.representative.relationshipDegree === RelationshipDegree.GUARDIAN
          ? 'Документ об опекунстве'
          : 'Нотариально заверенная доверенность',
    numrodsto: data.representative.representativeDocumentNumber as string,
    dateparents: dateUtils.formatDateForDisplay(
      data.representative.representativeDocumentIssueDate as string,
    ),
    telephonparents: data.representative.phone as string,
    obshejitie: data.details.isDormsNeed ? 'Нуждаюсь' : 'Не нуждаюсь',
    akadem: data.details.academicLevel as string,
    'gop.gop.label': data.details.educationalProgram.group as string,
    'gop.op.label': data.details.educationalProgram.name as string,
    'gop.op.code': data.details.educationalProgram.code as string,
    'gop.op.period': data.details.educationalProgram.duration as string,
    'gop.op.price': data.details.educationalProgram.costPerCredit as string,
    'gop.op.language':
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

  const templatePath = path.join(
    process.cwd(),
    currentTemplate,
    // 'public/template-docs/paid_minor_application_for_accession.pdf',
  );
  const pdfBytes = await fillPdfPlaceholders(templatePath, convertedData);

  return new NextResponse(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${templateName}.pdf"`,
    },
  });
}
