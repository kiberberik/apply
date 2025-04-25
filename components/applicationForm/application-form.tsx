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
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExtendedApplication } from '@/types/application';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSingleApplication, UpdateApplicationRequest } from '@/store/useSingleApplication';
import { useLogStore } from '@/store/useLogStore';
import {
  RelationshipDegree,
  IdentificationDocumentType,
  StudyType,
  AcademicLevel,
  SupportLanguages,
  Role,
} from '@prisma/client';
import { toast } from 'react-toastify';
import dateUtils from '@/lib/dateUtils';
import { Loader2 } from 'lucide-react';
import { hasAccess } from '@/lib/hasAccess';
import LogHistory from './LogHistory';
import Info from './Info';
import { useRequiredDocuments } from '@/store/useRequiredDocuments';
import { useDocumentStore } from '@/store/useDocumentStore';

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

// Создаем более гибкую схему, которая работает как для черновиков, так и для финальной отправки
const formSchema = z.object({
  applicant: z.object({
    givennames: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    surname: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    patronymic: z.string().nullable(),
    birthDate: z
      .string({ required_error: '' })
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    birthPlace: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    isCitizenshipKz: z
      .boolean({ required_error: '' })
      .nullable()
      .transform((v) => (v === null ? false : v)),
    citizenship: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    identificationNumber: z.string().nullable(),
    documentType: z
      .nativeEnum(IdentificationDocumentType, {
        required_error: '',
      })
      .nullable()
      .transform((v) => (v === null ? ('ID_CARD' as IdentificationDocumentType) : v)),
    documentNumber: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    documentIssueDate: z
      .string({ required_error: '' })
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    documentExpiryDate: z
      .string({ required_error: '' })
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    documentIssuingAuthority: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    documentFileLinks: z.string().nullable(),
    // .string({ required_error: '' })
    // .trim()
    // .min(1, '')
    // .nullable()
    // .transform((v) => (v === null ? '' : v)),
    email: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .email('Некорректный формат email')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    phone: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    addressResidential: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    addressRegistration: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
  }),
  representative: z
    .object({
      givennames: z.string().nullable().optional(),
      surname: z.string().nullable().optional(),
      patronymic: z.string().nullable().optional(),
      isCitizenshipKz: z.boolean().nullable().optional(),
      citizenship: z.string().nullable().optional(),
      identificationNumber: z.string().nullable().optional(),
      documentType: z.nativeEnum(IdentificationDocumentType).nullable().optional(),
      documentNumber: z.string().nullable().optional(),
      documentIssueDate: z.string().nullable().optional(),
      documentExpiryDate: z.string().nullable().optional(),
      documentIssuingAuthority: z.string().nullable().optional(),
      documentFileLinks: z.string().nullable().optional(),
      representativeDocumentNumber: z.string().nullable().optional(),
      representativeDocumentIssueDate: z.string().nullable().optional(),
      representativeDocumentExpiryDate: z.string().nullable().optional(),
      representativeDocumentIssuingAuthority: z.string().nullable().optional(),
      representativeDocumentFileLinks: z.string().nullable().optional(),
      relationshipDegree: z.nativeEnum(RelationshipDegree).nullable().optional(),
      email: z.string().email().nullable().optional(),
      phone: z.string().nullable().optional(),
      addressResidential: z.string().nullable().optional(),
      addressRegistration: z.string().nullable().optional(),
      applicantId: z.string().nullable().optional(),
      id: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  details: z.object({
    type: z
      .nativeEnum(StudyType, { required_error: '' })
      .nullable()
      .transform((v) => (v === null ? ('PAID' as StudyType) : v)),
    academicLevel: z
      .nativeEnum(AcademicLevel, { required_error: '' })
      .nullable()
      .transform((v) => (v === null ? ('BACHELORS' as AcademicLevel) : v)),
    isDormNeeds: z.boolean().nullable().optional(),
    studyingLanguage: z
      .nativeEnum(SupportLanguages, { required_error: '' })
      .nullable()
      .transform((v) => (v === null ? ('RUS' as SupportLanguages) : v)),
    educationalProgramId: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
  }),
  contractLanguage: z
    .nativeEnum(SupportLanguages, { required_error: '' })
    .nullable()
    .transform((v) => (v === null ? ('RUS' as SupportLanguages) : v)),
  documents: z.record(z.string(), z.string()).nullable().optional(),
});

// Более строгая схема для проверки при отправке
const validateForSubmission = (
  data: FormValues,
  requiredDocuments: any[] | undefined,
  uploadedDocuments: any[] | undefined,
) => {
  // Проверяем обязательные поля для отправки
  if (!data.applicant) {
    console.log('Не заполнены данные о заявителе');
    return { success: false, error: 'Не заполнены данные о заявителе' };
  }

  if (!data.details) {
    console.log('Не заполнены данные о программе обучения');
    return { success: false, error: 'Не заполнены данные о программе обучения' };
  }

  // Логирование данных формы
  console.log('Проверка документов:');
  console.log('data.documents:', data.documents);
  console.log('uploadedDocuments:', uploadedDocuments);
  console.log('requiredDocuments:', requiredDocuments);

  // Проверка загрузки обязательных документов
  if (!requiredDocuments || !uploadedDocuments) {
    console.log('Не удалось получить информацию о документах');
    return { success: true }; // Пропускаем проверку документов, если данные недоступны
  }

  // Фильтруем документы, которые требуются для данного заявления
  const applicantData = data.applicant;
  const isKzCitizen = applicantData?.isCitizenshipKz;
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
      console.error('Ошибка при расчете возраста:', e);
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

    console.log('Отфильтрованные обязательные документы:', filteredRequiredDocuments);

    // Проверка обязательных документов используя данные формы
    const requiredDocCodes = filteredRequiredDocuments
      .filter((doc) => doc.isScanRequired)
      .map((doc) => doc.code);

    console.log('Коды обязательных документов:', requiredDocCodes);

    // Проверяем, что в data.documents есть все необходимые документы
    if (requiredDocCodes.length > 0) {
      const documentValues = data.documents || {};
      console.log('Значения документов в форме:', documentValues);

      const missingDocs = requiredDocCodes.filter((code) => {
        // Проверяем наличие и непустое значение для кода документа
        return !documentValues[code] || documentValues[code] === '';
      });

      console.log('Отсутствующие документы по форме:', missingDocs);

      if (missingDocs.length > 0) {
        // Находим имена отсутствующих документов
        const missingDocNames = missingDocs.map((code) => {
          const doc = filteredRequiredDocuments.find((d) => d.code === code);
          return doc?.name_rus || doc?.name_eng || doc?.name_kaz || code;
        });

        console.log('Не загружены обязательные документы:', missingDocNames);
        return {
          success: false,
          error: `Не загружены обязательные документы: ${missingDocNames.join(', ')}`,
        };
      }
    }
  } catch (error) {
    console.error('Ошибка при проверке документов:', error);
    // В случае ошибки пропускаем проверку документов
    return { success: true };
  }

  console.log('Проверка документов успешно пройдена');
  return { success: true };
};

export default function ApplicationForm({ id }: ApplicationFormProps) {
  const c = useTranslations('Common');
  const { application, updateApplication, fetchApplication, isLoading } = useSingleApplication();
  const { createLog } = useLogStore();

  const tApplicant = useTranslations('Applicant');
  const tRepresentative = useTranslations('Representative');
  const tDetails = useTranslations('Details');
  const tDocuments = useTranslations('Documents');

  const [activeTab, setActiveTab] = React.useState(() => {
    // Попытка восстановить сохраненный таб из localStorage при инициализации
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem(`application-tab-${id}`);
      return savedTab || 'applicant';
    }
    return 'applicant';
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const { user } = useAuthStore();

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: React.useMemo(
      () => ({
        applicant: application?.applicant
          ? {
              givennames: application.applicant.givennames || '',
              surname: application.applicant.surname || '',
              patronymic: application.applicant.patronymic || null,
              birthDate: application.applicant.birthDate
                ? dateUtils.formatToInputDate(application.applicant.birthDate)
                : '',
              birthPlace: application.applicant.birthPlace || '',
              isCitizenshipKz: application.applicant.isCitizenshipKz || false,
              citizenship: application.applicant.citizenship || '',
              identificationNumber: application.applicant.identificationNumber || null,
              documentType: application.applicant.documentType || 'ID_CARD',
              documentNumber: application.applicant.documentNumber || '',
              documentIssueDate: application.applicant.documentIssueDate
                ? dateUtils.formatToInputDate(application.applicant.documentIssueDate)
                : '',
              documentExpiryDate: application.applicant.documentExpiryDate
                ? dateUtils.formatToInputDate(application.applicant.documentExpiryDate)
                : '',
              documentIssuingAuthority: application.applicant.documentIssuingAuthority || '',
              documentFileLinks: application.applicant.documentFileLinks || '',
              email: application.applicant.email || '',
              phone: application.applicant.phone || '',
              addressResidential: application.applicant.addressResidential || '',
              addressRegistration: application.applicant.addressRegistration || '',
            }
          : {
              givennames: '',
              surname: '',
              patronymic: null,
              birthDate: '',
              birthPlace: '',
              isCitizenshipKz: false,
              citizenship: '',
              identificationNumber: null,
              documentType: 'ID_CARD',
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
        representative: application?.representative
          ? {
              givennames: application.representative.givennames || '',
              surname: application.representative.surname || '',
              patronymic: application.representative.patronymic || null,
              isCitizenshipKz: application.representative.isCitizenshipKz || false,
              citizenship: application.representative.citizenship || '',
              identificationNumber: application.representative.identificationNumber || null,
              documentType: application.representative.documentType || 'ID_CARD',
              documentNumber: application.representative.documentNumber || '',
              documentIssueDate: application.representative.documentIssueDate
                ? dateUtils.formatToInputDate(application.representative.documentIssueDate)
                : '',
              documentExpiryDate: application.representative.documentExpiryDate
                ? dateUtils.formatToInputDate(application.representative.documentExpiryDate)
                : '',
              documentIssuingAuthority: application.representative.documentIssuingAuthority || '',
              documentFileLinks: application.representative.documentFileLinks || '',
              representativeDocumentNumber:
                application.representative.representativeDocumentNumber || '',
              representativeDocumentIssueDate: application.representative
                .representativeDocumentIssueDate
                ? dateUtils.formatToInputDate(
                    application.representative.representativeDocumentIssueDate,
                  )
                : '',
              representativeDocumentExpiryDate: application.representative
                .representativeDocumentExpiryDate
                ? dateUtils.formatToInputDate(
                    application.representative.representativeDocumentExpiryDate,
                  )
                : '',
              representativeDocumentIssuingAuthority:
                application.representative.representativeDocumentIssuingAuthority || '',
              representativeDocumentFileLinks:
                application.representative.representativeDocumentFileLinks || '',
              relationshipDegree: application.representative.relationshipDegree || 'PARENT',
              email: application.representative.email || '',
              phone: application.representative.phone || '',
              addressResidential: application.representative.addressResidential || '',
              addressRegistration: application.representative.addressRegistration || '',
              applicantId: application.representative.applicantId || '',
              id: application.representative.id || '',
            }
          : null,
        details: application?.details
          ? {
              type: application.details.type || 'PAID',
              academicLevel: application.details.academicLevel || 'BACHELORS',
              isDormNeeds: application.details.isDormNeeds || false,
              studyingLanguage: application.details.studyingLanguage || 'RUS',
              educationalProgramId: application.details.educationalProgramId || '',
            }
          : {
              type: 'PAID',
              academicLevel: 'BACHELORS',
              isDormNeeds: false,
              studyingLanguage: 'RUS',
              educationalProgramId: '',
            },
        contractLanguage: application?.contractLanguage || 'RUS',
        documents: application?.documents ? {} : null,
      }),
      [application],
    ),
  });

  const isSubmitted = Boolean(application?.submittedAt);
  const isReadOnly = isSubmitted && user?.role === Role.USER;

  // Мемоизация isApplicantAdult для предотвращения лишних рендеров
  const isApplicantAdult = React.useCallback(() => {
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
  const previousAppRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (!application) return;

    const applicationJson = JSON.stringify(application);
    if (previousAppRef.current === applicationJson) {
      return;
    }

    previousAppRef.current = applicationJson;

    if (!hasUnsavedChanges) {
      if (application.applicant) {
        const applicantData = {
          ...application.applicant,
          birthDate: application.applicant.birthDate
            ? dateUtils.formatToInputDate(application.applicant.birthDate)
            : '',
          documentIssueDate: application.applicant.documentIssueDate
            ? dateUtils.formatToInputDate(application.applicant.documentIssueDate)
            : '',
          documentExpiryDate: application.applicant.documentExpiryDate
            ? dateUtils.formatToInputDate(application.applicant.documentExpiryDate)
            : '',
        };

        form.setValue('applicant', applicantData as any, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }

      if (application.representative) {
        const representativeData = {
          ...application.representative,
          documentIssueDate: application.representative.documentIssueDate
            ? dateUtils.formatToInputDate(application.representative.documentIssueDate)
            : '',
          documentExpiryDate: application.representative.documentExpiryDate
            ? dateUtils.formatToInputDate(application.representative.documentExpiryDate)
            : '',
          representativeDocumentIssueDate: application.representative
            .representativeDocumentIssueDate
            ? dateUtils.formatToInputDate(
                application.representative.representativeDocumentIssueDate,
              )
            : '',
          representativeDocumentExpiryDate: application.representative
            .representativeDocumentExpiryDate
            ? dateUtils.formatToInputDate(
                application.representative.representativeDocumentExpiryDate,
              )
            : '',
        };

        form.setValue('representative', representativeData as any, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }

      if (application.details) {
        form.setValue(
          'details',
          {
            ...application.details,
          } as any,
          {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          },
        );

        // Устанавливаем contractLanguage отдельно
        form.setValue('contractLanguage', application.contractLanguage || 'RUS', {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }

      if (application.applicant?.birthDate) {
        setTimeout(() => setIsAdult(isApplicantAdult()), 0);
      }
    }
  }, [application, form, hasUnsavedChanges, isApplicantAdult]);

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
        if (application?.applicant) {
          values.applicant = {
            ...application.applicant,
            birthDate: dateUtils.formatToInputDate(application.applicant.birthDate),
            documentIssueDate: dateUtils.formatToInputDate(application.applicant.documentIssueDate),
            documentExpiryDate: dateUtils.formatToInputDate(
              application.applicant.documentExpiryDate,
            ),
          };
        } else {
          console.error('No applicant data available in form or application');
        }
      }
      const result = await saveApplicantFormData(values, false);
      if (result) {
        console.log('result', result);
        await fetchApplication(id as string);
        toast.success('Черновик сохранен успешно');
      } else {
        toast.error('Не удалось сохранить черновик');
      }
    } catch (error) {
      console.error('Error in handleSaveDraftClick:', error);
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
        console.log(
          'Form is already being submitted in saveApplicantFormData, canceling duplicate submission',
        );
        return false;
      }

      if (!data.applicant && application?.applicant) {
        console.log('No applicant data in form, using application data');
        data.applicant = {
          ...application.applicant,
          birthDate: application.applicant.birthDate
            ? dateUtils.formatToInputDate(application.applicant.birthDate)
            : '',
          documentIssueDate: application.applicant.documentIssueDate
            ? dateUtils.formatToInputDate(application.applicant.documentIssueDate)
            : '',
          documentExpiryDate: application.applicant.documentExpiryDate
            ? dateUtils.formatToInputDate(application.applicant.documentExpiryDate)
            : '',
        };
      }

      if (!data.applicant) {
        console.error('No applicant data available for saving');
        return false;
      }

      if (!isSubmit) {
        form.clearErrors();
      }

      setHasUnsavedChanges(false);

      console.log('Preparing request data');
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
              isCitizenshipKz: data.representative.isCitizenshipKz,
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
        submittedAt: isSubmit ? new Date().toISOString() : null,
      };

      console.log('Request data prepared:', requestData);

      if (application) {
        previousAppRef.current = JSON.stringify(application);
      }

      console.log('Sending update request...');

      // Защита от повторных запросов
      let submissionInProgress = true;

      try {
        const result = await updateApplication(id, requestData);
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
              description: 'Заявление отправлено на рассмотрение',
            });
          } catch (logError) {
            console.warn('Failed to create log, but application was saved:', logError);
          }
        }

        console.log('Update successful, fetching updated application...');

        // Обновляем данные после сохранения, но только если процесс отправки еще активен
        if (submissionInProgress) {
          try {
            await fetchApplication(id);

            // Восстанавливаем код обновления формы, но добавляем защиту от циклов
            const updatedApplication = useSingleApplication.getState().application;
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
                  form.setValue('contractLanguage', updatedApplication.contractLanguage || 'RUS', {
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
    let isSubmitting = false;

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

      // Дополнительная валидация перед отправкой
      const validationResult = validateForSubmission(
        data,
        useRequiredDocuments.getState().documents,
        useDocumentStore.getState().documents,
      );
      console.log('Validation result:', validationResult);

      if (!validationResult.success) {
        toast.error(validationResult.error);
        console.log('Validation failed, submission canceled');
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
  React.useEffect(() => {
    console.log('Application loading status:', isLoading);
  }, [isLoading]);

  if (!application && id) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-zinc-800/50">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {(!application?.submittedAt || user?.role !== Role.USER) && (
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

            // Проверка на идущий запрос - если форма в процессе отправки, не обрабатываем повторные нажатия
            if (form.formState.isSubmitting) {
              console.log('Форма уже отправляется, игнорируем повторный запрос');
              return;
            }

            try {
              // Получаем значения формы напрямую
              const values = form.getValues();
              console.log('Form values on submit:', values);

              // Детальный вывод состояния формы для диагностики
              console.log('Состояние формы:', {
                isDirty: form.formState.isDirty,
                isValid: form.formState.isValid,
                errors: form.formState.errors,
                isSubmitted: form.formState.isSubmitted,
                isSubmitting: form.formState.isSubmitting,
                isSubmitSuccessful: form.formState.isSubmitSuccessful,
                touchedFields: form.formState.touchedFields,
                dirtyFields: form.formState.dirtyFields,
              });

              // Обновим документы из хранилища в значения формы для надежности (однократно)
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

                  // Устанавливаем документы в форму
                  form.setValue('documents', documentValues, {
                    shouldValidate: true,
                  });
                  console.log('Обновленные значения документов:', documentValues);
                }
              }

              // Используем одну валидацию вместо двух
              // Проверка валидности формы без цикличных вызовов
              form
                .trigger()
                .then((isValid) => {
                  console.log('Form validation result:', isValid);

                  // Если форма не валидна, показываем ошибки
                  if (!isValid) {
                    console.log('Form validation failed, errors:', form.formState.errors);
                    const errorFields = Object.keys(form.formState.errors);
                    console.log('Invalid fields:', errorFields);

                    // Анализируем ошибки валидации более подробно
                    let errorMessages = errorFields
                      .map((field) => {
                        const error = form.formState.errors[field as any];
                        return `Поле "${field}": ${error?.message || 'ошибка валидации'}`;
                      })
                      .join(', ');

                    toast.error(
                      errorMessages || 'Форма содержит ошибки. Пожалуйста, проверьте все поля.',
                    );
                    return;
                  }

                  // Если форма валидна, проверяем документы
                  try {
                    const validationResult = validateForSubmission(
                      values,
                      useRequiredDocuments.getState().documents,
                      useDocumentStore.getState().documents,
                    );
                    console.log('Manual document validation result:', validationResult);

                    if (!validationResult.success) {
                      toast.error(validationResult.error);
                      return;
                    }

                    // Если все проверки пройдены, отправляем форму
                    console.log('Form is valid, proceeding with submission');
                    handleSubmit(values);
                  } catch (validationError) {
                    console.error('Error validating documents:', validationError);
                    toast.error('Ошибка при проверке документов');
                  }
                })
                .catch((error) => {
                  console.error('Error during form validation:', error);
                  toast.error('Ошибка валидации формы');
                });
            } catch (error) {
              console.error('Error during form submission:', error);
              toast.error(`Ошибка при отправке формы: ${error}`);
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
                  application={application as ExtendedApplication}
                  isSubmitted={isReadOnly}
                />
              </TabsContent>

              {!isAdult && (
                <TabsContent value="representative">
                  <RepresentativeForm
                    application={application as ExtendedApplication}
                    isSubmitted={isReadOnly}
                  />
                </TabsContent>
              )}

              <TabsContent value="details">
                <Details
                  application={application as ExtendedApplication}
                  isSubmitted={isReadOnly}
                />
              </TabsContent>

              <TabsContent value="documents">
                <RequiredDocs
                  application={application as unknown as ExtendedApplication}
                  isSubmitted={isReadOnly}
                />
              </TabsContent>
            </fieldset>
          </Tabs>

          {/* Кнопка Next для перемещения по табам */}
          {(!application?.submittedAt || user?.role !== Role.USER) && (
            <div className="mt-6 flex justify-end gap-4">
              <Button
                type="button"
                onClick={handleSaveDraftClick}
                variant="outline"
                disabled={isReadOnly}
              >
                {c('saveDraft')}
              </Button>
              {activeTab !== 'documents' ? (
                <Button
                  type="button"
                  onClick={() => {
                    // Логика переключения на следующий таб
                    if (activeTab === 'applicant') {
                      // Если взрослый, переходим на details, иначе на representative
                      handleTabChange(isAdult ? 'details' : 'representative');
                    } else if (activeTab === 'representative') {
                      handleTabChange('details');
                    } else if (activeTab === 'details') {
                      handleTabChange('documents');
                    }
                  }}
                  disabled={isReadOnly}
                >
                  {c('next')}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isReadOnly}
                  onClick={() => console.log('Submit button clicked')}
                >
                  {c('submitApplication')}
                </Button>
              )}
            </div>
          )}
        </form>
      </Form>

      {/* Тестовая форма для проверки работы submit */}
      {/* <div className="mt-5 rounded border border-red-200 p-4">
        <h3 className="font-bold">Тестовая форма</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log('Test form submitted');
            alert('Test form submitted!');
          }}
        >
          <Button type="submit">Тестовый Submit</Button>
        </form>
        <div className="mt-2">
          <Button
            onClick={async () => {
              console.log('Testing API request...');
              console.log('Current form values:', form.getValues());
              try {
                if (!id) {
                  console.error('No ID available');
                  return;
                }

                const testRequest = {
                  applicant: {
                    givennames: 'Test Name',
                    surname: 'Test Surname',
                  },
                };

                console.log('Sending test request to API...');
                const result = await updateApplication(id, testRequest);
                console.log('Test request result:', result);

                if (result.error) {
                  alert(`Ошибка: ${result.error}`);
                } else {
                  alert('Тестовый запрос выполнен успешно!');
                }
              } catch (error) {
                console.error('Error during test request:', error);
                alert(`Ошибка запроса: ${error}`);
              }
            }}
            type="button"
            variant="destructive"
          >
            Проверить API
          </Button>
          <span className="ml-2">Статус загрузки: {isLoading ? 'Загрузка...' : 'Готово'}</span>
        </div>
      </div> */}

      {hasAccess(user?.role as Role, Role.CONSULTANT) && (
        <div className="flex w-full flex-col justify-between gap-4 md:flex-row">
          <Info />
          <LogHistory />
        </div>
      )}
    </div>
  );
}
