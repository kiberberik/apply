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

const draftSchema = z.object({
  applicant: z
    .object({
      givennames: z.string().optional().nullable(),
      surname: z.string().optional().nullable(),
      patronymic: z.string().optional().nullable(),
      birthDate: z.string().optional().nullable(),
      birthPlace: z.string().optional().nullable(),
      isCitizenshipKz: z.boolean().optional().nullable(),
      citizenship: z.string().optional().nullable(),
      identificationNumber: z.string().optional().nullable(),
      documentType: z.nativeEnum(IdentificationDocumentType).optional().nullable(),
      documentNumber: z.string().optional().nullable(),
      documentIssueDate: z.string().optional().nullable(),
      documentExpiryDate: z.string().optional().nullable(),
      documentIssuingAuthority: z.string().optional().nullable(),
      documentFileLinks: z.string().optional().nullable(),
      email: z.string().email().optional().nullable(),
      phone: z.string().optional().nullable(),
      addressResidential: z.string().optional().nullable(),
      addressRegistration: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  representative: z
    .object({
      givennames: z.string().optional().nullable(),
      surname: z.string().optional().nullable(),
      patronymic: z.string().optional().nullable(),
      isCitizenshipKz: z.boolean().optional().nullable(),
      citizenship: z.string().optional().nullable(),
      identificationNumber: z.string().optional().nullable(),
      documentType: z.nativeEnum(IdentificationDocumentType).optional().nullable(),
      documentNumber: z.string().optional().nullable(),
      documentIssueDate: z.string().optional().nullable(),
      documentExpiryDate: z.string().optional().nullable(),
      documentIssuingAuthority: z.string().optional().nullable(),
      documentFileLinks: z.string().optional().nullable(),
      representativeDocumentNumber: z.string().optional().nullable(),
      representativeDocumentIssueDate: z.string().optional().nullable(),
      representativeDocumentExpiryDate: z.string().optional().nullable(),
      representativeDocumentIssuingAuthority: z.string().optional().nullable(),
      representativeDocumentFileLinks: z.string().optional().nullable(),
      relationshipDegree: z.nativeEnum(RelationshipDegree).optional().nullable(),
      email: z.string().email().optional().nullable(),
      phone: z.string().optional().nullable(),
      addressResidential: z.string().optional().nullable(),
      addressRegistration: z.string().optional().nullable(),
      applicantId: z.string().optional().nullable(),
      id: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  details: z
    .object({
      type: z.nativeEnum(StudyType).optional().nullable(),
      academicLevel: z.nativeEnum(AcademicLevel).optional().nullable(),
      isDormNeeds: z.boolean().optional().nullable(),
      studyingLanguage: z.nativeEnum(SupportLanguages).optional().nullable(),
      educationalProgramId: z.string().optional().nullable(),
      contractLanguage: z.nativeEnum(SupportLanguages).optional().nullable(),
    })
    .optional()
    .nullable(),
  documents: z.record(z.string(), z.instanceof(File)).optional().nullable(),
});

const submitSchema = z.object({
  applicant: z
    .object({
      givennames: z.string({ required_error: 'Обязательное поле' }),
      surname: z.string({ required_error: 'Обязательное поле' }),
      patronymic: z.string().optional().nullable(),
      birthDate: z.string({ required_error: 'Обязательное поле' }),
      birthPlace: z.string({ required_error: 'Обязательное поле' }),
      isCitizenshipKz: z.boolean({ required_error: 'Обязательное поле' }),
      citizenship: z.string().optional().nullable(),
      identificationNumber: z.string().optional().nullable(),
      documentType: z.nativeEnum(IdentificationDocumentType).optional().nullable(),
      documentNumber: z.string().optional().nullable(),
      documentIssueDate: z.string().optional().nullable(),
      documentExpiryDate: z.string().optional().nullable(),
      documentIssuingAuthority: z.string().optional().nullable(),
      documentFileLinks: z.string().optional().nullable(),
      email: z.string({ required_error: 'Обязательное поле' }).email('Некорректный формат email'),
      phone: z.string({ required_error: 'Обязательное поле' }),
      addressResidential: z.string({ required_error: 'Обязательное поле' }),
      addressRegistration: z.string({ required_error: 'Обязательное поле' }),
    })
    .required(),
  representative: z
    .object({
      givennames: z.string().optional().nullable(),
      surname: z.string().optional().nullable(),
      patronymic: z.string().optional().nullable(),
      isCitizenshipKz: z.boolean().optional().nullable(),
      citizenship: z.string().optional().nullable(),
      identificationNumber: z.string().optional().nullable(),
      documentType: z.nativeEnum(IdentificationDocumentType).optional().nullable(),
      documentNumber: z.string().optional().nullable(),
      documentIssueDate: z.string().optional().nullable(),
      documentExpiryDate: z.string().optional().nullable(),
      documentIssuingAuthority: z.string().optional().nullable(),
      documentFileLinks: z.string().optional().nullable(),
      representativeDocumentNumber: z.string().optional().nullable(),
      representativeDocumentIssueDate: z.string().optional().nullable(),
      representativeDocumentExpiryDate: z.string().optional().nullable(),
      representativeDocumentIssuingAuthority: z.string().optional().nullable(),
      representativeDocumentFileLinks: z.string().optional().nullable(),
      relationshipDegree: z.nativeEnum(RelationshipDegree).optional().nullable(),
      email: z.string().email().optional().nullable(),
      phone: z.string().optional().nullable(),
      addressResidential: z.string().optional().nullable(),
      addressRegistration: z.string().optional().nullable(),
      applicantId: z.string().optional().nullable(),
      id: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  details: z
    .object({
      type: z.nativeEnum(StudyType, { required_error: 'Обязательное поле' }),
      academicLevel: z.nativeEnum(AcademicLevel, { required_error: 'Обязательное поле' }),
      isDormNeeds: z.boolean().optional().nullable(),
      studyingLanguage: z.nativeEnum(SupportLanguages, { required_error: 'Обязательное поле' }),
      educationalProgramId: z.string({ required_error: 'Обязательное поле' }),
      contractLanguage: z.nativeEnum(SupportLanguages, { required_error: 'Обязательное поле' }),
    })
    .required(),
  documents: z.record(z.string(), z.instanceof(File)).optional().nullable(),
});

type FormValues = z.infer<typeof draftSchema>;

export default function ApplicationForm({ id }: ApplicationFormProps) {
  const c = useTranslations('Common');
  const { application, updateApplication, fetchApplication } = useSingleApplication();

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

  const form = useForm<FormValues>({
    resolver: zodResolver(draftSchema),
    defaultValues: React.useMemo(
      () => ({
        applicant: application?.applicant
          ? {
              givennames: application.applicant.givennames || '',
              surname: application.applicant.surname || '',
              patronymic: application.applicant.patronymic || '',
              birthDate: application.applicant.birthDate
                ? dateUtils.formatToInputDate(application.applicant.birthDate)
                : '',
              birthPlace: application.applicant.birthPlace || '',
              isCitizenshipKz: application.applicant.isCitizenshipKz || false,
              citizenship: application.applicant.citizenship || '',
              identificationNumber: application.applicant.identificationNumber || '',
              documentType: application.applicant.documentType || undefined,
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
              patronymic: '',
              birthDate: '',
              birthPlace: '',
              isCitizenshipKz: false,
              citizenship: '',
              identificationNumber: '',
              documentType: undefined,
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
              patronymic: application.representative.patronymic || '',
              isCitizenshipKz: application.representative.isCitizenshipKz || false,
              citizenship: application.representative.citizenship || '',
              identificationNumber: application.representative.identificationNumber || '',
              documentType: application.representative.documentType || undefined,
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
              relationshipDegree: application.representative.relationshipDegree || undefined,
              email: application.representative.email || '',
              phone: application.representative.phone || '',
              addressResidential: application.representative.addressResidential || '',
              addressRegistration: application.representative.addressRegistration || '',
              applicantId: application.representative.applicantId || '',
              id: application.representative.id || '',
            }
          : {
              givennames: '',
              surname: '',
              patronymic: '',
              isCitizenshipKz: false,
              citizenship: '',
              identificationNumber: '',
              documentType: undefined,
              documentNumber: '',
              documentIssueDate: '',
              documentExpiryDate: '',
              documentIssuingAuthority: '',
              documentFileLinks: '',
              representativeDocumentNumber: '',
              representativeDocumentIssueDate: '',
              representativeDocumentExpiryDate: '',
              representativeDocumentIssuingAuthority: '',
              representativeDocumentFileLinks: '',
              relationshipDegree: undefined,
              email: '',
              phone: '',
              addressResidential: '',
              addressRegistration: '',
              applicantId: '',
              id: '',
            },
        details: application?.details
          ? {
              type: application.details.type || undefined,
              academicLevel: application.details.academicLevel || undefined,
              isDormNeeds: application.details.isDormNeeds || false,
              studyingLanguage: application.details.studyingLanguage || undefined,
              educationalProgramId: application.details.educationalProgramId || '',
              contractLanguage: application.contractLanguage || undefined,
            }
          : {
              type: undefined,
              academicLevel: undefined,
              isDormNeeds: false,
              studyingLanguage: undefined,
              educationalProgramId: '',
              contractLanguage: undefined,
            },
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

        form.setValue('applicant', applicantData, {
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

        form.setValue('representative', representativeData, {
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
            contractLanguage: application.contractLanguage || undefined,
          },
          {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          },
        );
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
    try {
      if (!id) return false;
      if (!data.applicant && application?.applicant) {
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
        contractLanguage: data.details?.contractLanguage || null,
        ...(isSubmit ? { statusId: 'PROCESSING' as const } : {}),
      };
      if (application) {
        previousAppRef.current = JSON.stringify(application);
      }
      const result = await updateApplication(id, requestData);
      if (result.error) {
        console.error('API error:', result.error);
        throw new Error(`Failed to save ${isSubmit ? 'submission' : 'draft'}`);
      }

      // Обновляем данные после сохранения
      await fetchApplication(id);

      // Обновляем значения в форме непосредственно на основе обновленных данных из хранилища
      const updatedApplication = useSingleApplication.getState().application;
      if (updatedApplication) {
        // Устанавливаем флаг, что сейчас будет обновление формы программным путем
        setHasUnsavedChanges(false);

        // Обновляем applicant
        if (updatedApplication.applicant) {
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
          form.setValue('applicant', applicantData, {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          });
        }

        // Обновляем representative
        if (updatedApplication.representative) {
          const representativeData = {
            ...updatedApplication.representative,
            documentIssueDate: updatedApplication.representative.documentIssueDate
              ? dateUtils.formatToInputDate(updatedApplication.representative.documentIssueDate)
              : '',
            documentExpiryDate: updatedApplication.representative.documentExpiryDate
              ? dateUtils.formatToInputDate(updatedApplication.representative.documentExpiryDate)
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
          form.setValue('representative', representativeData, {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          });
        }

        // Обновляем details
        if (updatedApplication.details) {
          form.setValue(
            'details',
            {
              ...updatedApplication.details,
              contractLanguage: updatedApplication.contractLanguage || undefined,
            },
            {
              shouldDirty: false,
              shouldTouch: false,
              shouldValidate: false,
            },
          );
        }

        // Обновляем флаг совершеннолетия
        if (updatedApplication.applicant?.birthDate) {
          setTimeout(() => setIsAdult(isApplicantAdult()), 0);
        }

        previousAppRef.current = JSON.stringify(updatedApplication);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(`application-tab-${id}`, activeTab);
      }

      form.trigger();
      return true;
    } catch (error) {
      console.error(`Error saving ${isSubmit ? 'submission' : 'draft'}:`, error);
      return false;
    }
  };

  const handleSubmit = async (data: FormValues) => {
    // Если форма заблокирована, ничего не делаем
    if (isReadOnly) return;

    try {
      if (!id) return;

      // Валидация данных перед отправкой
      const validationResult = submitSchema.safeParse(data);
      if (!validationResult.success) {
        console.error('Validation errors:', validationResult.error.format());
        // Показываем ошибки валидации в форме
        const errors = validationResult.error.format();

        // Проходим по всем полям с ошибками и устанавливаем их в форму
        Object.entries(errors).forEach(([key, value]) => {
          if (key !== '_errors' && typeof value === 'object') {
            // Если корневое поле содержит вложенные ошибки
            if (key === 'applicant' || key === 'representative' || key === 'details') {
              // Для каждого вложенного поля устанавливаем ошибку
              Object.entries(value).forEach(([fieldKey, fieldValue]) => {
                if (fieldKey !== '_errors' && Array.isArray(fieldValue)) {
                  const fieldPath = `${key}.${fieldKey}` as Path<FormValues>;
                  form.setError(fieldPath, {
                    type: 'manual',
                    message: fieldValue[0],
                  });
                }
              });
            } else if (key === 'documents' && '_errors' in value) {
              // Для документов устанавливаем ошибку на корневое поле
              form.setError('documents' as Path<FormValues>, {
                type: 'manual',
                message: Array.isArray(value._errors) ? value._errors[0] : 'Ошибка в документах',
              });
            }
          }
        });

        // Если в ошибках есть поля из вкладки applicant, переключаемся на неё
        if ('applicant' in errors) {
          setActiveTab('applicant');
        }
        // Иначе если есть ошибки в representative и аппликант не совершеннолетний
        else if ('representative' in errors && !isApplicantAdult()) {
          setActiveTab('representative');
        }
        // Иначе если есть ошибки в details
        else if ('details' in errors) {
          setActiveTab('details');
        }
        // Иначе если есть ошибки в documents
        else if ('documents' in errors) {
          setActiveTab('documents');
        }

        return;
      }

      // Сохраняем данные с флагом isSubmit = true
      await saveApplicantFormData(data, true);
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  const formKey = `application-form-${id || 'new'}`;

  if (!application && id) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-zinc-800/50">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
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
      <Form {...form} key={formKey}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-8">
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

            <fieldset disabled={isReadOnly} className="mt-4 space-y-4">
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
          {(!isSubmitted || user?.role !== Role.USER) && (
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
                <Button type="submit" disabled={isReadOnly}>
                  {c('submitApplication')}
                </Button>
              )}
            </div>
          )}
        </form>
      </Form>
      {hasAccess(user?.role as Role, Role.CONSULTANT) && (
        <div className="flex w-full flex-col justify-between gap-4 md:flex-row">
          <Info />
          <LogHistory />
        </div>
      )}
    </div>
  );
}
