// ts-ignore
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exportApplicationsToSheets } from '@/lib/googleSheets';
import countries from '@/data/countries.json';
import platonusIds from '@/data/platonusIds.json';
export async function POST(request: Request) {
  try {
    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: 'Необходимо указать даты начала и конца периода' },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Получаем все заявки с нужными связями
    const applications = await prisma.application.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        isDeleted: false,
      },
      include: {
        applicant: true,
        representative: true,
        details: {
          include: {
            educationalProgram: {
              include: {
                group: true,
              },
            },
          },
        },
        documents: true,
        Log: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        consultant: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Формируем массив для экспорта
    const exportData = applications.map((app) => {
      // Получаем последний статус
      const latestLog = app.Log && app.Log.length > 0 ? app.Log[0] : null;
      // Документы по типам
      type Doc = {
        type: string;
        link?: string;
        number?: string;
        diplomaSerialNumber?: string;
        issueDate?: Date | string | null;
        expirationDate?: Date | string | null;
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const getDoc = (code: string) => app.documents.find((d: Doc) => String(d.code) === code);
      const getDocLink = (code: string) =>
        getDoc(code)
          ? process.env.NEXT_PUBLIC_APP_URL
            ? process.env.NEXT_PUBLIC_APP_URL + getDoc(code)?.link
            : getDoc(code)?.link || ''
          : '';
      const getDocNumber = (code: string) => getDoc(code)?.number || '';
      const getDocSerial = (code: string) => getDoc(code)?.diplomaSerialNumber || '';
      const getDocIssueDate = (code: string) => {
        const doc = getDoc(code);
        return doc?.issueDate ? new Date(doc.issueDate).toLocaleDateString('ru-RU') : '';
      };
      // applicantCitizenship из data/countries.json

      // ... можно добавить дополнительные геттеры по необходимости

      return {
        // Application
        createdAt: app.createdAt ? new Date(app.createdAt).toLocaleString('ru-RU') : '',
        submittedAt: app.submittedAt ? new Date(app.submittedAt).toLocaleString('ru-RU') : '',
        terminatedAt: app.terminatedAt ? new Date(app.terminatedAt).toLocaleString('ru-RU') : '',
        // terminateContractFileLinks: app.terminateContractFileLinks || '',
        contractSignType: app.contractSignType || '',
        contractLanguage: app.contractLanguage || '',
        // contractFileLinks: app.contractFileLinks || '',
        contractNumber: app.contractNumber || '',
        // trustMeId: app.trustMeId || '',
        trustMeUrl: app.trustMeUrl || '',
        // trustMeFileName: app.trustMeFileName || '',
        currentStatus: latestLog?.statusId || '',
        consultantName: app.consultant?.name || '',
        // Applicant

        applicantCitizenship:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          countries.find((c: any) => c.id == app.applicant?.citizenship)?.ru || '',
        applicantDocumentType: app.applicant?.documentType || '',
        applicantDocumentNumber: app.applicant?.documentNumber || '',
        applicantDocumentIssuer:
          platonusIds.icdepartments.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (d: any) => d.id == app.applicant?.documentIssuingAuthority,
          )?.ru || '',
        applicantDocumentIssueDate: app.applicant?.documentIssueDate
          ? new Date(app.applicant.documentIssueDate).toLocaleDateString('ru-RU')
          : '',
        applicantDocumentExpiryDate: app.applicant?.documentExpiryDate
          ? new Date(app.applicant.documentExpiryDate).toLocaleDateString('ru-RU')
          : '',
        applicantIIN: app.applicant?.identificationNumber || '',
        applicantSurname: app.applicant?.surname || '',
        applicantName: app.applicant?.givennames || '',
        applicantPatronymic: app.applicant?.patronymic || '',
        applicantBirthDate: app.applicant?.birthDate
          ? new Date(app.applicant.birthDate).toLocaleDateString('ru-RU')
          : '',
        applicantBirthPlace: app.applicant?.birthPlace || '',
        applicantEmail: app.applicant?.email || '',
        applicantPhone: app.applicant?.phone || '',
        applicantAddressResidential: app.applicant?.addressResidential || '',
        applicantAddressRegistration: app.applicant?.addressRegistration || '',
        // Representative
        representativeCitizenship: app.representative?.citizenship || '',
        representativeDocumentType: app.representative?.documentType || '',
        representativeDocumentNumber: app.representative?.documentNumber || '',
        representativeDocumentIssuer:
          platonusIds.icdepartments.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (d: any) => d.id == app.representative?.documentIssuingAuthority,
          )?.ru || '',
        representativeDocumentIssueDate: app.representative?.documentIssueDate
          ? new Date(app.representative.documentIssueDate).toLocaleDateString('ru-RU')
          : '',
        representativeDocumentExpiryDate: app.representative?.documentExpiryDate
          ? new Date(app.representative.documentExpiryDate).toLocaleDateString('ru-RU')
          : '',
        representativeIIN: app.representative?.identificationNumber || '',
        representativeSurname: app.representative?.surname || '',
        representativeName: app.representative?.givennames || '',
        representativePatronymic: app.representative?.patronymic || '',
        representativeEmail: app.representative?.email || '',
        representativePhone: app.representative?.phone || '',
        representativeAddressResidential: app.representative?.addressResidential || '',
        representativeAddressRegistration: app.representative?.addressRegistration || '',
        representativeRelationshipDegree: app.representative?.relationshipDegree || '',
        // Details
        studyType: app.details?.type || '',
        academicLevel: app.details?.academicLevel || '',
        studyingLanguage: app.details?.studyingLanguage || '',
        educationalProgramGroupName: app.details?.educationalProgram?.group?.name_rus || '',
        educationalProgramGroupCode: app.details?.educationalProgram?.group?.code || '',
        educationalProgramName: app.details?.educationalProgram?.name_rus || '',
        educationalProgramCode: app.details?.educationalProgram?.code || '',
        isDormNeeds: app.details?.isDormNeeds ? 'Да' : 'Нет',
        // Документы (пример для диплома/аттестата)
        diplomaLink: getDocLink('education_document'),
        diplomaSerial: getDocSerial('education_document'),
        diplomaNumber: getDocNumber('education_document'),
        diplomaIssueDate: getDocIssueDate('education_document'),
        admission_fee: getDocLink('admission_fee'),
        ent_certificate: getDocLink('ent_certificate'),
        ent_certificate_number: getDocNumber('ent_certificate'),
        grant_certificate: getDocLink('grant_certificate'),
        identity_document: getDocLink('identity_document'),
        representative_document: getDocLink('representative_document'),
        representative_document_number: getDocNumber('representative_document'),
        representative_document_issue_date: getDocIssueDate('representative_document'),
        medical_certificate_075u: getDocLink('medical_certificate_075u'),
        vaccination: getDocLink('vaccination'),
        preferential_document: getDocLink('preferential_document'),
        military: getDocLink('military'),
        motivation_letter: getDocLink('motivation_letter'),
        recommendation_letter: getDocLink('recommendation_letter'),
        international_language_certificate: getDocLink('international_language_certificate'),
        photo: getDocLink('photo'),
        kaztest_certificate: getDocLink('kaztest_certificate'),

        // ... добавить остальные документы по аналогии
      };
    });

    const result = await exportApplicationsToSheets(exportData);

    return NextResponse.json({
      success: true,
      message: `Экспортировано ${exportData.length} заявок в Google Sheets`,
      count: exportData.length,
      result,
    });
  } catch (error) {
    console.error('POST /api/applications/export error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при экспорте заявок',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
