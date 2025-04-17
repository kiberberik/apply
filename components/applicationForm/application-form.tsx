'use client';

import { useForm, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { useSingleApplication, UpdateApplicationRequest } from '@/store/useSingleApplication';
import {
  RelationshipDegree,
  IdentificationDocumentType,
  StudyType,
  AcademicLevel,
  SupportLanguages,
} from '@prisma/client';
import ApplicantForm from './Applicant';
import RepresentativeForm from './Representative';
import Details from './Details';
import { RequiredDocs } from './RequiredDocs';
import { ExtendedApplication } from '@/types/application';
import React from 'react';

interface ApplicationFormProps {
  id?: string;
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
      relationshipDegree: z.nativeEnum(RelationshipDegree).optional().nullable(),
      email: z.string().email().optional().nullable(),
      phone: z.string().optional().nullable(),
      addressResidential: z.string().optional().nullable(),
      addressRegistration: z.string().optional().nullable(),
      applicantId: z.string().optional().nullable(),
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

// Схема с валидацией для отправки заявки
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
      relationshipDegree: z.nativeEnum(RelationshipDegree).optional().nullable(),
      email: z.string().email().optional().nullable(),
      phone: z.string().optional().nullable(),
      addressResidential: z.string().optional().nullable(),
      addressRegistration: z.string().optional().nullable(),
      applicantId: z.string().optional().nullable(),
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

// interface ApplicantFormProps {
//   application: ExtendedApplication;
// }

// interface RepresentativeFormProps {
//   application: ExtendedApplication;
// }

// interface DetailsFormProps {
//   application: ExtendedApplication;
// }

// interface RequiredDocsProps {
//   form: UseFormReturn<FormValues>;
//   application: ExtendedApplication;
// }

export default function ApplicationForm({ id }: ApplicationFormProps) {
  const c = useTranslations('Common');
  const router = useRouter();
  const { application, updateApplication, fetchApplication } = useSingleApplication();
  const tApplicant = useTranslations('Applicant');
  const tRepresentative = useTranslations('Representative');
  const tDetails = useTranslations('Details');
  const tDocuments = useTranslations('Documents');
  const [activeTab, setActiveTab] = React.useState('applicant');
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(draftSchema),
    defaultValues: {
      applicant: application?.applicant
        ? {
            ...application.applicant,
            birthDate: application.applicant.birthDate
              ? new Date(application.applicant.birthDate).toISOString().split('T')[0]
              : null,
          }
        : null,
      representative: application?.representative || null,
      details: application?.details
        ? {
            ...application.details,
            type: application.details.type || null,
            academicLevel: application.details.academicLevel || null,
            studyingLanguage: application.details.studyingLanguage || null,
            contractLanguage: application.contractLanguage || null,
          }
        : null,
      documents: application?.documents ? {} : null,
    },
  });

  // Отслеживаем изменения в форме
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name) {
        setHasUnsavedChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSaveDraftClick = async () => {
    try {
      // Получение текущих значений формы без валидации
      const values = form.getValues();
      console.log('Save draft clicked with values:', JSON.stringify(values, null, 2));

      // Проверяем, что есть данные аппликанта
      if (values.applicant) {
        console.log('Validating applicant data before save');

        // Проверяем наличие основных полей
        if (!values.applicant.givennames) {
          console.warn('Applicant givennames is empty');
        }

        if (!values.applicant.surname) {
          console.warn('Applicant surname is empty');
        }
      } else {
        console.warn('No applicant data found in form values');

        // Если данных нет в форме, но они есть в приложении, используем их
        if (application?.applicant) {
          console.log('Using application applicant data since form values are empty');
          values.applicant = {
            ...application.applicant,
            birthDate: application.applicant.birthDate
              ? new Date(application.applicant.birthDate).toISOString().split('T')[0]
              : null,
          };
        } else {
          console.error('No applicant data available in form or application');
        }
      }

      // Вызываем функцию сохранения данных напрямую
      const result = await saveFormData(values, false);

      if (result) {
        console.log('Draft saved successfully');
      } else {
        console.error('Failed to save draft');
      }
    } catch (error) {
      console.error('Error in handleSaveDraftClick:', error);
    }
  };

  // Общая функция для сохранения данных формы
  const saveFormData = async (data: FormValues, isSubmit: boolean) => {
    try {
      if (!id) return false;

      // Если данные пустые, пробуем использовать текущие данные приложения
      if (!data.applicant && application?.applicant) {
        console.log('Using application.applicant data since form data is empty');
        data.applicant = {
          ...application.applicant,
          birthDate: application.applicant.birthDate
            ? new Date(application.applicant.birthDate).toISOString().split('T')[0]
            : null,
        };
      }

      // Проверка на корректность данных перед отправкой
      if (!data.applicant) {
        console.error('No applicant data available for saving');
      }

      console.log(
        `Saving ${isSubmit ? 'submission' : 'draft'} with data:`,
        JSON.stringify(data, null, 2),
      );

      // Если это не отправка формы, очищаем ошибки валидации
      if (!isSubmit) {
        form.clearErrors();
      }

      // Подготавливаем данные для отправки с гарантированно корректным форматом даты
      const requestData: UpdateApplicationRequest = {
        applicant: data.applicant
          ? {
              ...data.applicant,
              birthDate: data.applicant.birthDate
                ? data.applicant.birthDate.includes('T')
                  ? data.applicant.birthDate
                  : new Date(data.applicant.birthDate + 'T00:00:00.000Z').toISOString()
                : null,
            }
          : null,
        representative: data.representative || null,
        details: data.details
          ? {
              ...data.details,
            }
          : null,
        contractLanguage: data.details?.contractLanguage || null,
        // Не отправляем документы в основном запросе
        // Документы должны быть загружены через отдельный API-маршрут
        // Только для отправки устанавливаем статус PROCESSING
        ...(isSubmit ? { statusId: 'PROCESSING' as const } : {}),
      };

      console.log('Sending to API:', JSON.stringify(requestData, null, 2));
      console.log('DEBUG - Applicant data:', JSON.stringify(requestData.applicant, null, 2));
      console.log(
        'DEBUG - Representative data:',
        JSON.stringify(requestData.representative, null, 2),
      );
      console.log('DEBUG - Details data:', JSON.stringify(requestData.details, null, 2));

      // Используем метод updateApplication из хука useSingleApplication вместо прямого запроса к API
      const result = await updateApplication(id, requestData);

      if (result.error) {
        console.error('API error:', result.error);
        throw new Error(`Failed to save ${isSubmit ? 'submission' : 'draft'}`);
      }

      // Здесь можно добавить код для загрузки документов, если они есть
      // if (data.documents) {
      //   // Загрузка документов через отдельный API-маршрут
      //   console.log('Uploading documents...');
      //   // Код для загрузки документов
      // }

      // Получаем обновленное приложение из состояния
      const updatedApplication = application;
      console.log('Updated application:', JSON.stringify(updatedApplication, null, 2));

      // Обновляем состояние формы с новыми данными
      const newFormData = {
        applicant: updatedApplication?.applicant
          ? {
              ...updatedApplication.applicant,
              birthDate: updatedApplication.applicant.birthDate
                ? new Date(updatedApplication.applicant.birthDate).toISOString().split('T')[0]
                : null,
            }
          : null,
        representative: updatedApplication?.representative || null,
        details: updatedApplication?.details
          ? {
              ...updatedApplication.details,
              type: updatedApplication.details.type || null,
              academicLevel: updatedApplication.details.academicLevel || null,
              studyingLanguage: updatedApplication.details.studyingLanguage || null,
              contractLanguage: updatedApplication.contractLanguage || null,
            }
          : null,
        documents: updatedApplication?.documents ? {} : null,
      };

      // Сбрасываем состояние формы с новыми данными
      form.reset(newFormData);

      // Перезагружаем данные с сервера для синхронизации
      await fetchApplication(id);

      setHasUnsavedChanges(false);
      router.refresh();

      return true;
    } catch (error) {
      console.error(`Error saving ${isSubmit ? 'submission' : 'draft'}:`, error);
      return false;
    }
  };

  const handleSubmit = async (data: FormValues) => {
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
                  // Безопасно приводим путь к типу Path<FormValues>
                  form.setError(key as Path<FormValues>, {
                    type: 'manual',
                    message: `Проверьте поле ${fieldKey}: ${fieldValue[0]}`,
                  });
                }
              });
            } else if (key === 'documents' && '_errors' in value) {
              // Для документов устанавливаем ошибку на корневое поле
              form.setError('documents', {
                type: 'manual',
                message: Array.isArray(value._errors) ? value._errors[0] : 'Ошибка в документах',
              });
            }
          }
        });

        return;
      }

      // Сохраняем данные с флагом isSubmit = true
      await saveFormData(data, true);
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  if (!application) {
    return <div>Загрузка...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList>
            <TabsTrigger value="applicant">
              {tApplicant('title')}
              {hasUnsavedChanges && activeTab === 'applicant' && ' *'}
            </TabsTrigger>
            <TabsTrigger value="representative">
              {tRepresentative('title')}
              {hasUnsavedChanges && activeTab === 'representative' && ' *'}
            </TabsTrigger>
            <TabsTrigger value="details">
              {tDetails('title')}
              {hasUnsavedChanges && activeTab === 'details' && ' *'}
            </TabsTrigger>
            <TabsTrigger value="documents">
              {tDocuments('title')}
              {hasUnsavedChanges && activeTab === 'documents' && ' *'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applicant">
            <ApplicantForm application={application as ExtendedApplication} />
          </TabsContent>

          <TabsContent value="representative">
            <RepresentativeForm application={application as ExtendedApplication} />
          </TabsContent>

          <TabsContent value="details">
            <Details application={application as ExtendedApplication} />
          </TabsContent>

          <TabsContent value="documents">
            <RequiredDocs form={form} application={application as unknown as ExtendedApplication} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4">
          <Button type="button" onClick={handleSaveDraftClick} variant="outline">
            {c('saveDraft')}
          </Button>

          <Button type="submit">{c('submit')}</Button>
        </div>
      </form>
    </Form>
  );
}
