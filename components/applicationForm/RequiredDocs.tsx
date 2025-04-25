import { useFormContext } from 'react-hook-form';
import { useRequiredDocuments } from '@/store/useRequiredDocuments';
import { useDocumentStore } from '@/store/useDocumentStore';
import { ExtendedApplication } from '@/types/application';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { differenceInYears } from 'date-fns';
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useLocale, useTranslations } from 'next-intl';
import { Document } from '@prisma/client';
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
  const form = useFormContext();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG] Form or documents changed');
    }
  }, [form, uploadedDocuments]);

  const filteredDocuments = requiredDocuments.filter((doc) => {
    const isKzCitizen = application.applicant?.isCitizenshipKz;
    const matchesCountry = doc.countries.some(
      (country) => country === (isKzCitizen ? 'KAZAKHSTAN' : 'OTHER'),
    );

    const birthDate = application.applicant?.birthDate;
    const age = birthDate ? differenceInYears(new Date(), new Date(birthDate)) : 0;
    const isAdult = age >= 18;
    const matchesAgeCategory = doc.ageCategories.some(
      (category) => category === (isAdult ? 'ADULT' : 'MINOR'),
    );

    const matchesAcademicLevel = doc.academicLevels.some(
      (level) => level === application.details?.academicLevel,
    );

    const matchesStudyType = doc.studyTypes.some((type) => type === application.details?.type);

    return matchesCountry && matchesAgeCategory && matchesAcademicLevel && matchesStudyType;
  });

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

  useEffect(() => {
    fetchDocuments();
    if (application?.id) {
      fetchDocumentsByApplication(application.id);
    }
  }, [fetchDocuments, fetchDocumentsByApplication, application?.id]);

  useEffect(() => {
    if (uploadedDocuments.length > 0 && !documentsLoaded && !updatePendingRef.current) {
      updatePendingRef.current = true;

      const documentsValues = uploadedDocuments.reduce(
        (acc, doc) => {
          if (doc.code) {
            acc[doc.code] = doc.id;
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      form.setValue('documents', documentsValues, {
        shouldValidate: true,
        shouldDirty: false,
        shouldTouch: false,
      });

      setDocumentsLoaded(true);

      setTimeout(() => {
        updatePendingRef.current = false;
      }, 100);
    }
  }, [uploadedDocuments, form, documentsLoaded]);

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
            {filteredDocuments.map((doc) => {
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
                      <FormLabel>
                        {locale === 'ru'
                          ? doc.name_rus
                          : locale === 'en'
                            ? doc.name_eng
                            : doc.name_kaz}
                        {doc.isScanRequired && <span className="ml-1 text-red-500">*</span>}
                      </FormLabel>
                      <FormControl>
                        <div>
                          {uploadedDocument ? (
                            <div className="flex flex-wrap items-center gap-2">
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
                                  disabled={isSubmitted || isLoading[doc.code || '']}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Input
                              type="file"
                              multiple={false}
                              size={2000 * 5}
                              accept=".pdf,.jpg,.jpeg,.png,.PDF,.JPG,.JPEG,.PNG"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setIsLoading((prev) => ({ ...prev, [doc.code || '']: true }));
                                  const formData = new FormData();
                                  formData.append('file', file);

                                  if (application?.id) {
                                    formData.append('applicationId', application.id);
                                  }

                                  if (application?.applicant?.id) {
                                    formData.append('userId', application.applicant.id);
                                  }

                                  formData.append('documentCode', doc.code || '');

                                  try {
                                    const response = await fetch('/api/upload-required-document', {
                                      method: 'POST',
                                      body: formData,
                                    });

                                    if (!response.ok) {
                                      throw new Error('Failed to upload file');
                                    }

                                    const data = await response.json();

                                    updatePendingRef.current = true;

                                    field.onChange(data.document.id);

                                    form.setValue(`documents.${doc.code}`, data.document.id, {
                                      shouldValidate: true,
                                      shouldDirty: true,
                                      shouldTouch: true,
                                    });

                                    if (application?.id) {
                                      setDocumentsLoaded(false);
                                      fetchDocumentsByApplication(application.id);
                                    }

                                    setTimeout(() => {
                                      updatePendingRef.current = false;
                                    }, 100);
                                  } catch (error) {
                                    console.error('Error uploading file:', error);
                                  } finally {
                                    setIsLoading((prev) => ({ ...prev, [doc.code || '']: false }));
                                  }
                                }
                              }}
                              disabled={
                                (isSubmitted && doc.isScanRequired) || isLoading[doc.code || '']
                              }
                            />
                          )}
                        </div>
                      </FormControl>
                      {fieldState.error && (
                        <div className="mt-1 text-sm text-red-500">
                          {fieldState.error.message || 'Этот документ обязателен'}
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
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
