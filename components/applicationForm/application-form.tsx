/* eslint-disable */
'use client';

import * as z from 'zod';
import Details from './Details';
import DocAnalizer from './DocAnalizer';
import ApplicantForm from './Applicant';
import { Form } from '@/components/ui/form';
import { useTranslations } from 'next-intl';
import { RequiredDocs } from './RequiredDocs';
import { Button } from '@/components/ui/button';
import { useForm, Path, PathValue } from 'react-hook-form';
import RepresentativeForm from './Representative';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExtendedApplication } from '@/types/application';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UpdateApplicationRequest, useApplicationStore } from '@/store/useApplicationStore';
import { useLogStore } from '@/store/useLogStore';
import {
  RelationshipDegree,
  IdentificationDocumentType,
  StudyType,
  AcademicLevel,
  SupportLanguages,
  Role,
  ApplicationStatus,
} from '@prisma/client';
import { toast } from 'react-toastify';
import dateUtils from '@/lib/dateUtils';
import { Loader2 } from 'lucide-react';
import { hasAccess } from '@/lib/hasAccess';
import LogHistory from './LogHistory';
import Info from './Info';
import { useRequiredDocuments } from '@/store/useRequiredDocuments';
import { useDocumentStore } from '@/store/useDocumentStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEducationalStore } from '@/store/useEducationalStore';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { formSchema } from './formSchema';
import { generateContractNumber } from '@/lib/generateContractNumber';

interface ApplicationFormProps {
  id?: string;
}

export interface ApplicationWithConsultant extends Omit<ExtendedApplication, 'consultantId'> {
  consultantId?: string | null;
  consultant?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

// Определяем тип для использования в форме
type FormValues = any;

// Более строгая схема для проверки при отправке
const validateForSubmission = (
  data: FormValues,
  requiredDocuments: any[] | undefined,
  uploadedDocuments: any[] | undefined,
) => {
  // Проверяем обязательные поля для отправки
  if (!data.applicant) {
    // console.log('Не заполнены данные о заявителе');
    return { success: false, error: 'Не заполнены данные о заявителе' };
  }

  if (!data.representative) {
    // console.log('Не заполнены данные о заявителе');
    return { success: false, error: 'Не заполнены данные о представителе' };
  }

  if (!data.details) {
    // console.log('Не заполнены данные о программе обучения');
    return { success: false, error: 'Не заполнены данные о программе обучения' };
  }

  // Логирование данных формы
  // console.log('Проверка документов:');
  // console.log('data.documents:', data.documents);
  // console.log('uploadedDocuments:', uploadedDocuments);
  // console.log('requiredDocuments:', requiredDocuments);

  // Проверка загрузки обязательных документов
  if (!requiredDocuments || !uploadedDocuments) {
    // console.log('Не удалось получить информацию о документах');
    return { success: true }; // Пропускаем проверку документов, если данные недоступны
  }

  // Фильтруем документы, которые требуются для данного заявления
  const applicantData = data.applicant;
  const isKzCitizen = applicantData?.citizenship === 113;
  const birthDate = applicantData?.birthDate;
  let isAdult = true;

  if (birthDate) {
    try {
      const birthDateObj = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
      isAdult = age >= 18;
    } catch (e) {
      // console.error('Ошибка при расчете возраста:', e);
    }
  }

  try {
    // Фильтруем документы, которые требуются для данного заявления
    const filteredRequiredDocuments = requiredDocuments.filter((doc) => {
      // Проверка гражданства
      const matchesCountry =
        doc.countries &&
        doc.countries.some((country: any) => country === (isKzCitizen ? 'KAZAKHSTAN' : 'OTHER'));

      // Проверка возраста
      const matchesAgeCategory =
        doc.ageCategories &&
        doc.ageCategories.some((category: any) => category === (isAdult ? 'ADULT' : 'MINOR'));

      // Проверка академического уровня
      const matchesAcademicLevel =
        doc.academicLevels &&
        doc.academicLevels.some((level: any) => level === data.details?.academicLevel);

      // Проверка типа обучения
      const matchesStudyType =
        doc.studyTypes && doc.studyTypes.some((type: any) => type === data.details?.type);

      return matchesCountry && matchesAgeCategory && matchesAcademicLevel && matchesStudyType;
    });

    // console.log('Отфильтрованные обязательные документы:', filteredRequiredDocuments);

    // Проверка обязательных документов используя данные формы
    const requiredDocCodes = filteredRequiredDocuments
      .filter((doc) => doc.isScanRequired)
      .map((doc) => doc.code);

    // console.log('Коды обязательных документов:', requiredDocCodes);

    // Проверяем, что в data.documents есть все необходимые документы
    if (requiredDocCodes.length > 0) {
      const documentValues = data.documents || {};
      // console.log('Значения документов в форме:', documentValues);

      const missingDocs = requiredDocCodes.filter((code) => {
        // Проверяем наличие и непустое значение для кода документа
        return !documentValues[code] || documentValues[code] === '';
      });

      // console.log('Отсутствующие документы по форме:', missingDocs);

      if (missingDocs.length > 0) {
        // Находим имена отсутствующих документов
        const missingDocNames = missingDocs.map((code) => {
          const doc = filteredRequiredDocuments.find((d) => d.code === code);
          return doc?.name_rus || doc?.name_eng || doc?.name_kaz || code;
        });

        // console.log('Не загружены обязательные документы:', missingDocNames);
        return {
          success: false,
          error: `Не загружены обязательные документы: ${missingDocNames.join(', ')}`,
        };
      }
    }
  } catch (error) {
    // console.error('Ошибка при проверке документов:', error);
    // В случае ошибки пропускаем проверку документов
    return { success: true };
  }

  // console.log('Проверка документов успешно пройдена');
  return { success: true };
};

export default function ApplicationForm({ id }: ApplicationFormProps) {
  const c = useTranslations('Common');
  const { fetchSingleApplication, updateSingleApplication, singleApplication, isLoadingSingleApp } =
    useApplicationStore();
  const { createLog, fetchLogsByApplicationId, getLatestLogByApplicationId } = useLogStore();

  const tApplicant = useTranslations('Applicant');
  const tRepresentative = useTranslations('Representative');
  const tDetails = useTranslations('Details');
  const tDocuments = useTranslations('Documents');
  const tApplications = useTranslations('Applications');
  const tTrustMeStatus = useTranslations('TrustMeStatus');

  const latestLog = singleApplication?.id
    ? getLatestLogByApplicationId(singleApplication.id)
    : null;

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Попытка восстановить сохраненный таб из localStorage при инициализации
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem(`application-tab-${id}`);
      return savedTab || 'applicant';
    }
    return 'applicant';
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { user } = useAuthStore();

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [formValuesForSubmit, setFormValuesForSubmit] = useState<FormValues | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);

  const { getEducationalProgramDetails } = useEducationalStore();

  const [signatureMethod, setSignatureMethod] = useState<'online' | 'offline'>('online');
  const [signedContractFile, setSignedContractFile] = useState<File | null>(null);

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(
      () => ({
        applicant: singleApplication?.applicant
          ? {
              givennames: singleApplication.applicant.givennames || '',
              surname: singleApplication.applicant.surname || '',
              patronymic: singleApplication.applicant.patronymic || null,
              birthDate: singleApplication.applicant.birthDate
                ? dateUtils.formatToInputDate(singleApplication.applicant.birthDate)
                : '',
              birthPlace: singleApplication.applicant.birthPlace || '',
              // isCitizenshipKz: singleApplication.applicant.isCitizenshipKz || false,
              citizenship: singleApplication.applicant.citizenship || '',
              identificationNumber: singleApplication.applicant.identificationNumber || null,
              documentType: singleApplication.applicant.documentType || '',
              documentNumber: singleApplication.applicant.documentNumber || '',
              documentIssueDate: singleApplication.applicant.documentIssueDate
                ? dateUtils.formatToInputDate(singleApplication.applicant.documentIssueDate)
                : '',
              documentExpiryDate: singleApplication.applicant.documentExpiryDate
                ? dateUtils.formatToInputDate(singleApplication.applicant.documentExpiryDate)
                : '',
              documentIssuingAuthority: singleApplication.applicant.documentIssuingAuthority || '',
              documentFileLinks: singleApplication.applicant.documentFileLinks || '',
              email: singleApplication.applicant.email || '',
              phone: singleApplication.applicant.phone || '',
              addressResidential: singleApplication.applicant.addressResidential || '',
              addressRegistration: singleApplication.applicant.addressRegistration || '',
            }
          : {
              givennames: '',
              surname: '',
              patronymic: null,
              birthDate: '',
              birthPlace: '',
              // isCitizenshipKz: false,
              citizenship: '',
              identificationNumber: null,
              documentType: '',
              documentNumber: '',
              documentIssueDate: '',
              documentExpiryDate: '',
              documentIssuingAuthority: '',
              documentFileLinks: '',
              email: '',
              phone: '',
              addressResidential: '',
              addressRegistration: '',
            },
        representative: singleApplication?.representative
          ? {
              givennames: singleApplication.representative.givennames || '',
              surname: singleApplication.representative.surname || '',
              patronymic: singleApplication.representative.patronymic || null,
              // isCitizenshipKz: singleApplication.representative.isCitizenshipKz || false,
              citizenship: singleApplication.representative.citizenship || '',
              identificationNumber: singleApplication.representative.identificationNumber || null,
              documentType: singleApplication.representative.documentType || '',
              documentNumber: singleApplication.representative.documentNumber || '',
              documentIssueDate: singleApplication.representative.documentIssueDate
                ? dateUtils.formatToInputDate(singleApplication.representative.documentIssueDate)
                : '',
              documentExpiryDate: singleApplication.representative.documentExpiryDate
                ? dateUtils.formatToInputDate(singleApplication.representative.documentExpiryDate)
                : '',
              documentIssuingAuthority:
                singleApplication.representative.documentIssuingAuthority || '',
              documentFileLinks: singleApplication.representative.documentFileLinks || '',
              representativeDocumentNumber:
                singleApplication.representative.representativeDocumentNumber || '',
              representativeDocumentIssueDate: singleApplication.representative
                .representativeDocumentIssueDate
                ? dateUtils.formatToInputDate(
                    singleApplication.representative.representativeDocumentIssueDate,
                  )
                : '',
              representativeDocumentExpiryDate: singleApplication.representative
                .representativeDocumentExpiryDate
                ? dateUtils.formatToInputDate(
                    singleApplication.representative.representativeDocumentExpiryDate,
                  )
                : '',
              representativeDocumentIssuingAuthority:
                singleApplication.representative.representativeDocumentIssuingAuthority || '',
              representativeDocumentFileLinks:
                singleApplication.representative.representativeDocumentFileLinks || '',
              relationshipDegree: singleApplication.representative.relationshipDegree || 'PARENT',
              email: singleApplication.representative.email || '',
              phone: singleApplication.representative.phone || '',
              addressResidential: singleApplication.representative.addressResidential || '',
              addressRegistration: singleApplication.representative.addressRegistration || '',
              applicantId: singleApplication.representative.applicantId || '',
              id: singleApplication.representative.id || '',
            }
          : null,
        details: singleApplication?.details
          ? {
              type: singleApplication.details.type || '',
              academicLevel: singleApplication.details.academicLevel || '',
              isDormNeeds: singleApplication.details.isDormNeeds || false,
              studyingLanguage: singleApplication.details.studyingLanguage || '',
              educationalProgramId: singleApplication.details.educationalProgramId || '',
            }
          : {
              type: '',
              academicLevel: '',
              isDormNeeds: false,
              studyingLanguage: '',
              educationalProgramId: '',
            },
        contractLanguage: singleApplication?.contractLanguage || '',
        documents: singleApplication?.documents ? {} : null,
      }),
      [singleApplication],
    ),
  });

  const isSubmitted = Boolean(singleApplication?.submittedAt);
  const isReadOnly =
    (isSubmitted && user?.role === Role.USER) ||
    (isSubmitted &&
      user?.role === Role.CONSULTANT &&
      (latestLog?.statusId === 'NEED_SIGNATURE' ||
        latestLog?.statusId === 'CHECK_DOCS' ||
        latestLog?.statusId === 'NEED_DOCS')) ||
    (isSubmitted &&
      user?.role === Role.MANAGER &&
      (latestLog?.statusId === 'NEED_SIGNATURE' ||
        latestLog?.statusId === 'CHECK_DOCS' ||
        latestLog?.statusId === 'NEED_DOCS')) ||
    (isSubmitted &&
      user?.role === Role.ADMIN &&
      (latestLog?.statusId === 'NEED_SIGNATURE' ||
        latestLog?.statusId === 'CHECK_DOCS' ||
        latestLog?.statusId === 'NEED_DOCS'));

  // Мемоизация isApplicantAdult для предотвращения лишних рендеров
  const isApplicantAdult = useCallback(() => {
    const birthDateStr = form.getValues('applicant.birthDate');
    if (!birthDateStr) return false;

    try {
      const birthDate = new Date(birthDateStr);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      // Если день рождения еще не наступил в этом году, вычитаем 1
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age >= 18;
    } catch (e) {
      console.error('Ошибка при расчете возраста:', e);
      return false;
    }
  }, [form]);

  const [isAdult, setIsAdult] = useState(isApplicantAdult());

  useEffect(() => {
    if (isReadOnly) return;

    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });

    return () => subscription.unsubscribe();
  }, [form, isReadOnly]);

  // Отслеживание изменения даты рождения для определения совершеннолетия
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'applicant.birthDate') {
        const adultStatus = isApplicantAdult();
        setIsAdult(adultStatus);

        if (activeTab === 'representative' && adultStatus) {
          setActiveTab('applicant');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [activeTab, form, isApplicantAdult]);

  // Обновление формы при изменении данных в хранилище
  const previousAppRef = useRef<string | null>(null);

  useEffect(() => {
    if (!singleApplication) return;

    const applicationJson = JSON.stringify(singleApplication);
    if (previousAppRef.current === applicationJson) {
      return;
    }

    previousAppRef.current = applicationJson;

    if (!hasUnsavedChanges) {
      if (singleApplication.applicant) {
        const applicantData = {
          ...singleApplication.applicant,
          birthDate: singleApplication.applicant.birthDate
            ? dateUtils.formatToInputDate(singleApplication.applicant.birthDate)
            : '',
          documentIssueDate: singleApplication.applicant.documentIssueDate
            ? dateUtils.formatToInputDate(singleApplication.applicant.documentIssueDate)
            : '',
          documentExpiryDate: singleApplication.applicant.documentExpiryDate
            ? dateUtils.formatToInputDate(singleApplication.applicant.documentExpiryDate)
            : '',
        };

        form.setValue('applicant', applicantData as any, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }

      if (singleApplication.representative) {
        const representativeData = {
          ...singleApplication.representative,
          documentIssueDate: singleApplication.representative.documentIssueDate
            ? dateUtils.formatToInputDate(singleApplication.representative.documentIssueDate)
            : '',
          documentExpiryDate: singleApplication.representative.documentExpiryDate
            ? dateUtils.formatToInputDate(singleApplication.representative.documentExpiryDate)
            : '',
          representativeDocumentIssueDate: singleApplication.representative
            .representativeDocumentIssueDate
            ? dateUtils.formatToInputDate(
                singleApplication.representative.representativeDocumentIssueDate,
              )
            : '',
          representativeDocumentExpiryDate: singleApplication.representative
            .representativeDocumentExpiryDate
            ? dateUtils.formatToInputDate(
                singleApplication.representative.representativeDocumentExpiryDate,
              )
            : '',
        };

        form.setValue('representative', representativeData as any, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }

      if (singleApplication.details) {
        form.setValue(
          'details',
          {
            ...singleApplication.details,
          } as any,
          {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          },
        );

        form.setValue('contractLanguage', singleApplication.contractLanguage || '', {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }

      if (singleApplication.applicant?.birthDate) {
        setTimeout(() => setIsAdult(isApplicantAdult()), 0);
      }
    }
  }, [singleApplication, form, hasUnsavedChanges, isApplicantAdult]);

  const handleTabChange = (value: string) => {
    if (value === 'representative' && isAdult) {
      return;
    }
    setActiveTab(value);
    if (typeof window !== 'undefined' && id) {
      localStorage.setItem(`application-tab-${id}`, value);
    }
  };

  const handleSaveDraftClick = async () => {
    if (isReadOnly) return;
    try {
      const values = form.getValues();
      if (values.applicant) {
        if (!values.applicant.givennames) {
          console.warn('Applicant givennames is empty');
        }
        if (!values.applicant.surname) {
          console.warn('Applicant surname is empty');
        }
      } else {
        console.warn('No applicant data found in form values');
        if (singleApplication?.applicant) {
          values.applicant = {
            ...singleApplication.applicant,
            birthDate: dateUtils.formatToInputDate(singleApplication.applicant.birthDate),
            documentIssueDate: dateUtils.formatToInputDate(
              singleApplication.applicant.documentIssueDate,
            ),
            documentExpiryDate: dateUtils.formatToInputDate(
              singleApplication.applicant.documentExpiryDate,
            ),
          };
        } else {
          console.error('No applicant data available in form or application');
        }
      }
      const result = await saveApplicantFormData(values, false);
      if (result) {
        console.log('result', result);
        await fetchSingleApplication(id as string);

        // Обновляем данные формы сразу после сохранения
        const updatedApp = useApplicationStore.getState().singleApplication;
        if (updatedApp) {
          // Обновляем данные формы
          if (updatedApp.applicant) {
            form.setValue('applicant', {
              ...updatedApp.applicant,
              birthDate: updatedApp.applicant.birthDate
                ? dateUtils.formatToInputDate(updatedApp.applicant.birthDate)
                : '',
              documentIssueDate: updatedApp.applicant.documentIssueDate
                ? dateUtils.formatToInputDate(updatedApp.applicant.documentIssueDate)
                : '',
              documentExpiryDate: updatedApp.applicant.documentExpiryDate
                ? dateUtils.formatToInputDate(updatedApp.applicant.documentExpiryDate)
                : '',
            });
          }

          if (updatedApp.representative) {
            form.setValue('representative', {
              ...updatedApp.representative,
              documentIssueDate: updatedApp.representative.documentIssueDate
                ? dateUtils.formatToInputDate(updatedApp.representative.documentIssueDate)
                : '',
              documentExpiryDate: updatedApp.representative.documentExpiryDate
                ? dateUtils.formatToInputDate(updatedApp.representative.documentExpiryDate)
                : '',
              representativeDocumentIssueDate: updatedApp.representative
                .representativeDocumentIssueDate
                ? dateUtils.formatToInputDate(
                    updatedApp.representative.representativeDocumentIssueDate,
                  )
                : '',
              representativeDocumentExpiryDate: updatedApp.representative
                .representativeDocumentExpiryDate
                ? dateUtils.formatToInputDate(
                    updatedApp.representative.representativeDocumentExpiryDate,
                  )
                : '',
            });
          }

          if (updatedApp.details) {
            form.setValue('details', {
              ...updatedApp.details,
            });
            form.setValue('contractLanguage', updatedApp.contractLanguage || '');
          }
        }

        toast.success('Черновик сохранен успешно');
      } else {
        toast.error('Не удалось сохранить черновик');
      }
    } catch (error) {
      // console.error('Error in handleSaveDraftClick:', error);
      toast.error('Не удалось сохранить черновик');
    }
  };

  const saveApplicantFormData = async (data: FormValues, isSubmit: boolean) => {
    console.log(`Saving form data, isSubmit=${isSubmit}`, data);
    try {
      if (!id) {
        console.log('No ID provided, save canceled');
        return false;
      }

      // Добавляем локальную блокировку повторных отправок
      if (form.formState.isSubmitting) {
        // console.log(
        //   'Form is already being submitted in saveApplicantFormData, canceling duplicate submission',
        // );
        return false;
      }

      if (!data.applicant && singleApplication?.applicant) {
        // console.log('No applicant data in form, using application data');
        data.applicant = {
          ...singleApplication.applicant,
          birthDate: singleApplication.applicant.birthDate
            ? dateUtils.formatToInputDate(singleApplication.applicant.birthDate)
            : '',
          documentIssueDate: singleApplication.applicant.documentIssueDate
            ? dateUtils.formatToInputDate(singleApplication.applicant.documentIssueDate)
            : '',
          documentExpiryDate: singleApplication.applicant.documentExpiryDate
            ? dateUtils.formatToInputDate(singleApplication.applicant.documentExpiryDate)
            : '',
        };
      }

      if (!data.applicant) {
        // console.error('No applicant data available for saving');
        return false;
      }

      if (!isSubmit) {
        // Для черновиков пропускаем валидацию
        form.clearErrors();
      } else {
        // Для отправки проверяем документы
        const validationResult = validateForSubmission(
          data,
          useRequiredDocuments.getState().documents,
          useDocumentStore.getState().documents,
        );
        // console.log('Validation result in saveApplicantFormData:', validationResult);

        if (!validationResult.success) {
          toast.error(validationResult.error);
          // console.log('Document validation failed, submission canceled');
          return false;
        }
      }

      setHasUnsavedChanges(false);

      // console.log('Preparing request data');

      const contractNumber = isSubmit
        ? generateContractNumber(
            data.details?.academicLevel || AcademicLevel.BACHELORS,
            data.details?.type || StudyType.PAID,
            data.details?.educationalProgram?.duration || 0,
            data.applicant?.identificationNumber || data.applicant?.documentNumber || '',
          )
        : null;

      const requestData: UpdateApplicationRequest = {
        applicant: data.applicant
          ? {
              ...data.applicant,
              birthDate: data.applicant.birthDate
                ? new Date(data.applicant.birthDate).toISOString()
                : null,
              documentIssueDate: dateUtils.formatToDatabaseDate(data.applicant.documentIssueDate),
              documentExpiryDate: dateUtils.formatToDatabaseDate(data.applicant.documentExpiryDate),
            }
          : null,
        representative: data.representative
          ? {
              id: data.representative.id || undefined,
              email: data.representative.email,
              givennames: data.representative.givennames,
              patronymic: data.representative.patronymic,
              surname: data.representative.surname,
              phone: data.representative.phone,
              addressResidential: data.representative.addressResidential,
              addressRegistration: data.representative.addressRegistration,
              relationshipDegree: data.representative.relationshipDegree,
              // isCitizenshipKz: data.representative.isCitizenshipKz,
              citizenship: data.representative.citizenship,
              documentType: data.representative.documentType,
              identificationNumber: data.representative.identificationNumber,
              documentNumber: data.representative.documentNumber,
              documentIssueDate: dateUtils.formatToDatabaseDate(
                data.representative.documentIssueDate,
              ),
              documentExpiryDate: dateUtils.formatToDatabaseDate(
                data.representative.documentExpiryDate,
              ),
              documentIssuingAuthority: data.representative.documentIssuingAuthority,
              documentFileLinks: data.representative.documentFileLinks,
              representativeDocumentNumber: data.representative.representativeDocumentNumber,
              representativeDocumentIssueDate: dateUtils.formatToDatabaseDate(
                data.representative.representativeDocumentIssueDate,
              ),
              representativeDocumentExpiryDate: dateUtils.formatToDatabaseDate(
                data.representative.representativeDocumentExpiryDate,
              ),
              representativeDocumentIssuingAuthority:
                data.representative.representativeDocumentIssuingAuthority,
              representativeDocumentFileLinks: data.representative.representativeDocumentFileLinks,
            }
          : null,
        details: data.details
          ? {
              ...data.details,
            }
          : null,
        contractLanguage: data.contractLanguage || null,
        contractNumber: isSubmit ? contractNumber : !isSubmit ? data.contractNumber : null,
        submittedAt: isSubmit ? new Date().toISOString() : !isSubmit ? data.submittedAt : null,
      };

      if (isSubmit) {
        // Проверяем наличие других заявок от этого же заявителя за последние 6 месяцев
        try {
          const identificationNumber = data.applicant?.identificationNumber;

          if (identificationNumber) {
            const response = await fetch('/api/applications/check-duplicate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ identificationNumber }),
            });

            if (!response.ok) {
              // console.error('Ошибка при проверке дубликатов заявок');
            } else {
              const result = await response.json();

              if (result.hasDuplicate) {
                toast.error(
                  'У вас уже есть активная заявка за последние 6 месяцев. Дублирование заявок не допускается.',
                );
                return false;
              }
            }
          }
        } catch (error) {
          // console.error('Ошибка при проверке дубликатов заявок:', error);
        }
      }

      let selectedConsultant: any;

      // Получаем консультанта с наименьшей нагрузкой при отправке заявления
      if (isSubmit && !singleApplication?.consultantId) {
        try {
          // Получаем список консультантов из API
          const consultantsResponse = await fetch('/api/users?role=CONSULTANT');

          if (!consultantsResponse.ok) {
            // console.error('Не удалось получить список консультантов');
          } else {
            const consultants = await consultantsResponse.json();

            // Если есть консультанты
            if (consultants && consultants.length > 0) {
              // Получаем заявки в статусе PROCESSING для каждого консультанта
              const consultantsWithProcessingCount = await Promise.all(
                consultants.map(async (consultant: any) => {
                  // Логика подсчета заявок в обработке для каждого консультанта
                  const processingApplications =
                    consultant.consultedApplications?.filter((app: any) => {
                      // Проверяем, что у заявки последний лог имеет статус PROCESSING
                      const latestLog = app.Log?.[0];
                      return latestLog && latestLog.statusId === 'PROCESSING';
                    }) || [];

                  return {
                    id: consultant.id,
                    name: consultant.name,
                    email: consultant.email,
                    processingCount: processingApplications.length,
                  };
                }),
              );

              // Найдем консультанта с минимальным количеством заявок в обработке
              if (consultantsWithProcessingCount.length > 0) {
                const minProcessingCount = Math.min(
                  ...consultantsWithProcessingCount.map((c) => c.processingCount),
                );

                // Фильтруем консультантов с минимальным количеством заявок
                const consultantsWithMinProcessing = consultantsWithProcessingCount.filter(
                  (c) => c.processingCount === minProcessingCount,
                );

                // Выбираем случайного консультанта из списка с минимальной нагрузкой
                selectedConsultant =
                  consultantsWithMinProcessing[
                    Math.floor(Math.random() * consultantsWithMinProcessing.length)
                  ];

                console.log('Выбран консультант:', selectedConsultant);

                // Добавляем ID консультанта к данным заявки
                requestData.consultantId = selectedConsultant.id;
              }
            }
          }
        } catch (error) {
          console.error('Ошибка при выборе консультанта:', error);
        }
      }

      console.log('Request data prepared:', requestData);

      if (singleApplication) {
        previousAppRef.current = JSON.stringify(singleApplication);
      }

      console.log('Sending update request...');

      // Защита от повторных запросов
      let submissionInProgress = true;

      try {
        const result = await updateSingleApplication(id, requestData);
        if (result.error) {
          console.error('API error:', result.error);
          throw new Error(`Failed to save ${isSubmit ? 'submission' : 'draft'}`);
        }

        // Создаем лог при отправке заявления
        if (isSubmit) {
          try {
            await createLog({
              applicationId: id,
              statusId: 'PROCESSING',
              createdById: user?.id,
              description: `Consultant: ${selectedConsultant.name || ''} - ${selectedConsultant.email || ''}`,
            });
          } catch (logError) {
            console.warn('Failed to create log, but application was saved:', logError);
          }
        }

        console.log('Update successful, fetching updated application...');

        // Обновляем данные после сохранения, но только если процесс отправки еще активен
        if (submissionInProgress) {
          try {
            await fetchSingleApplication(id);

            // Восстанавливаем код обновления формы, но добавляем защиту от циклов
            const updatedApplication = singleApplication;
            if (
              updatedApplication &&
              JSON.stringify(updatedApplication) !== previousAppRef.current
            ) {
              // Устанавливаем флаг, что сейчас будет обновление формы программным путем
              setHasUnsavedChanges(false);

              // Обновляем applicant
              if (updatedApplication.applicant) {
                try {
                  const applicantData = {
                    ...updatedApplication.applicant,
                    birthDate: updatedApplication.applicant.birthDate
                      ? dateUtils.formatToInputDate(updatedApplication.applicant.birthDate)
                      : '',
                    documentIssueDate: updatedApplication.applicant.documentIssueDate
                      ? dateUtils.formatToInputDate(updatedApplication.applicant.documentIssueDate)
                      : '',
                    documentExpiryDate: updatedApplication.applicant.documentExpiryDate
                      ? dateUtils.formatToInputDate(updatedApplication.applicant.documentExpiryDate)
                      : '',
                  };
                  form.setValue('applicant', applicantData as any, {
                    shouldDirty: false,
                    shouldTouch: false,
                    shouldValidate: false,
                  });
                } catch (updateError) {
                  console.error('Error updating applicant data:', updateError);
                }
              }

              // Обновляем representative
              if (updatedApplication.representative) {
                try {
                  const representativeData = {
                    ...updatedApplication.representative,
                    documentIssueDate: updatedApplication.representative.documentIssueDate
                      ? dateUtils.formatToInputDate(
                          updatedApplication.representative.documentIssueDate,
                        )
                      : '',
                    documentExpiryDate: updatedApplication.representative.documentExpiryDate
                      ? dateUtils.formatToInputDate(
                          updatedApplication.representative.documentExpiryDate,
                        )
                      : '',
                    representativeDocumentIssueDate: updatedApplication.representative
                      .representativeDocumentIssueDate
                      ? dateUtils.formatToInputDate(
                          updatedApplication.representative.representativeDocumentIssueDate,
                        )
                      : '',
                    representativeDocumentExpiryDate: updatedApplication.representative
                      .representativeDocumentExpiryDate
                      ? dateUtils.formatToInputDate(
                          updatedApplication.representative.representativeDocumentExpiryDate,
                        )
                      : '',
                  };
                  form.setValue('representative', representativeData as any, {
                    shouldDirty: false,
                    shouldTouch: false,
                    shouldValidate: false,
                  });
                } catch (updateError) {
                  console.error('Error updating representative data:', updateError);
                }
              }

              // Обновляем details
              if (updatedApplication.details) {
                try {
                  form.setValue(
                    'details',
                    {
                      ...updatedApplication.details,
                    } as any,
                    {
                      shouldDirty: false,
                      shouldTouch: false,
                      shouldValidate: false,
                    },
                  );

                  // Устанавливаем contractLanguage отдельно
                  form.setValue('contractLanguage', updatedApplication.contractLanguage || '', {
                    shouldDirty: false,
                    shouldTouch: false,
                    shouldValidate: false,
                  });
                } catch (updateError) {
                  console.error('Error updating details data:', updateError);
                }
              }

              // Обновляем флаг совершеннолетия
              if (updatedApplication.applicant?.birthDate) {
                try {
                  // Используем обычную функцию вместо setTimeout
                  setIsAdult(isApplicantAdult());
                } catch (updateError) {
                  console.error('Error updating adult status:', updateError);
                }
              }

              // Сохраняем текущее состояние, чтобы избежать повторных обновлений
              previousAppRef.current = JSON.stringify(updatedApplication);
            }

            // Восстанавливаем остальной код обработки результата
            if (typeof window !== 'undefined') {
              localStorage.setItem(`application-tab-${id}`, activeTab);
            }
          } catch (fetchError) {
            console.error('Error fetching updated application:', fetchError);
          }
        }

        // Вызываем валидацию формы, но только один раз, вне блока обновления данных
        try {
          form.trigger();
        } catch (validationError) {
          console.error('Error validating form:', validationError);
        }

        submissionInProgress = false;

        return true;
      } catch (error) {
        console.error(
          `Error in API call while ${isSubmit ? 'submitting' : 'saving draft'}:`,
          error,
        );
        submissionInProgress = false;
        return false;
      }
    } catch (error) {
      console.error(`Error saving ${isSubmit ? 'submission' : 'draft'}:`, error);
      return false;
    }
  };

  const handleSubmit = async (data: FormValues) => {
    console.log('Form submit triggered', data);
    // Если форма заблокирована, ничего не делаем
    if (isReadOnly) {
      console.log('Form is read-only, submission canceled');
      return;
    }

    // Создаем переменную для отслеживания статуса отправки
    let isSubmitting: boolean = false;

    try {
      // Проверяем, не отправляется ли уже форма
      if (isSubmitting) {
        console.log('Form is already being submitted, ignoring duplicate submission');
        return;
      }

      // Устанавливаем флаг отправки
      isSubmitting = true;

      if (!id) {
        console.log('No form ID found, submission canceled');
        isSubmitting = false;
        return;
      }

      // Сохраняем данные с флагом isSubmit = true
      console.log('Saving form data with isSubmit=true');
      const result = await saveApplicantFormData(data, true);
      console.log('Save result:', result);

      if (result) {
        // Добавляем успешное сообщение
        toast.success('Заявление успешно отправлено!');
      } else {
        toast.error('Не удалось отправить заявление. Пожалуйста, попробуйте позже.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(
        'Ошибка при отправке заявления: ' +
          (error instanceof Error ? error.message : 'Неизвестная ошибка'),
      );
    } finally {
      // Сбрасываем флаг отправки в любом случае
      isSubmitting = false;
    }
  };

  const formKey = `application-form-${id || 'new'}`;

  // Выводим в консоль статус загрузки
  useEffect(() => {
    console.log('Application loading status:', isLoadingSingleApp);
  }, [isLoadingSingleApp]);

  // Функция для открытия диалога подтверждения
  const openConfirmDialog = (values: FormValues) => {
    setFormValuesForSubmit(values);
    setConfirmDialogOpen(true);
  };

  // Функция для закрытия диалога подтверждения
  const closeConfirmDialog = () => {
    setFormValuesForSubmit(null);
    setConfirmDialogOpen(false);
  };

  // Функция для подтверждения отправки
  const confirmSubmit = () => {
    if (formValuesForSubmit) {
      // Актуализируем документы из хранилища перед отправкой
      if (id) {
        const docs = useDocumentStore.getState().documents;
        if (docs.length > 0) {
          const documentValues = docs.reduce(
            (acc, doc) => {
              if (doc.code) {
                acc[doc.code] = doc.id;
              }
              return acc;
            },
            {} as Record<string, string>,
          );

          // Обновляем документы в значениях формы для отправки
          formValuesForSubmit.documents = documentValues;
          console.log('Актуализированы документы для отправки:', documentValues);
        }
      }

      handleSubmit(formValuesForSubmit);
      closeConfirmDialog();
    }
  };

  const handleGenerateContractAndSendTrustMe = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Получаем данные образовательной программы
      const educationalProgramId = singleApplication?.details?.educationalProgramId;
      if (!educationalProgramId) {
        throw new Error('Не выбран образовательный курс');
      }

      const program = await getEducationalProgramDetails(educationalProgramId);
      if (!program) {
        throw new Error('Не удалось получить данные образовательного курса');
      }

      // Генерируем номер контракта
      const contractNumber = generateContractNumber(
        singleApplication?.details?.academicLevel || AcademicLevel.BACHELORS,
        singleApplication?.details?.type || StudyType.PAID,
        program.duration || 0,
        singleApplication?.applicant?.identificationNumber ||
          singleApplication?.applicant?.documentNumber ||
          '',
      );

      // Генерируем контракт и получаем URL
      const response = await fetch('/api/fill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            ...singleApplication,
            contractNumber,
            details: {
              ...singleApplication?.details,
              educationalProgram: {
                group: program.group?.name_rus || '',
                name: program.name_rus || '',
                code: program.code || '',
                duration: String(program.duration) || '',
                costPerCredit: program.costPerCredit || '',
                studyingLanguage: singleApplication?.details?.studyingLanguage || '',
              },
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при генерации контракта');
      }

      const blob = await response.blob();

      // Конвертируем Blob в Base64
      const arrayBuffer = await blob.arrayBuffer();
      const base64String = Buffer.from(arrayBuffer).toString('base64');

      // Создаем заголовки
      const headers = new Headers();
      headers.append('Authorization', process.env.NEXT_PUBLIC_TRUSTME_API_TOKEN || '');

      // Создаем FormData
      const formData = new FormData();
      formData.append('FileBase64', base64String);

      // Подготавливаем details в точном формате из документации
      const details = {
        NumberDial: contractNumber,
        KzBmg: false,
        FaceId: false,
        AdditionalInfo: 'Договор на обучение',
        Requisites: [
          {
            CompanyName: 'Second Signatory',
            FIO: `${singleApplication?.applicant?.surname} ${singleApplication?.applicant?.givennames} ${singleApplication?.applicant?.patronymic || ''}`,
            IIN_BIN:
              singleApplication?.applicant?.identificationNumber ||
              singleApplication?.applicant?.documentNumber ||
              '',
            PhoneNumber: singleApplication?.applicant?.phone || '',
          },
        ],
      };

      // Если заявитель несовершеннолетний, добавляем данные представителя
      if (!isAdult && singleApplication?.representative) {
        details.Requisites.push({
          CompanyName: 'Second Signatory',
          FIO: `${singleApplication.representative.surname} ${singleApplication.representative.givennames} ${singleApplication.representative.patronymic || ''}`,
          IIN_BIN:
            singleApplication.representative.identificationNumber ||
            singleApplication.representative.documentNumber ||
            '',
          PhoneNumber: singleApplication.representative.phone || '',
        });
      }

      // Добавляем details как JSON строку
      formData.append('details', JSON.stringify(details));
      formData.append('contract_name', contractNumber);

      console.log('Отправляем данные в TrustMe:', {
        details: JSON.stringify(details, null, 2),
        contract_name: contractNumber,
      });

      // Отправляем в TrustMe
      const trustMeResponse = await fetch(
        `${process.env.NEXT_PUBLIC_TRUSTME_API_URL}/SendToSignBase64FileExt/pdf`,
        {
          method: 'POST',
          headers: headers,
          body: formData,
          redirect: 'follow',
        },
      );

      const responseText = await trustMeResponse.text();
      console.log('TrustMe raw response:', responseText);

      if (!trustMeResponse.ok) {
        toast.error('Не удалось отправить контракт на подписание');
        throw new Error(`Ошибка при отправке в TrustMe: ${responseText}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
        console.log('TrustMe parsed response:', result);
      } catch (parseError) {
        console.error('Ошибка при парсинге ответа:', parseError);
        throw new Error('Неверный формат ответа от TrustMe');
      }

      if (!result.data) {
        toast.error('Не удалось отправить контракт на подписание');
        throw new Error(`Ошибка при отправке в TrustMe: ${responseText}`);
      }

      // Создаем лог о отправке в TrustMe
      if (id && user?.id) {
        await createLog({
          applicationId: id,
          createdById: user.id,
          statusId: 'NEED_SIGNATURE',
          description: `TrustMe: ${JSON.stringify(result?.data, null, 2)}`,
        });
        toast.success('Контракт успешно отправлен на подписание');
      }

      // Обновляем данные заявки
      await fetchSingleApplication(id as string);
      await fetchLogsByApplicationId(id as string);
    } catch (error) {
      console.error('Ошибка при отправке контракта:', error);
      toast.error('Произошла ошибка при отправке контракта на подписание');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateContract = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const educationalProgramId = singleApplication?.details?.educationalProgramId;
      if (!educationalProgramId) {
        throw new Error('Не выбран образовательный курс');
      }

      const program = await getEducationalProgramDetails(educationalProgramId);
      console.log('Полученные данные программы:', program);

      if (!program) {
        throw new Error('Не удалось получить данные образовательного курса');
      }

      const contractNumber = generateContractNumber(
        singleApplication?.details?.academicLevel || AcademicLevel.BACHELORS,
        singleApplication?.details?.type || StudyType.PAID,
        program.duration || 0,
        singleApplication?.applicant?.identificationNumber ||
          singleApplication?.applicant?.documentNumber ||
          '',
      );

      const response = await fetch('/api/fill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            ...singleApplication,
            contractNumber,
            details: {
              ...singleApplication?.details,
              educationalProgram: {
                group: program.group?.name_rus || '',
                name: program.name_rus || '',
                code: program.code || '',
                duration: String(program.duration) || '',
                costPerCredit: program.costPerCredit || '',
                studyingLanguage: singleApplication?.details?.studyingLanguage || '',
              },
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при генерации контракта');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contractNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Ошибка:', error);
      toast.error('Произошла ошибка при генерации контракта');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSignedContractFile(e.target.files[0]);
    }
  };

  const handleUploadSignedContract = async () => {
    if (signedContractFile && user?.id) {
      try {
        const formData = new FormData();
        formData.append('file', signedContractFile);
        formData.append('applicationId', id as string);
        formData.append('userId', user.id);
        formData.append('uploadedById', user.id);

        const response = await fetch('/api/upload-signed-contract', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error('Ошибка при загрузке контракта');
        }
        const data = await response.json();
        toast.success('Подписанный контракт успешно загружен');

        // Создаем лог через useLogStore
        await createLog({
          applicationId: id as string,
          createdById: user.id,
          statusId: 'CHECK_DOCS',
          description: `Contract: ${data.filename}`,
        });
      } catch (error) {
        toast.error('Ошибка при загрузке контракта');
      } finally {
        setSignedContractFile(null);
        await fetchSingleApplication(id as string);
        await fetchLogsByApplicationId(id as string);
      }
    }
  };

  const handleCheckSignatureTrustMe = async () => {
    setIsLoading(true);
    try {
      // Получаем последний лог заявки
      const latestLog = getLatestLogByApplicationId(id as string);
      if (!latestLog) {
        throw new Error('Не найден лог заявки');
      }

      // Извлекаем document_id из описания лога
      const description = latestLog.description || '';
      const documentIdMatch = description.match(/"id":\s*"([^"]+)"/);
      if (!documentIdMatch) {
        throw new Error('Не найден ID документа в логах');
      }
      const documentId = documentIdMatch[1].trim();

      console.log('Извлеченный ID документа:', documentId);

      // Создаем заголовки
      const headers = new Headers();
      headers.append('Authorization', process.env.NEXT_PUBLIC_TRUSTME_API_TOKEN || '');
      headers.append('Content-Type', 'application/json');

      console.log('Проверяем статус документа:', documentId);

      // Отправляем запрос на проверку статуса
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TRUSTME_API_URL}/ContractStatus/${documentId.trim()}`,
        {
          method: 'GET',
          headers: headers,
          redirect: 'follow',
        },
      );

      console.log('Ответ от TrustMe:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка TrustMe API:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
        });
        throw new Error(
          `Ошибка при проверке статуса подписания: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();
      console.log('Статус подписания:', result);

      // Определяем статус подписания
      let statusText = '';
      let newStatusId: ApplicationStatus;

      switch (result.data) {
        case 0:
          statusText = tTrustMeStatus('notSigned');
          newStatusId = 'NEED_SIGNATURE';
          break;
        case 1:
          statusText = tTrustMeStatus('companySigned');
          newStatusId = 'NEED_SIGNATURE';
          break;
        case 2:
          statusText = tTrustMeStatus('clientSigned');
          newStatusId = 'NEED_SIGNATURE';
          break;
        case 3:
          statusText = tTrustMeStatus('fullSigned');
          newStatusId = 'CHECK_DOCS';
          break;
        case 4:
          statusText = tTrustMeStatus('revokedCompany');
          newStatusId = 'REJECTED';
          break;
        case 5:
          statusText = tTrustMeStatus('companyInitiatedTermination');
          newStatusId = 'RE_PROCESSING';
          break;
        case 6:
          statusText = tTrustMeStatus('clientInitiatedTermination');
          newStatusId = 'RE_PROCESSING';
          break;
        case 7:
          statusText = tTrustMeStatus('clientRefusedTermination');
          newStatusId = 'RE_PROCESSING';
          break;
        case 8:
          statusText = tTrustMeStatus('terminated');
          newStatusId = 'REFUSED_TO_ENROLL';
          break;
        case 9:
          statusText = tTrustMeStatus('clientRefusedSignature');
          newStatusId = 'REFUSED_TO_SIGN';
          break;
        default:
          statusText = tTrustMeStatus('unknownStatus');
          newStatusId = 'NEED_SIGNATURE';
      }

      // Создаем новый лог с обновленным статусом только если статус изменился
      if (id && user?.id && latestLog?.statusId !== newStatusId) {
        await createLog({
          applicationId: id,
          createdById: user.id,
          statusId: newStatusId,
          description: `TrustMe: ${statusText} (${result.data})`,
        });

        // Если контракт полностью подписан, обновляем статус заявки
        if (result.data === 3) {
          toast.success(`${statusText}`);
        } else {
          toast.info(`${statusText}`);
        }
      } else {
        // Если статус не изменился, просто показываем текущий статус
        toast.info(`${statusText}`);
      }

      // Обновляем данные заявки
      await fetchSingleApplication(id as string);
      await fetchLogsByApplicationId(id as string);
    } catch (error) {
      console.error('Ошибка при проверке статуса подписания:', error);
      toast.error('Произошла ошибка при проверке статуса подписания');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeTrustMe = async () => {
    setIsLoading(true);
    try {
      // Получаем последний лог заявки
      const latestLog = getLatestLogByApplicationId(id as string);
      if (!latestLog) {
        throw new Error('Не найден лог заявки');
      }

      // Извлекаем document_id из описания лога
      const description = latestLog.description || '';
      const documentIdMatch = description.match(/"id":\s*"([^"]+)"/);
      if (!documentIdMatch) {
        throw new Error('Не найден ID документа в логах');
      }
      const documentId = documentIdMatch[1].trim();

      console.log('Отзываем документ:', documentId);

      // Создаем заголовки
      const headers = new Headers();
      headers.append('Authorization', process.env.NEXT_PUBLIC_TRUSTME_API_TOKEN || '');
      headers.append('Content-Type', 'application/json');

      // Отправляем запрос на отзыв/расторжение
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TRUSTME_API_URL}/RevokeContract/${documentId}`,
        {
          method: 'GET',
          headers: headers,
          redirect: 'follow',
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка TrustMe API:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
        });
        throw new Error(`Ошибка при отзыве контракта: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Результат отзыва:', result);

      // Определяем статус и создаем соответствующий лог
      let statusText = '';
      let newStatusId: ApplicationStatus;

      // Проверяем статус из ответа API
      const status = result?.data?.status || result?.status;
      console.log('Статус отзыва:', status);

      switch (status) {
        case 4:
          statusText = 'Контракт отозван';
          newStatusId = 'RE_PROCESSING';
          break;
        case 5:
          statusText = 'Инициировано расторжение контракта';
          newStatusId = 'RE_PROCESSING';
          break;
        default:
          statusText = 'Неизвестный статус';
          newStatusId = 'RE_PROCESSING';
      }

      // Создаем новый лог
      if (id && user?.id) {
        await createLog({
          applicationId: id,
          createdById: user.id,
          statusId: newStatusId,
          description: `TrustMe: ${statusText} (${status})`,
        });

        toast.success(statusText);
      }

      // Обновляем данные заявки
      await fetchSingleApplication(id as string);
      await fetchLogsByApplicationId(id as string);
    } catch (error) {
      console.error('Ошибка при отзыве контракта:', error);
      toast.error('Произошла ошибка при отзыве контракта');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewContract = async () => {
    if (!id || !user?.role) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: user.role, id }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении контракта');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Ошибка при открытии контракта:', error);
      toast.error('Не удалось открыть контракт');
    } finally {
      setIsLoading(false);
    }
  };

  // console.log('singleApplication', singleApplication);

  if (!singleApplication && id) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-zinc-800/50">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {(!singleApplication?.submittedAt || user?.role !== Role.USER) && (
        <DocAnalizer
          id={id as string}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setHasUnsavedChanges={setHasUnsavedChanges}
          isAdult={isAdult}
          setFormValue={(path, value, options) =>
            form.setValue(
              path as Path<FormValues>,
              value as PathValue<FormValues, Path<FormValues>>,
              options,
            )
          }
        />
      )}
      <Form {...form} key={formKey}>
        <form
          onSubmit={(e) => {
            e.preventDefault(); // Предотвращаем стандартное поведение формы
            console.log('Form onSubmit event triggered', e);

            // Всегда показываем диалог подтверждения вместо прямой отправки
            if (activeTab === 'documents') {
              const values = form.getValues();
              form.trigger().then((isValid) => {
                if (isValid) {
                  console.log('Form validation passed, opening confirmation dialog');
                  openConfirmDialog(values);
                } else {
                  console.log('Form validation failed on submit, showing errors');
                  const errorFields = Object.keys(form.formState.errors);
                  let errorMessages = errorFields
                    .map((field) => {
                      const error = form.formState.errors[field as any];
                      return `"${field === 'applicant' ? tApplications('columnsApplicant') : field === 'representative' ? tApplications('columnsRepresentative') : field === 'details' ? tApplications('columnsDetails') : field === 'documents' ? tApplications('columnsDocuments') : field}": ${error?.message || c('validationError')}`;
                    })
                    .join(', ');

                  toast.error(errorMessages || c('validationError'));
                }
              });
            } else {
              console.log('Отправка формы заблокирована, т.к. активная вкладка не documents');
            }
          }}
          onKeyDown={(e) => {
            // Предотвращаем отправку формы при нажатии Enter в полях формы
            if (e.key === 'Enter' && activeTab === 'details') {
              e.preventDefault();
              console.log('Предотвращена отправка формы по нажатию Enter на вкладке details');
            }
          }}
          className="mt-8"
        >
          {isSubmitted && user?.role === Role.USER && (
            <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
              <p>{tApplicant('applicationSubmittedDescription')}</p>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={handleTabChange} className="">
            <TabsList className="flex h-60 w-full flex-col gap-2 sm:grid sm:grid-cols-2 md:flex md:h-24 md:flex-row">
              <TabsTrigger value="applicant" className="w-full text-lg">
                {tApplicant('title')}
                {hasUnsavedChanges && activeTab === 'applicant' && ' *'}
              </TabsTrigger>
              {!isAdult && (
                <TabsTrigger value="representative" className="w-full text-lg">
                  {tRepresentative('title')}
                  {hasUnsavedChanges && activeTab === 'representative' && ' *'}
                </TabsTrigger>
              )}
              <TabsTrigger value="details" className="w-full text-lg">
                {tDetails('title')}
                {hasUnsavedChanges && activeTab === 'details' && ' *'}
              </TabsTrigger>
              <TabsTrigger value="documents" className="w-full text-lg">
                {tDocuments('title')}
                {hasUnsavedChanges && activeTab === 'documents' && ' *'}
              </TabsTrigger>
            </TabsList>

            <fieldset disabled={false} className="mt-4 space-y-4">
              <TabsContent value="applicant">
                <ApplicantForm
                  application={singleApplication as ExtendedApplication}
                  isSubmitted={isReadOnly}
                />
              </TabsContent>

              {!isAdult && (
                <TabsContent value="representative">
                  <RepresentativeForm
                    application={singleApplication as ExtendedApplication}
                    isSubmitted={isReadOnly}
                  />
                </TabsContent>
              )}

              <TabsContent value="details">
                <Details
                  application={singleApplication as ExtendedApplication}
                  isSubmitted={isReadOnly}
                />
              </TabsContent>

              <TabsContent value="documents">
                <RequiredDocs
                  application={singleApplication as unknown as ExtendedApplication}
                  isSubmitted={isReadOnly}
                />
              </TabsContent>
            </fieldset>
          </Tabs>

          {(!singleApplication?.submittedAt || user?.role !== Role.USER) && (
            <div className="my-4 flex w-full items-center justify-end gap-4 rounded-lg border bg-white p-4">
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  onClick={handleSaveDraftClick}
                  variant="outline"
                  disabled={isReadOnly}
                >
                  {c('saveDraft')}
                </Button>
                {latestLog?.statusId === 'DRAFT' &&
                  (activeTab !== 'documents' ? (
                    <Button
                      type="button"
                      onClick={(e) => {
                        // Предотвращаем отправку формы
                        e.preventDefault();

                        // Логика переключения на следующий таб
                        if (activeTab === 'applicant') {
                          // Если взрослый, переходим на details, иначе на representative
                          handleTabChange(isAdult ? 'details' : 'representative');
                        } else if (activeTab === 'representative') {
                          handleTabChange('details');
                        } else if (activeTab === 'details') {
                          handleTabChange('documents');
                          console.log('Переход с вкладки details на documents');
                        }
                      }}
                      disabled={isReadOnly}
                    >
                      {c('next')}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => {
                        console.log('Submit button clicked, opening confirmation dialog');
                        const values = form.getValues();
                        form.trigger().then((isValid) => {
                          if (!isValid) {
                            console.log('Form validation failed, errors:', form.formState.errors);
                            const errorFields = Object.keys(form.formState.errors);
                            console.log('Invalid fields:', errorFields);

                            // Анализируем ошибки валидации
                            let errorMessages = errorFields
                              .map((field) => {
                                const error = form.formState.errors[field as any];
                                return `"${field === 'applicant' ? tApplications('columnsApplicant') : field === 'representative' ? tApplications('columnsRepresentative') : field === 'details' ? tApplications('columnsDetails') : field === 'documents' ? tApplications('columnsDocuments') : field}": ${error?.message || c('validationError')}`;
                              })
                              .join(', ');

                            toast.error(
                              errorMessages || c('validationError'), // 'Форма содержит ошибки. Пожалуйста, проверьте все поля.',
                            );
                            return;
                          }

                          openConfirmDialog(values);
                        });
                      }}
                    >
                      {c('submitApplication')}
                    </Button>
                  ))}
              </div>
            </div>
          )}

          {singleApplication?.submittedAt &&
            user?.role !== Role.USER &&
            (latestLog?.statusId === 'PROCESSING' || latestLog?.statusId === 'RE_PROCESSING') && (
              <div className="my-12 flex w-full flex-col gap-6 rounded-lg p-4">
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-semibold">{c('signatureContract')}</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="radio"
                        id="online"
                        name="signatureMethod"
                        value="online"
                        checked={signatureMethod === 'online'}
                        onChange={(e) => setSignatureMethod(e.target.value as 'online' | 'offline')}
                        className="text-primary focus:ring-primary h-4 w-4 border-gray-300"
                      />
                      <Label htmlFor="online">{c('online')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="radio"
                        id="offline"
                        name="signatureMethod"
                        value="offline"
                        checked={signatureMethod === 'offline'}
                        onChange={(e) => setSignatureMethod(e.target.value as 'online' | 'offline')}
                        className="text-primary focus:ring-primary h-4 w-4 border-gray-300"
                      />
                      <Label htmlFor="offline">{c('offline')}</Label>
                    </div>
                  </div>
                </div>

                {signatureMethod === 'online' ? (
                  <div>
                    <Button
                      onClick={handleGenerateContractAndSendTrustMe}
                      disabled={!singleApplication?.submittedAt || isLoading}
                    >
                      {c('sendToSignTrustMe')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-start gap-12">
                      <Button onClick={handleGenerateContract}>{c('generateContract')}</Button>

                      <div className="flex flex-col gap-2">
                        <Label>{c('uploadSignedContract')}</Label>
                        <Input type="file" accept=".pdf" onChange={handleFileChange} />
                        <Button
                          onClick={handleUploadSignedContract}
                          disabled={!signedContractFile || isLoading}
                        >
                          {c('saveSignedContract')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          {singleApplication?.submittedAt &&
            user?.role !== Role.USER &&
            latestLog?.statusId === 'NEED_SIGNATURE' && (
              <div className="my-12 flex w-full flex-col gap-6 rounded-lg p-4">
                <div className="flex flex-row flex-wrap justify-end gap-4">
                  <Button
                    onClick={handleCheckSignatureTrustMe}
                    disabled={isLoading}
                    className="bg-blue-500"
                  >
                    {c('checkSignatureTrustMe')}
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      setRevokeDialogOpen(true);
                    }}
                    disabled={isLoading}
                    className="bg-red-700"
                  >
                    {c('revokeTrustMe')}
                  </Button>
                </div>
              </div>
            )}

          {singleApplication?.submittedAt &&
            user?.role !== Role.USER &&
            (latestLog?.statusId === 'CHECK_DOCS' || latestLog?.statusId === 'NEED_DOCS') && (
              <div className="my-12 flex w-full flex-col gap-6 rounded-lg border bg-white p-4">
                <div className="flex flex-col gap-4">
                  <Button onClick={handleViewContract} disabled={isLoading}>
                    {c('viewContract')}
                  </Button>
                </div>
              </div>
            )}
        </form>
      </Form>

      {/* диалог подтверждения */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{c('confirmSubmitTitle')}</DialogTitle>
            <DialogDescription>{c('confirmSubmitDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeConfirmDialog}>
              {c('cancel')}
            </Button>
            <Button onClick={confirmSubmit}>{c('confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex w-full flex-col justify-between gap-4 md:flex-row">
        <Info />
        {hasAccess(user?.role as Role, Role.CONSULTANT) && <LogHistory />}
      </div>

      {/* диалог подтверждения отзыва */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{c('confirmRevokeTitle')}</DialogTitle>
            <DialogDescription>{c('confirmRevokeDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
              {c('cancel')}
            </Button>
            <Button
              onClick={() => {
                setRevokeDialogOpen(false);
                handleRevokeTrustMe();
              }}
              className="bg-red-700"
            >
              {c('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
