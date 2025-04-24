import { useFormContext } from 'react-hook-form';
import { useRequiredDocuments } from '@/store/useRequiredDocuments';
import { useDocumentStore } from '@/store/useDocumentStore';
import { ExtendedApplication } from '@/types/application';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { differenceInYears } from 'date-fns';
import { useEffect, useState } from 'react';
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
  const t = useTranslations('RequiredDocuments');
  const locale = useLocale();
  const form = useFormContext();

  const filteredDocuments = requiredDocuments.filter((doc) => {
    // Проверка гражданства
    const isKzCitizen = application.applicant?.isCitizenshipKz;
    const matchesCountry = doc.countries.some(
      (country) => country === (isKzCitizen ? 'KAZAKHSTAN' : 'OTHER'),
    );

    // Проверка возраста
    const birthDate = application.applicant?.birthDate;
    const age = birthDate ? differenceInYears(new Date(), new Date(birthDate)) : 0;
    const isAdult = age >= 18;
    const matchesAgeCategory = doc.ageCategories.some(
      (category) => category === (isAdult ? 'ADULT' : 'MINOR'),
    );

    // Проверка академического уровня
    const matchesAcademicLevel = doc.academicLevels.some(
      (level) => level === application.details?.academicLevel,
    );

    // Проверка типа обучения
    const matchesStudyType = doc.studyTypes.some((type) => type === application.details?.type);

    return matchesCountry && matchesAgeCategory && matchesAcademicLevel && matchesStudyType;
  });

  // Функция для проверки, загружен ли документ
  const getDocumentByCode = (code: string): Document | undefined => {
    return uploadedDocuments.find((doc) => doc.code === code);
  };

  // Функция для открытия документа для просмотра
  const handleViewDocument = (link: string) => {
    window.open(link, '_blank');
  };

  // Функция для открытия диалога подтверждения удаления
  const openDeleteConfirm = (documentId: string, documentCode: string) => {
    setDocumentToDelete({ id: documentId, code: documentCode });
    setConfirmDeleteOpen(true);
  };

  // Функция для удаления документа
  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      setIsLoading((prev) => ({ ...prev, [documentToDelete.code]: true }));
      await deleteDocument(documentToDelete.id);
      form.setValue(`documents.${documentToDelete.code}`, '');
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {locale === 'ru'
                          ? doc.name_rus
                          : locale === 'en'
                            ? doc.name_eng
                            : doc.name_kaz}
                        {doc.isScanRequired && <span className="ml-1 text-red-500">*</span>}
                      </FormLabel>
                      <FormControl>
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
                                disabled={isSubmitted}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  openDeleteConfirm(uploadedDocument.id, doc.code || '')
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
                            size={124 * 5}
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

                                  // Обновляем значение поля в форме
                                  field.onChange(data.document.id);

                                  // Обновляем список загруженных документов
                                  if (application?.id) {
                                    fetchDocumentsByApplication(application.id);
                                  }
                                } catch (error) {
                                  console.error('Error uploading file:', error);
                                } finally {
                                  setIsLoading((prev) => ({ ...prev, [doc.code || '']: false }));
                                }
                              }
                            }}
                            disabled={isSubmitted || isLoading[doc.code || '']}
                          />
                        )}
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
            <DialogTitle>
              {locale === 'ru' ? 'Подтвердите удаление' : 'Confirm deletion'}
            </DialogTitle>
            <DialogDescription>
              {locale === 'ru'
                ? 'Вы уверены, что хотите удалить этот документ? Это действие нельзя отменить.'
                : 'Are you sure you want to delete this document? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              {locale === 'ru' ? 'Отмена' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDocument}
              disabled={isLoading[documentToDelete?.code || '']}
            >
              {locale === 'ru' ? 'Удалить' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
