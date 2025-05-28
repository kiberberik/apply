import { useFormContext } from 'react-hook-form';
import { useRequiredDocuments } from '@/store/useRequiredDocuments';
import { useDocumentStore } from '@/store/useDocumentStore';
import { ExtendedApplication } from '@/types/application';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { differenceInYears } from 'date-fns';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useLocale, useTranslations } from 'next-intl';
import { ApplicationStatus, Document, Role } from '@prisma/client';
import { Button } from '../ui/button';
import { Eye, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import RequiredDocUploader from './RequiredDocUploader';
import { PDFProvider } from '../docReader/PDFContext';
import { Input } from '../ui/input';
import { format } from 'date-fns';
import { Checkbox } from '../ui/checkbox';
import { useAuthStore } from '@/store/useAuthStore';
import { useLogStore } from '@/store/useLogStore';

interface FormValues {
  documents: {
    [key: string]: string;
  };
  documentDetails: {
    [key: string]: {
      diplomaSerialNumber?: string;
      number?: string;
      issueDate?: string;
      isDelivered?: boolean;
    };
  };
  applicant: {
    isCitizenshipKz: boolean;
    birthDate: string;
  };
  details: {
    academicLevel: string;
    type: string;
  };
}

interface RequiredDocsProps {
  application: ExtendedApplication;
  isSubmitted?: boolean;
}

export function RequiredDocs({ application, isSubmitted = false }: RequiredDocsProps) {
  const { documents: requiredDocuments, fetchDocuments } = useRequiredDocuments();
  const {
    documents: uploadedDocuments,
    fetchDocumentsByApplication,
    deleteDocument,
    updateDocumentDeliveryStatus,
  } = useDocumentStore();
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; code: string } | null>(
    null,
  );
  const [documentsLoaded, setDocumentsLoaded] = useState(false);
  const updatePendingRef = useRef(false);
  const t = useTranslations('RequiredDocuments');
  const c = useTranslations('Common');
  const locale = useLocale();
  const form = useFormContext<FormValues>();
  const { user } = useAuthStore();
  const isConsultant = user?.role === Role.CONSULTANT;
  const isManager = user?.role === Role.MANAGER;

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG] Form or documents changed');
    }
  }, [form, uploadedDocuments]);

  // Отслеживаем изменения в форме
  const watchIsCitizenshipKz = form.watch('applicant.isCitizenshipKz');
  const watchBirthDate = form.watch('applicant.birthDate');
  const watchAcademicLevel = form.watch('details.academicLevel');
  const watchStudyType = form.watch('details.type');

  // Используем useMemo для оптимизации вычислений при изменении зависимостей
  const filteredDocuments = useMemo(() => {
    if (!requiredDocuments || requiredDocuments.length === 0) {
      return [];
    }

    return requiredDocuments.filter((doc) => {
      // Гражданство из формы
      const isKzCitizen = watchIsCitizenshipKz;
      const matchesCountry = doc.countries.some(
        (country) => country === (isKzCitizen ? 'KAZAKHSTAN' : 'OTHER'),
      );

      // Возраст из формы
      const birthDate = watchBirthDate;
      const age = birthDate ? differenceInYears(new Date(), new Date(birthDate)) : 0;
      const isAdult = age >= 18;
      const matchesAgeCategory = doc.ageCategories.some(
        (category) => category === (isAdult ? 'ADULT' : 'MINOR'),
      );

      // Академический уровень из формы
      const matchesAcademicLevel = doc.academicLevels.some((level) => level === watchAcademicLevel);

      // Тип обучения из формы
      const matchesStudyType = doc.studyTypes.some((type) => type === watchStudyType);

      return matchesCountry && matchesAgeCategory && matchesAcademicLevel && matchesStudyType;
    });
  }, [requiredDocuments, watchIsCitizenshipKz, watchBirthDate, watchAcademicLevel, watchStudyType]);

  // При изменении данных в форме выводим отладочную информацию
  // useEffect(() => {
  //   if (process.env.NODE_ENV === 'development') {
  //     console.log('[DEBUG] Form values changed:', {
  //       isCitizenshipKz: watchIsCitizenshipKz,
  //       birthDate: watchBirthDate,
  //       academicLevel: watchAcademicLevel,
  //       studyType: watchStudyType,
  //       filteredDocumentsCount: filteredDocuments.length,
  //     });
  //   }
  // }, [
  //   watchIsCitizenshipKz,
  //   watchBirthDate,
  //   watchAcademicLevel,
  //   watchStudyType,
  //   filteredDocuments.length,
  // ]);
  const { getLatestLogByApplicationId } = useLogStore();
  const latestLog = application?.id ? getLatestLogByApplicationId(application.id) : null;

  const getDocumentByCode = (code: string): Document | undefined => {
    return uploadedDocuments.find((doc) => doc.code === code);
  };

  const handleViewDocument = (link: string) => {
    window.open(link, '_blank');
  };

  const openDeleteConfirm = (documentId: string, documentCode: string) => {
    setDocumentToDelete({ id: documentId, code: documentCode });
    setConfirmDeleteOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      setIsLoading((prev) => ({ ...prev, [documentToDelete.code]: true }));
      await deleteDocument(documentToDelete.id);
      form.setValue(`documents.${documentToDelete.code}`, '', {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      form.trigger(`documents.${documentToDelete.code}`);
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setIsLoading((prev) => ({ ...prev, [documentToDelete.code]: false }));
      setDocumentToDelete(null);
      setConfirmDeleteOpen(false);
    }
  };

  const handleDeliveryStatusChange = async (doc: Document, isDelivered: boolean) => {
    try {
      setIsLoading((prev) => ({ ...prev, [doc.code || '']: true }));
      await updateDocumentDeliveryStatus(doc.id, isDelivered);
    } catch (error) {
      console.error('Error updating document delivery status:', error);
    } finally {
      setIsLoading((prev) => ({ ...prev, [doc.code || '']: false }));
    }
  };

  useEffect(() => {
    fetchDocuments();
    if (application?.id) {
      fetchDocumentsByApplication(application.id);
    }
  }, [fetchDocuments, fetchDocumentsByApplication, application?.id]);

  useEffect(() => {
    if (uploadedDocuments.length > 0) {
      // Синхронизируем значения isDelivered из uploadedDocuments с формой
      uploadedDocuments.forEach((doc) => {
        if (doc.code && doc.isDelivered !== undefined && doc.isDelivered !== null) {
          const currentValue = form.getValues(`documentDetails.${doc.code}.isDelivered`);
          if (currentValue !== Boolean(doc.isDelivered)) {
            form.setValue(`documentDetails.${doc.code}.isDelivered`, Boolean(doc.isDelivered), {
              shouldValidate: false,
              shouldDirty: false,
              shouldTouch: false,
            });
          }
        }
      });
    }
  }, [uploadedDocuments, form]);

  // Инициализируем начальные значения для всех полей формы
  useEffect(() => {
    if (uploadedDocuments.length > 0 && !documentsLoaded && !updatePendingRef.current) {
      updatePendingRef.current = true;

      // Инициализируем документы
      const documentsValues = uploadedDocuments.reduce(
        (acc, doc) => {
          if (doc.code) {
            acc[doc.code] = doc.id;
            if (doc.isDelivered !== undefined && doc.isDelivered !== null) {
              form.setValue(`documentDetails.${doc.code}.isDelivered`, Boolean(doc.isDelivered));
            }
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      // Инициализируем documentDetails
      const documentDetailsValues = uploadedDocuments.reduce(
        (acc, doc) => {
          if (doc.code === 'education_document') {
            acc[doc.code] = {
              diplomaSerialNumber: doc.diplomaSerialNumber || '',
              number: doc.number || '',
              issueDate: doc.issueDate ? format(new Date(doc.issueDate), 'yyyy-MM-dd') : '',
            };
          } else if (doc.code === 'ent_certificate' || doc.code === 'grant_certificate') {
            acc[doc.code] = {
              number: doc.number || '',
            };
          }
          return acc;
        },
        {} as FormValues['documentDetails'],
      );

      // Устанавливаем значения формы
      Object.entries(documentsValues).forEach(([key, value]) => {
        form.setValue(`documents.${key}`, value, { shouldValidate: false });
      });

      Object.entries(documentDetailsValues).forEach(([key, value]) => {
        form.setValue(`documentDetails.${key}`, value, { shouldValidate: false });
      });

      setDocumentsLoaded(true);

      setTimeout(() => {
        updatePendingRef.current = false;
      }, 100);
    }

    console.log(form.getValues('documentDetails'));
  }, [uploadedDocuments, form, documentsLoaded]);

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-10 py-4 md:grid-cols-1">
            {filteredDocuments.map((doc, index) => {
              const uploadedDocument = getDocumentByCode(doc.code || '');
              return (
                <FormField
                  key={doc.id}
                  control={form.control}
                  name={`documents.${doc.code}`}
                  rules={{
                    required: doc.isScanRequired ? 'Этот документ обязателен' : false,
                  }}
                  render={({ field, fieldState }) => (
                    <FormItem
                      className={fieldState.error ? 'rounded border border-red-500 p-2' : ''}
                    >
                      <div className="flex items-center justify-between">
                        <FormLabel htmlFor={`document-${doc.id}`}>
                          {index + 1}
                          {'. '}
                          {locale === 'ru'
                            ? doc.name_rus
                            : locale === 'en'
                              ? doc.name_eng
                              : doc.name_kaz}
                          {doc.isScanRequired && <span className="ml-1 text-red-500">*</span>}
                        </FormLabel>
                        {isConsultant &&
                          (latestLog?.statusId === ApplicationStatus.PROCESSING ||
                            latestLog?.statusId === ApplicationStatus.RE_PROCESSING) && (
                            <FormField
                              control={form.control}
                              name={`documentDetails.${doc.code}.isDelivered`}
                              render={() => (
                                <FormItem className="flex items-center gap-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={uploadedDocument?.isDelivered ?? false}
                                      onCheckedChange={(checked) => {
                                        if (uploadedDocument) {
                                          handleDeliveryStatusChange(
                                            uploadedDocument,
                                            checked as boolean,
                                          );
                                        }
                                      }}
                                      disabled={isLoading[doc.code || '']}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {t('isDelivered')}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          )}
                      </div>
                      <FormControl>
                        <div className="space-y-4">
                          {uploadedDocument ? (
                            <>
                              <div
                                className="flex flex-wrap items-center gap-4"
                                id={`document-${doc.id}`}
                              >
                                <span className="max-w-[200px] truncate text-sm">
                                  {uploadedDocument.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleViewDocument(uploadedDocument.link || '')}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                      openDeleteConfirm(uploadedDocument.id || '', doc.code || '')
                                    }
                                    disabled={
                                      (isSubmitted && !isManager) || isLoading[doc.code || '']
                                    }
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {doc.code === 'education_document' && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                  <FormField
                                    control={form.control}
                                    name={`documentDetails.${doc.code}.diplomaSerialNumber`}
                                    defaultValue=""
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>{t('diplomaSerialNumber')}</FormLabel>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            disabled={isSubmitted || isLoading[doc.code || '']}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`documentDetails.${doc.code}.number`}
                                    defaultValue=""
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>{t('documentNumber')}</FormLabel>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            disabled={isSubmitted || isLoading[doc.code || '']}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`documentDetails.${doc.code}.issueDate`}
                                    defaultValue=""
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>{t('documentIssueDate')}</FormLabel>
                                        <FormControl>
                                          <Input
                                            type="date"
                                            {...field}
                                            disabled={isSubmitted || isLoading[doc.code || '']}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              )}
                              {(doc.code === 'ent_certificate' ||
                                doc.code === 'grant_certificate') && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                                  <FormField
                                    control={form.control}
                                    name={`documentDetails.${doc.code}.number`}
                                    defaultValue=""
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>{t('documentNumber')}</FormLabel>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            disabled={isSubmitted || isLoading[doc.code || '']}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              )}
                            </>
                          ) : (
                            <PDFProvider
                              value={{
                                application: {
                                  id: application.id,
                                  applicant: application.applicant
                                    ? {
                                        id: application.applicant.id,
                                      }
                                    : undefined,
                                },
                                doc: {
                                  code: doc.code || '',
                                },
                                form,
                                field,
                                setDocumentsLoaded,
                                fetchDocumentsByApplication,
                              }}
                            >
                              <RequiredDocUploader />
                            </PDFProvider>
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{c('deleteConfirmTitle')}</DialogTitle>
            <DialogDescription>{c('deleteConfirmDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              {c('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDocument}
              disabled={isLoading[documentToDelete?.code || '']}
            >
              {isLoading[documentToDelete?.code || ''] ? c('deleting') : c('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
