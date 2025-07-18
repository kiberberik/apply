'use client';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useEducationalStore } from '@/store/useEducationalStore';
import { Document } from '@prisma/client';
import { toast } from 'react-toastify';
import { getDocumentBase64 } from '@/lib/getDocumentBase64';

// export const formatDate = (dateString: string) => (dateString ? dateString.slice(0, 10) : '');
export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PlatonusButton = ({ application }: { application: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { getEducationalProgramDetails } = useEducationalStore();

  console.log('application', application);
  const handleSendToPlatonus = async () => {
    setIsLoading(true);
    try {
      const program = await getEducationalProgramDetails(application.details.educationalProgram.id);
      if (!program) {
        throw new Error('Не удалось получить данные образовательного курса');
      }
      const edDoc = application?.documents?.find(
        (doc: Document) => doc?.code?.trim() === 'education_document',
      );
      const entDoc = application?.documents?.find(
        (doc: Document) => doc?.code?.trim() === 'ent_certificate',
      );
      const photoDoc = application?.documents?.find(
        (doc: Document) => doc?.code?.trim() === 'photo',
      );

      const documentConfigs = [
        {
          code: 'identity_document',
          type: 1,
          name: `${application.applicant.surname}_${application.applicant.givennames}_удостоверение`,
        },
        {
          code: 'education_document',
          type: 8,
          name: `${application.applicant.surname}_${application.applicant.givennames}_образование`,
        },
        {
          code: 'education_document',
          type: 9,
          name: `${application.applicant.surname}_${application.applicant.givennames}_приложение`,
        },
        {
          code: 'ent_certificate',
          type: 5,
          name: `${application.applicant.surname}_${application.applicant.givennames}_ЕНТ`,
        },
        {
          code: 'international_language_certificate',
          type: 46,
          name: `${application.applicant.surname}_${application.applicant.givennames}_английский`,
        },
        {
          code: 'employment_certificate',
          type: 45,
          name: `${application.applicant.surname}_${application.applicant.givennames}_справка`,
        },
        {
          code: 'medical_certificate_075u',
          type: 10,
          name: `${application.applicant.surname}_${application.applicant.givennames}_075у+флюра`,
        },
        {
          code: 'vaccination',
          type: 43,
          name: `${application.applicant.surname}_${application.applicant.givennames}_063`,
        },
        {
          code: 'grant_certificate',
          type: 30,
          name: `${application.applicant.surname}_${application.applicant.givennames}_грант`,
        },
        {
          code: 'kaztest_certificate',
          type: 172,
          name: `${application.applicant.surname}_${application.applicant.givennames}_казтест`,
        },
      ];

      const documents: {
        type: number;
        name: string;
        contentType: string;
        data: string;
      }[] = [];

      for (const { code, type, name } of documentConfigs) {
        const base64 = await getDocumentBase64(application, code);
        if (base64) {
          documents.push({
            type,
            name: `${name}.pdf`,
            contentType: 'application/pdf',
            data: base64,
          });
        }
      }

      console.log('photoDoc: ', photoDoc);
      const payload = {
        applicant: {
          firstName: application.applicant.givennames ?? '',
          lastName: application.applicant.surname ?? '',
          patronymic: application.applicant.patronymic ?? '',
          firstNameEn: photoDoc?.additionalInfo1 ?? '',
          lastNameEn: photoDoc?.additionalInfo2 ?? '',
          mobilePhone: application.applicant.phone ?? '',
          email: application.applicant.email ?? '',
          address: application.applicant.addressRegistration ?? '',
          livingAddress: application.applicant.addressResidential ?? '',
          iin: application.applicant.identificationNumber ?? '',
          birthDate: formatDate(application.applicant.birthDate),
          citizenshipId: Number(application.applicant.citizenship),
          icType: application.applicant.documentType == 'PASSPORT' ? 2 : 1,
          icDepartmentID: Number(application.applicant.documentIssuingAuthority),
          icNumber: application.applicant.documentNumber,
          icFinishDate: formatDate(application.applicant.documentExpiryDate),
          icDate: formatDate(application.applicant.documentIssueDate),
          studyFormID: program?.platonusStudyFormId ?? '',
          professionID: Number(program?.group?.platonusId) ?? null,
          specializationID: Number(program?.platonusId) ?? null,
          paymentFormID:
            application.details.type == 'PAID' ? 1 : application.details.type == 'GRANT' ? 2 : '', // 2 - гос. грант, 1 - договор
          grantType:
            application.details.type == 'PAID' ? -7 : application.details.type == 'GRANT' ? -4 : '', // -4 - гос грант, -7 собств. средства
          studyLanguageID:
            application.details.studyingLanguage == 'RUS'
              ? 1
              : application.details.studyingLanguage == 'KAZ'
                ? 2
                : application.details.studyingLanguage == 'ENG'
                  ? 3
                  : application.details.studyingLanguage == 'POLY'
                    ? 51
                    : 3, // 1 - русский, 2 - казахский, 3 - английский, 51 - полиязычный
          dormState: application.details.isDormNeeds ? 2 : 1, // 1 - не нуждается, 2 - нуждается
          seriyaAttestata: edDoc?.diplomaSerialNumber,
          nomerAttestata: edDoc.number,
          fNomerDiplom: edDoc.number,
          fSeriyaDiplom: edDoc?.diplomaSerialNumber,
          applicationStatusID: 3, // 3 - принято, 7 - отказано
          entIndividualCode: entDoc?.number ?? '',
          enterExamType: 1, // 1 - ент/кт
          graduatedFrom: 1, // 1 - школа, 2 - колледж, 3 - ВУЗ
        },
        parents: [
          {
            firstName: application?.representative?.givennames,
            lastName: application?.representative?.surname,
            patronymic: application?.representative?.patronymic,
            iin: application?.representative?.identificationNumber,
            address: application?.representative?.addressResidential,
            phone: application?.representative?.phone,
            email: application?.representative?.email,
            icType: application?.representative?.documentType == 'PASSPORT' ? 2 : 1, // 1 - удостоверение, 2 - паспорт
            icDepartment:
              application?.representative?.documentIssuingAuthority == 1
                ? 'МЮ РК'
                : application?.representative?.documentIssuingAuthority == 2
                  ? 'МВД РК'
                  : 'Другой',
            icNumber: application?.representative?.documentNumber,
            icDate: formatDate(application?.representative?.documentIssueDate),
            degreeOfRelatedness:
              application?.representative?.relationshipDegree == 'PARENT'
                ? 3
                : application?.representative?.relationshipDegree == 'GUARDIAN'
                  ? 5
                  : 4, // 3 - родитель, 4 - доверитель, 5 - опекун
          },
        ],
        documents: documents,
      };
      console.log('payload: ', payload);

      const platonusResponse = await fetch(
        `${process.env.NEXT_PUBLIC_PLATONUS_API_URL}/rest/ApplicantIntake/save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.PLATONUS_API_KEY}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await platonusResponse.json();
      if (data.studentID) {
        toast.success('Успешно записано в Platonus');
      } else {
        toast.error('Произошла ошибка при передаче данных в Platonus');
      }
      console.log('data: ', data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <Button
        className="flex-col bg-none px-4 py-2 hover:cursor-pointer"
        onClick={() => handleSendToPlatonus()}
        disabled={isLoading}
      >
        Platonus
      </Button>
    </div>
  );
};

export default PlatonusButton;
