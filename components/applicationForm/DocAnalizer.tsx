import React, { useEffect, useState } from 'react';
import { OpenAIDocumentUpload } from '../docReader/OpenAIDocumentUpload';
import { CameraCapture } from '../docReader/CameraCapture';
import { OpenAIResponse } from '../docReader/OpenAIResponse';
import { useTranslations } from 'next-intl';
import { IdentificationDocumentType } from '@prisma/client';
import { useApplicationStore } from '@/store/useApplicationStore';
import { useFormContext, Path, PathValue } from 'react-hook-form';
import { formatToDatabaseDate } from '@/lib/dateUtils';
import { toast } from 'react-toastify';
import { useLogStore } from '@/store/useLogStore';
import countries from '@/data/countries.json';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TriangleAlert } from 'lucide-react';

interface DocAnalizerProps {
  id: string;
  activeTab?: string;
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
  setActiveTab: (activeTab: string) => void;
  isAdult: boolean;
  setFormValue: <T extends Record<string, unknown>, K extends Path<T>>(
    path: K,
    value: PathValue<T, K>,
    options?: { shouldValidate?: boolean; shouldDirty?: boolean; shouldTouch?: boolean },
  ) => void;
}
interface DocumentData {
  docType?: string;
  type?: string;
  givennames?: string;
  surname?: string;
  patronymic?: string;
  birthDate?: string;
  birthPlace?: string;
  documentNumber?: string;
  issueDate?: string;
  expirationDate?: string;
  issuingAuthority?: string;
  identificationNumber?: string;
  citizenship?: string;
  error?: string;
  documentIds?: string[];
  documentUrls?: string[];
  activeTab?: string;
  [key: string]: unknown;
}

const findCountryCode = (countryName: string): string => {
  if (!countryName) return '';

  const country = countries.find(
    (c) =>
      c.ru.toLowerCase() === countryName.toLowerCase() ||
      c.kz.toLowerCase() === countryName.toLowerCase() ||
      c.en.toLowerCase() === countryName.toLowerCase(),
  );

  return country ? country.id.toString() : '';
};

const DocAnalizer = ({ id, activeTab, setActiveTab, isAdult, setFormValue }: DocAnalizerProps) => {
  const [images, setImages] = useState<string[]>([]);
  const c = useTranslations('Common');
  const [openAIResponse, setOpenAIResponse] = useState<DocumentData | string>();
  const { fetchSingleApplication, updateSingleApplication } = useApplicationStore();
  const form = useFormContext();
  const [processingData, setProcessingData] = useState(false);
  const { getLatestLogByApplicationId } = useLogStore();
  const latestLog = getLatestLogByApplicationId(id);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenAIResponse = async (response: string | object, tabName?: string) => {
    try {
      setProcessingData(true);

      let parsedData: DocumentData | undefined;

      if (typeof response === 'string') {
        const jsonMatch = response.match(/```json\s*\n([\s\S]*?)\n```/);

        if (jsonMatch && jsonMatch[1]) {
          parsedData = JSON.parse(jsonMatch[1]) as DocumentData;
          console.log('Извлеченные данные из OpenAI (markdown):', parsedData);
        } else {
          try {
            parsedData = JSON.parse(response) as DocumentData;
            console.log('Извлеченные данные из OpenAI (прямой парсинг):', parsedData);
          } catch (error) {
            console.error('Ошибка парсинга JSON:', error);
            setOpenAIResponse(response);
            setProcessingData(false);
            return;
          }
        }
      } else {
        // Если response уже является объектом, используем его напрямую
        parsedData = response as DocumentData;
        console.log('Данные уже в формате объекта:', parsedData);
      }

      const currentTab = tabName || activeTab;
      let success = false;

      if (currentTab === 'representative' && !isAdult) {
        success = await applyDocumentDataToRepresentativeForm(parsedData);
      } else {
        success = await applyDocumentDataToApplicantForm(parsedData);
      }

      if (success) {
        setOpenAIResponse(parsedData);
        toast.success(c('dataProcessedSuccessfully'));
        setIsOpen(false);
      } else {
        setOpenAIResponse(typeof response === 'string' ? response : JSON.stringify(response));
        toast.error(c('dataProcessingError'));
      }
    } catch (error) {
      console.error('Ошибка при обработке ответа OpenAI:', error);
      setOpenAIResponse(typeof response === 'string' ? response : JSON.stringify(response));
      toast.error(c('dataProcessingError'));
    } finally {
      setProcessingData(false);
    }
  };

  const applyDocumentDataToApplicantForm = async (documentData: DocumentData) => {
    try {
      let docType: IdentificationDocumentType = IdentificationDocumentType.ID_CARD;

      if (documentData.docType === 'PASSPORT') {
        docType = IdentificationDocumentType.PASSPORT;
      }

      // let isCitizenshipKz = true;
      // if (
      //   documentData.citizenship &&
      //   documentData.citizenship.toLowerCase() !== 'казахстан' &&
      //   documentData.citizenship.toLowerCase() !== 'kazakhstan' &&
      //   documentData.citizenship.toLowerCase() !== 'қазақстан'
      // ) {
      //   isCitizenshipKz = false;
      // }

      const hasForm = form !== null && form !== undefined;
      const currentValues = hasForm ? form.getValues() : { applicant: {} };

      let documentFileLinks = null;
      if (documentData.documentUrls && documentData.documentUrls.length > 0) {
        documentFileLinks = JSON.stringify(documentData.documentUrls);
      } else if (documentData.documentIds && documentData.documentIds.length > 0) {
        documentFileLinks = JSON.stringify(documentData.documentIds);
      }

      const updateData = {
        applicant: {
          givennames: documentData.givennames || currentValues.applicant?.givennames || '',
          surname: documentData.surname || currentValues.applicant?.surname || '',
          patronymic: documentData.patronymic || currentValues.applicant?.patronymic || '',
          identificationNumber:
            documentData.identificationNumber ||
            currentValues.applicant?.identificationNumber ||
            '',
          birthPlace: documentData.birthPlace || currentValues.applicant?.birthPlace || '',
          birthDate: documentData.birthDate
            ? formatToDatabaseDate(documentData.birthDate)
            : undefined,
          // isCitizenshipKz: isCitizenshipKz,
          citizenship: findCountryCode(
            documentData.citizenship || currentValues.applicant?.citizenship || '',
          ),
          documentType: docType,
          documentNumber: documentData.documentNumber || '',
          documentIssueDate: documentData.issueDate
            ? formatToDatabaseDate(documentData.issueDate)
            : undefined,
          documentExpiryDate: documentData.expirationDate
            ? formatToDatabaseDate(documentData.expirationDate)
            : undefined,
          documentIssuingAuthority: documentData.issuingAuthority || '',
          documentFileLinks: documentFileLinks,
        },
      };

      // Обновляем значения формы
      setFormValue('applicant', updateData.applicant, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });

      if (id) {
        try {
          await updateSingleApplication(id, updateData);
          await fetchSingleApplication(id);
        } catch (error) {
          console.error('Ошибка при обновлении заявки:', error);
          return false;
        }
      }

      setActiveTab('applicant');
      return true;
    } catch (error) {
      console.error('Ошибка при применении данных к форме заявителя:', error);
      return false;
    }
  };

  const applyDocumentDataToRepresentativeForm = async (documentData: DocumentData) => {
    try {
      let docType: IdentificationDocumentType = IdentificationDocumentType.ID_CARD;

      if (documentData.docType === 'PASSPORT') {
        docType = IdentificationDocumentType.PASSPORT;
      }

      // let isCitizenshipKz = true;
      // if (documentData.citizenship && documentData.citizenship !== 'Казахстан') {
      //   isCitizenshipKz = false;
      // }

      const hasForm = form !== null && form !== undefined;
      const currentValues = hasForm ? form.getValues() : { representative: {} };

      let documentFileLinks = null;
      if (documentData.documentUrls && documentData.documentUrls.length > 0) {
        documentFileLinks = JSON.stringify(documentData.documentUrls);
      } else if (documentData.documentIds && documentData.documentIds.length > 0) {
        documentFileLinks = JSON.stringify(documentData.documentIds);
      }

      const updateData = {
        representative: {
          givennames: documentData.givennames || currentValues.representative?.givennames || '',
          surname: documentData.surname || currentValues.representative?.surname || '',
          patronymic: documentData.patronymic || currentValues.representative?.patronymic || '',
          identificationNumber:
            documentData.identificationNumber ||
            currentValues.representative?.identificationNumber ||
            '',
          // isCitizenshipKz: isCitizenshipKz,
          citizenship: findCountryCode(
            documentData.citizenship || currentValues.representative?.citizenship || '',
          ),
          documentType: docType,
          // Поля документа удостоверения личности
          documentNumber: documentData.documentNumber || '',
          documentIssueDate: documentData.issueDate
            ? formatToDatabaseDate(documentData.issueDate)
            : undefined,
          documentExpiryDate: documentData.expirationDate
            ? formatToDatabaseDate(documentData.expirationDate)
            : undefined,
          documentIssuingAuthority: documentData.issuingAuthority || '',
          documentFileLinks: documentFileLinks,
        },
      };

      setFormValue('representative', updateData.representative, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });

      if (id) {
        try {
          await updateSingleApplication(id, updateData);
          await fetchSingleApplication(id);
        } catch (error) {
          console.error('Ошибка при обновлении заявки:', error);
          return false;
        }
      }
      setActiveTab('representative');
      return true;
    } catch (error) {
      console.error('Ошибка при применении данных к форме представителя:', error);
      return false;
    }
  };

  const handleImageAdd = (newImages: string[]) => {
    const totalImages = images.length + newImages.length;
    if (totalImages > 10) {
      toast.error(c('maxImagesExceeded'));
      return;
    }
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleImageDelete = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    console.log('openAIResponse изменился:', openAIResponse);
  }, [openAIResponse]);

  if (
    latestLog?.statusId !== 'PROCESSING' &&
    latestLog?.statusId !== 'RE_PROCESSING' &&
    latestLog?.statusId !== 'DRAFT'
  ) {
    return null;
  }

  if (activeTab !== 'applicant' && activeTab !== 'representative') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-8 py-4 shadow-sm transition-colors hover:border-gray-300">
          <div className="flex w-full items-center justify-center gap-2">
            <Button
              variant="ghost"
              className="w-full px-3 text-center whitespace-normal hover:bg-transparent"
            >
              {c('uploadAndAnalyzeDocuments')}
            </Button>
          </div>
        </div>
      </DialogTrigger>
      <DialogTitle></DialogTitle>
      <DialogContent className="h-screen max-w-7xl overflow-y-auto p-0 md:h-auto">
        <div className="rounded-md bg-gray-100 p-4 md:p-8">
          <div className="mx-auto max-w-6xl space-y-4">
            <h2 className="text-center text-lg font-bold">
              {c(activeTab === 'applicant' ? 'applicant' : 'representative')}
            </h2>
            <p className="text-center text-sm text-gray-500">{c('uploadDocumentsDescription')}</p>
            <p className="flex items-center justify-start gap-2 text-center text-sm text-gray-500">
              <TriangleAlert className="h-4 w-4 shrink-0 cursor-help text-gray-500 transition-colors hover:text-gray-700" />
              {c('aiProcessingWarning')}
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&>*:first-child]:order-2 md:[&>*:first-child]:order-1 [&>*:last-child]:order-1 md:[&>*:last-child]:order-2">
              <OpenAIDocumentUpload
                onImagesAdd={handleImageAdd}
                images={images}
                onDelete={handleImageDelete}
              />
              <CameraCapture onImagesAdd={handleImageAdd} images={images} />
            </div>
            <OpenAIResponse
              images={images}
              onResponse={(response) => handleOpenAIResponse(response, activeTab)}
              applicationId={id}
              activeTab={activeTab}
              isProcessing={processingData}
            />

            {openAIResponse && typeof openAIResponse === 'object' && 'error' in openAIResponse && (
              <div className="mt-4 flex justify-center">
                <p className="text-2xl text-red-500">{c('criteriaError')}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocAnalizer;
