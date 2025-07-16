'use client';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useEducationalStore } from '@/store/useEducationalStore';
import { Document } from '@prisma/client';
import { toast } from 'react-toastify';

export const formatDate = (dateString: string) => (dateString ? dateString.slice(0, 10) : '');

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
      const idDoc = application?.documents?.find(
        (doc: Document) => doc?.code === 'identity_document',
      );
      const idDocLink = idDoc?.link.trim();
      const fileUrl = `${process.env.NEXT_PUBLIC_APP_URL}${idDocLink}`;
      console.log('fileUrl: ', fileUrl);
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      // Шаг 2: Конвертируем Blob → base64
      const idDocBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result); // будет что-то вроде "data:application/pdf;base64,...."
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const edDoc = application?.documents?.find(
        (doc: Document) => doc?.code === 'education_document',
      );
      const entDoc = application?.documents?.find(
        (doc: Document) => doc?.code === 'ent_certificate',
      );
      //   const langDoc = application?.documents?.find(
      //     (doc: Document) => doc?.code === 'international_language_certificate',
      //   );

      //   console.log('edDoc: ', edDoc);
      const payload = {
        applicant: {
          firstName: application.applicant.givennames ?? '',
          lastName: application.applicant.surname ?? '',
          patronymic: application.applicant.patronymic ?? '',
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
          professionID: program?.group?.platonusId,
          specializationID: program?.platonusId ?? '',
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
                  : '', // 1 - русский, 2 - казахский, 3 - английский
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
        documents: [
          {
            type: 1,
            name: `${idDoc?.code}.pdf`,
            contentType: 'application/pdf',
            data: idDocBase64,
          },
        ],
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
