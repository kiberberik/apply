import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Divider from '../ui/divider';
import { IdentificationDocumentType } from '@prisma/client';
import { ExtendedApplication } from '@/types/application';
import { useDocumentStore } from '@/store/useDocumentStore';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface ApplicantProps {
  application: ExtendedApplication | null;
  isSubmitted?: boolean;
}

function Applicant({ application, isSubmitted = false }: ApplicantProps) {
  const t = useTranslations('Applicant');
  const c = useTranslations('Common');
  const tCitizenship = useTranslations('Citizenship');
  const tDocument = useTranslations('Document');
  const { fetchDocument } = useDocumentStore();
  const form = useFormContext();

  const isFieldChanged = (fieldName: string) => {
    const defaultValue = application?.applicant?.[fieldName as keyof typeof application.applicant];
    const currentValue = form.getValues(`applicant.${fieldName}`);
    return defaultValue !== currentValue;
  };

  useEffect(() => {
    if (application?.applicant) {
      const formattedBirthDate = application.applicant.birthDate
        ? new Date(application.applicant.birthDate).toISOString().split('T')[0]
        : null;

      form.setValue('applicant', {
        ...application.applicant,
        birthDate: formattedBirthDate,
      });
    }
  }, [application?.applicant, form]);

  useEffect(() => {
    if (application?.applicant?.identificationDocId) {
      fetchDocument(application?.applicant?.identificationDocId);
    }
  }, [application?.applicant?.identificationDocId, fetchDocument]);

  const documentType = form.watch('applicant.documentType');
  const isCitizenshipKz = form.watch('applicant.isCitizenshipKz');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="applicant.isCitizenshipKz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('citizenship')}</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'true')}
                    defaultValue={field.value ? 'true' : 'false'}
                    disabled={isSubmitted}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          '',
                          isFieldChanged('isCitizenshipKz') ? 'border-yellow-500' : '',
                        )}
                      >
                        <SelectValue placeholder={tCitizenship('selectCitizenship')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">{tCitizenship('KAZAKHSTAN')}</SelectItem>
                      <SelectItem value="false">{tCitizenship('OTHER')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isCitizenshipKz && (
              <>
                <FormField
                  control={form.control}
                  name="applicant.citizenship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tCitizenship('enterCitizenship')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          className={cn(
                            '',
                            isFieldChanged('citizenship') ? 'border-yellow-500' : '',
                          )}
                          disabled={isSubmitted}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {isCitizenshipKz && (
              <>
                <FormField
                  control={form.control}
                  name="applicant.documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('documentType')}</FormLabel>
                      <Select
                        disabled={isSubmitted}
                        onValueChange={field.onChange}
                        defaultValue={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              '',
                              isFieldChanged('documentType') ? 'border-yellow-500' : '',
                            )}
                          >
                            <SelectValue placeholder={tDocument('selectDocumentType')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ID_CARD">{tDocument('ID_CARD')}</SelectItem>
                          <SelectItem value="PASSPORT">{tDocument('PASSPORT')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          <div className="flex flex-col justify-start gap-4 md:flex-row">
            <FormField
              control={form.control}
              name="applicant.identificationDoc.link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {documentType === IdentificationDocumentType.ID_CARD
                      ? tDocument('id_card')
                      : tDocument('passport')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      multiple={false}
                      size={124 * 5}
                      accept="image/*"
                      disabled={isSubmitted}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('file', file);

                          try {
                            const response = await fetch('/api/upload', {
                              method: 'POST',
                              body: formData,
                            });

                            if (!response.ok) {
                              throw new Error('Failed to upload file');
                            }

                            const data = await response.json();
                            field.onChange(data.url);
                          } catch (error) {
                            console.error('Error uploading file:', error);
                          }
                        }
                      }}
                    />
                  </FormControl>
                  {field.value && (
                    <div className="mt-2">
                      <a
                        href={field.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {c('view')}
                      </a>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="my-5" disabled={isSubmitted}>
              {c('loadDataFromDocument')}
            </Button>
          </div>
          <div className="my-auto grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="applicant.identificationDoc.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tDocument('number')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} disabled={isSubmitted} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applicant.identificationDoc.issuingAuthority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tDocument('issuingAuthority')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} disabled={isSubmitted} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applicant.identificationDoc.issueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tDocument('issueDate')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      value={field.value || ''}
                      disabled={isSubmitted}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applicant.identificationDoc.expirationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tDocument('expirationDate')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      value={field.value || ''}
                      disabled={isSubmitted}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {(!isCitizenshipKz || (isCitizenshipKz && documentType)) && (
            <>
              <Divider className="my-12" />
              {isCitizenshipKz && (
                <FormField
                  control={form.control}
                  name="applicant.identificationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tDocument('identificationNumber')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} disabled={isSubmitted} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className={`grid grid-cols-1 gap-4 md:grid-cols-3`}>
                <FormField
                  control={form.control}
                  name="applicant.surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('surname')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} disabled={isSubmitted} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicant.givennames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('givennames')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} disabled={isSubmitted} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicant.patronymic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('patronymic')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} disabled={isSubmitted} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="applicant.birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('birthDate')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          value={field.value || ''}
                          disabled={isSubmitted}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicant.birthPlace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('birthPlace')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} disabled={isSubmitted} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="applicant.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('email')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          value={field.value || ''}
                          disabled={isSubmitted}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicant.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phone')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} disabled={isSubmitted} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="applicant.addressResidential"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('addressResidential')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} disabled={isSubmitted} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicant.addressRegistration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('addressRegistration')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} disabled={isSubmitted} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default Applicant;
