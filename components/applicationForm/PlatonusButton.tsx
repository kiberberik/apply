'use client';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useEducationalStore } from '@/store/useEducationalStore';
import { Document } from '@prisma/client';
import { toast } from 'react-toastify';
import { getDocumentBase64 } from '@/lib/getDocumentBase64';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'; // legacy — совместимость

pdfjsLib.GlobalWorkerOptions.workerSrc = `pdfjs-dist/build/pdf.worker.js`;

// export const formatDate = (dateString: string) => (dateString ? dateString.slice(0, 10) : '');
export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const convertPdfToJpegBase64 = async (pdfUrl: string): Promise<string> => {
  const loadingTask = pdfjsLib.getDocument(pdfUrl);
  const pdf = await loadingTask.promise;

  const page = await pdf.getPage(1); // первая страница
  const scale = 1; // увеличь до 3-4 при необходимости качества
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderContext = {
    canvasContext: context!,
    viewport,
  };

  await page.render(renderContext).promise;

  // Конвертируем canvas в JPEG base64
  const jpegBase64 = canvas.toDataURL('image/jpeg'); // default quality = 92%

  return jpegBase64; // data:image/jpeg;base64,...
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PlatonusButton = ({ application }: { application: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { getEducationalProgramDetails } = useEducationalStore();

  // console.log('application', application);
  const handleSendToPlatonus = async () => {
    setIsLoading(true);
    try {
      let filePath;
      let contractBase64 = null;
      if (application?.trustMeId) {
        try {
          const res = await fetch(
            `/api/trustme/download-contract?documentId=${application.trustMeId}`,
          );
          const data = await res.json();
          // console.log('contract: ', data);
          if (data.success) {
            filePath = data?.filePath;
            toast.info('Подписанный контракт успешно загружен из TrustMe');
            // Скачиваем файл и конвертируем в base64
            if (filePath) {
              try {
                // Получаем PDF через новый API-роут
                const fileRes = await fetch('/api/contracts/get-by-path', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ filePath: filePath.replace('/private/contracts/', '') }),
                });
                if (fileRes.ok) {
                  const arrayBuffer = await fileRes.arrayBuffer();
                  contractBase64 = `data:application/pdf;base64,${Buffer.from(arrayBuffer).toString('base64')}`;
                }
              } catch {}
            }
          } else {
            toast.error(data.error || 'Ошибка при загрузке контракта из TrustMe');
          }
        } catch {
          toast.error('Ошибка при обращении к TrustMe API');
        }
      } else {
        // Если нет trustMeId, пробуем взять контракт оффлайн
        const contractLinks = application?.contractFileLinks;
        let offlineFile = null;
        if (Array.isArray(contractLinks) && contractLinks.length > 0) {
          offlineFile = contractLinks[0];
        } else if (typeof contractLinks === 'string') {
          try {
            const arr = JSON.parse(contractLinks);
            if (Array.isArray(arr) && arr.length > 0) offlineFile = arr[0];
          } catch {}
        }
        if (offlineFile) {
          try {
            const fileRes = await fetch('/api/contracts/get-by-path', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filePath: offlineFile }),
            });
            if (fileRes.ok) {
              const arrayBuffer = await fileRes.arrayBuffer();
              contractBase64 = `data:application/pdf;base64,${Buffer.from(arrayBuffer).toString('base64')}`;
              toast.info('Оффлайн контракт успешно добавлен');
            } else {
              toast.error('Не удалось получить оффлайн контракт');
            }
          } catch {
            toast.error('Ошибка при получении оффлайн контракта');
          }
        }
      }

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
      const photoDocUrl = `${process.env.NEXT_PUBLIC_APP_URL}${photoDoc.link?.trim()}`;
      const base64Image = await convertPdfToJpegBase64(photoDocUrl);
      // console.log('JPEG base64:', base64Image);

      // console.log('photoDocUrl: ', photoDocUrl);

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
        {
          code: 'admission_fee',
          type: 174,
          name: `${application.applicant.surname}_${application.applicant.givennames}_вступительный_взнос`,
        },
        {
          code: 'military',
          type: 4,
          name: `${application.applicant.surname}_${application.applicant.givennames}_скан-копия_приписного`,
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

      if (contractBase64) {
        documents.push({
          type: 48,
          name: `${application.applicant.surname}_${application.applicant.givennames}_договор_о_присоединении.pdf`,
          contentType: 'application/pdf',
          data: contractBase64,
        });
      }

      if (base64Image) {
        documents.push({
          type: 12,
          name: `photo.jpeg`,
          contentType: 'application/image',
          data: base64Image,
        });
      }

      const payload = {
        applicant: {
          firstName: application.applicant.givennames ?? '',
          lastName: application.applicant.surname ?? '',
          patronymic: application.applicant.patronymic ?? '',
          firstNameEn: photoDoc?.additionalInfo1 ?? '',
          lastNameEn: photoDoc?.additionalInfo2 ?? '',
          mobilePhone: application.applicant.phone ?? '',
          // email: '', //application.applicant.email ?? '',
          additionalEmail: application.applicant.email ?? '', // new
          contractNumber: application?.contractNumber, // new
          contractDate: application?.submittedAt, // new
          address: application.applicant.addressRegistration ?? '',
          livingAddress: application.applicant.addressResidential ?? '',
          iin: application.applicant.identificationNumber ?? '',
          birthDate: formatDate(application.applicant.birthDate),
          citizenshipId: Number(application.applicant.citizenship),
          icType: application.applicant.documentType == 'PASSPORT' ? 2 : 1,
          icDepartmentID: Number(application.applicant.documentIssuingAuthority),
          icNumber: application.applicant.documentNumber,
          icSeries: 'IDKAZ',
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
          educationDocAwardedDate: formatDate(edDoc?.issueDate), // new
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
        {isLoading ? (
          <svg
            className="h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        ) : (
          'Platonus'
        )}
      </Button>
    </div>
  );
};

export default PlatonusButton;
