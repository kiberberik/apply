import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Divider from '../ui/divider';
import { ExtendedApplication } from '@/types/application';
import { cn } from '@/lib/utils';
import dateUtils from '@/lib/dateUtils';
import { DocumentPreview } from '../ui/document-preview';
import React, { useState } from 'react';

interface RepresentativeProps {
  application: ExtendedApplication | null;
  isSubmitted?: boolean;
}

function Representative({ application, isSubmitted = false }: RepresentativeProps) {
  const t = useTranslations('Representative');
  const c = useTranslations('Common');
  const tCitizenship = useTranslations('Citizenship');
  const tDocument = useTranslations('Document');
  const form = useFormContext();
  const [localRepresentativeDocumentFileLinks, setLocalRepresentativeDocumentFileLinks] =
    useState<string>('');

  const isFieldChanged = (fieldName: string): boolean => {
    const value = form.watch(`representative.${fieldName}`);
    const defaultValue =
      application?.representative?.[fieldName as keyof typeof application.representative];

    if (fieldName.includes('Date') && value && defaultValue) {
      const date1 = new Date(value).setHours(0, 0, 0, 0);
      const date2 = new Date(defaultValue as Date).setHours(0, 0, 0, 0);
      return date1 !== date2;
    }

    if (value === null || value === undefined) {
      return defaultValue !== null && defaultValue !== undefined;
    }

    if (defaultValue === null || defaultValue === undefined) {
      return value !== null && value !== undefined;
    }

    if (typeof value === 'string' && typeof defaultValue === 'string') {
      const trimmedValue = value.trim();
      const trimmedDefault = defaultValue.trim();

      if (trimmedValue === '' && trimmedDefault === '') {
        return false;
      }

      return trimmedValue !== trimmedDefault;
    }

    return value !== defaultValue;
  };

  const documentType = form.watch('representative.documentType');
  const isCitizenshipKz = form.watch('representative.isCitizenshipKz');

  const representativeDocumentSection = form.watch('representative.relationshipDegree');

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
              name="representative.isCitizenshipKz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('citizenship')}</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'true')}
                    value={field.value ? 'true' : 'false'}
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
                  name="representative.citizenship"
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
                  name="representative.documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tDocument('documentType')}</FormLabel>
                      <Select
                        disabled={isSubmitted}
                        onValueChange={field.onChange}
                        value={field.value || ''}
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

          <div className="my-auto grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="representative.documentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tDocument('number')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      disabled={isSubmitted}
                      className={cn(
                        '',
                        isFieldChanged('documentNumber') ? 'border-yellow-500' : '',
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="representative.documentIssuingAuthority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tDocument('issuingAuthority')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      disabled={isSubmitted}
                      className={cn(
                        '',
                        isFieldChanged('documentIssuingAuthority') ? 'border-yellow-500' : '',
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="representative.documentIssueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tDocument('issueDate')}</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? dateUtils.formatToInputDate(field.value) : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value);
                      }}
                      disabled={isSubmitted}
                      className={cn(
                        '',
                        isFieldChanged('documentIssueDate') ? 'border-yellow-500' : '',
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="representative.documentExpiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tDocument('expirationDate')}</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? dateUtils.formatToInputDate(field.value) : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value);
                      }}
                      disabled={isSubmitted}
                      className={cn(
                        '',
                        isFieldChanged('documentExpiryDate') ? 'border-yellow-500' : '',
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {application?.representative?.documentFileLinks &&
              (() => {
                try {
                  return JSON.parse(application.representative.documentFileLinks).length > 0;
                } catch {
                  return false;
                }
              })() && (
                <div className="mt-4 flex flex-col">
                  <FormLabel>{c('uploadedDocuments')}</FormLabel>

                  <DocumentPreview
                    documentFileLinks={application?.representative?.documentFileLinks || null}
                    representativeId={application?.representative?.id}
                    onDocumentRemoved={() => {
                      form.setValue('representative.documentFileLinks', null);
                    }}
                    isSubmitted={isSubmitted}
                  />
                </div>
              )}
          </div>

          {(!isCitizenshipKz || (isCitizenshipKz && documentType)) && (
            <>
              <Divider className="my-12" />
              {isCitizenshipKz && (
                <FormField
                  control={form.control}
                  name="representative.identificationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tDocument('identificationNumber')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          className={cn(
                            '',
                            isFieldChanged('identificationNumber') ? 'border-yellow-500' : '',
                          )}
                          disabled={isSubmitted}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className={`grid grid-cols-1 gap-4 md:grid-cols-3`}>
                <FormField
                  control={form.control}
                  name="representative.surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('surname')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          className={cn('', isFieldChanged('surname') ? 'border-yellow-500' : '')}
                          disabled={isSubmitted}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="representative.givennames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('givennames')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          className={cn(
                            '',
                            isFieldChanged('givennames') ? 'border-yellow-500' : '',
                          )}
                          disabled={isSubmitted}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="representative.patronymic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('patronymic')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          className={cn(
                            '',
                            isFieldChanged('patronymic') ? 'border-yellow-500' : '',
                          )}
                          disabled={isSubmitted}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="representative.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('email')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          value={field.value || ''}
                          className={cn('', isFieldChanged('email') ? 'border-yellow-500' : '')}
                          disabled={isSubmitted}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="representative.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phone')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          className={cn('', isFieldChanged('phone') ? 'border-yellow-500' : '')}
                          disabled={isSubmitted}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="representative.addressResidential"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('addressResidential')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          className={cn(
                            '',
                            isFieldChanged('addressResidential') ? 'border-yellow-500' : '',
                          )}
                          disabled={isSubmitted}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="representative.addressRegistration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('addressRegistration')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          className={cn(
                            '',
                            isFieldChanged('addressRegistration') ? 'border-yellow-500' : '',
                          )}
                          disabled={isSubmitted}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="representative.relationshipDegree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('relationshipDegree')}</FormLabel>
                      <Select
                        disabled={isSubmitted}
                        onValueChange={field.onChange}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              '',
                              isFieldChanged('relationshipDegree') ? 'border-yellow-500' : '',
                            )}
                          >
                            <SelectValue placeholder={t('selectRelationshipDegree')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PARENT">{t('parent')}</SelectItem>
                          <SelectItem value="GUARDIAN">{t('guardian')}</SelectItem>
                          <SelectItem value="TRUSTEE">{t('trustee')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {representativeDocumentSection && (
                <div className="space-y-4">
                  <Divider />
                  <h3 className="text-xl font-bold">{t('representativeDoc')}</h3>

                  <FormField
                    control={form.control}
                    name="representative.representativeDocumentFileLinks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('representativeDoc')}</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            multiple={false}
                            size={2000 * 5} // 2000 * 5 = 10000kb = 10mb
                            accept=".pdf,.jpg,.jpeg,.png,.PDF,.JPG,.JPEG,.PNG"
                            className={cn(
                              '',
                              isFieldChanged('representativeDocumentFileLinks')
                                ? 'border-yellow-500'
                                : '',
                            )}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const formData = new FormData();
                                formData.append('file', file);

                                if (application?.representative?.id) {
                                  formData.append(
                                    'representativeId',
                                    application.representative.id,
                                  );
                                }
                                formData.append('activeTab', 'representative-document');

                                try {
                                  const response = await fetch('/api/upload-document', {
                                    method: 'POST',
                                    body: formData,
                                  });

                                  if (!response.ok) {
                                    throw new Error('Failed to upload file');
                                  }

                                  const data = await response.json();

                                  // Корректная обработка ссылок
                                  let currentLinks: string[] = [];

                                  try {
                                    // Пытаемся распарсить существующее значение
                                    if (field.value) {
                                      const parsed = JSON.parse(field.value);
                                      // Убедимся, что работаем с массивом строк
                                      if (Array.isArray(parsed)) {
                                        // Проверяем каждый элемент массива
                                        currentLinks = parsed
                                          .map((item) => {
                                            // Если элемент сам является JSON строкой, распарсим его
                                            if (
                                              typeof item === 'string' &&
                                              (item.startsWith('[') || item.startsWith('"'))
                                            ) {
                                              try {
                                                const innerParsed = JSON.parse(item);
                                                // Если это массив, берем первый элемент
                                                if (Array.isArray(innerParsed)) {
                                                  return innerParsed[0] || '';
                                                }
                                                return innerParsed || '';
                                              } catch {
                                                return item;
                                              }
                                            }
                                            return item;
                                          })
                                          .filter(Boolean);
                                      }
                                    }
                                  } catch (e) {
                                    console.error('Ошибка при парсинге ссылок:', e);
                                    // Если ошибка парсинга, начинаем с пустого массива
                                    currentLinks = [];
                                  }

                                  // Добавляем новую ссылку и сохраняем как JSON строку
                                  currentLinks.push(data.url);

                                  field.onChange(JSON.stringify(currentLinks));
                                  setLocalRepresentativeDocumentFileLinks(
                                    JSON.stringify(currentLinks),
                                  );

                                  if (
                                    !form.getValues(
                                      'representative.representativeDocumentIssueDate',
                                    )
                                  ) {
                                    form.setValue(
                                      'representative.representativeDocumentIssueDate',
                                      null,
                                      { shouldValidate: true },
                                    );
                                  }

                                  if (
                                    !form.getValues('representative.representativeDocumentNumber')
                                  ) {
                                    form.setValue(
                                      'representative.representativeDocumentNumber',
                                      null,
                                      { shouldValidate: true },
                                    );
                                  }

                                  if (
                                    !form.getValues(
                                      'representative.representativeDocumentIssuingAuthority',
                                    )
                                  ) {
                                    form.setValue(
                                      'representative.representativeDocumentIssuingAuthority',
                                      null,
                                      { shouldValidate: true },
                                    );
                                  }
                                  if (
                                    !form.getValues(
                                      'representative.representativeDocumentExpiryDate',
                                    )
                                  ) {
                                    form.setValue(
                                      'representative.representativeDocumentExpiryDate',
                                      null,
                                      { shouldValidate: true },
                                    );
                                  }
                                } catch (error) {
                                  console.error('Error uploading file:', error);
                                }
                              }
                            }}
                            disabled={isSubmitted}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DocumentPreview
                    documentFileLinks={
                      localRepresentativeDocumentFileLinks ||
                      application?.representative?.representativeDocumentFileLinks ||
                      null
                    }
                    representativeId={application?.representative?.id}
                    onDocumentRemoved={() => {
                      form.setValue('representative.representativeDocumentFileLinks', null);
                    }}
                    isSubmitted={isSubmitted}
                  />

                  <div className="my-auto grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="representative.representativeDocumentNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('representativeDocNumber')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              className={cn(
                                '',
                                isFieldChanged('representativeDocumentNumber')
                                  ? 'border-yellow-500'
                                  : '',
                              )}
                              disabled={isSubmitted}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="representative.representativeDocumentIssuingAuthority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('representativeDocIssuedBy')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              className={cn(
                                '',
                                isFieldChanged('representativeDocumentIssuingAuthority')
                                  ? 'border-yellow-500'
                                  : '',
                              )}
                              disabled={isSubmitted}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="my-auto mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="representative.representativeDocumentIssueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('representativeDocIssuedDate')}</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              value={field.value ? dateUtils.formatToInputDate(field.value) : ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value);
                              }}
                              className={cn(
                                '',
                                isFieldChanged('representativeDocumentIssueDate')
                                  ? 'border-yellow-500'
                                  : '',
                              )}
                              disabled={isSubmitted}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="representative.representativeDocumentExpiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('representativeDocExpiryDate')}</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              value={field.value ? dateUtils.formatToInputDate(field.value) : ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value);
                              }}
                              className={cn(
                                '',
                                isFieldChanged('representativeDocumentExpiryDate')
                                  ? 'border-yellow-500'
                                  : '',
                              )}
                              disabled={isSubmitted}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default Representative;
