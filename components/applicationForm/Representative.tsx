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

interface RepresentativeProps {
  application: ExtendedApplication | null;
}

function Representative({ application }: RepresentativeProps) {
  const t = useTranslations('Representative');

  const c = useTranslations('Common');
  const tCitizenship = useTranslations('Citizenship');
  const tDocument = useTranslations('Document');
  const { fetchDocument } = useDocumentStore();
  const form = useFormContext();

  useEffect(() => {
    if (application?.representative?.identificationDocId) {
      fetchDocument(application?.representative?.identificationDocId);
    }
  }, [application?.representative?.identificationDocId, fetchDocument]);

  const documentType = form.watch('representative.documentType');
  const isCitizenshipKz = form.watch('representative.isCitizenshipKz');

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
                    defaultValue={field.value ? 'true' : 'false'}
                  >
                    <FormControl>
                      <SelectTrigger>
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
                        <Input {...field} value={field.value || ''} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
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
              name="representative.identificationDoc.link"
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
            <Button className="my-5">Выгрузить данные из документа</Button>
          </div>
          <div className="my-auto grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="representative.identificationDoc.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tDocument('number')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="representative.identificationDoc.issuingAuthority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tDocument('issuingAuthority')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="representative.identificationDoc.issueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tDocument('issueDate')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="representative.identificationDoc.expirationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tDocument('expirationDate')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" value={field.value || ''} />
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
                  name="representative.identificationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tDocument('identificationNumber')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
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
                        <Input {...field} value={field.value || ''} />
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
                        <Input {...field} value={field.value || ''} />
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
                        <Input {...field} value={field.value || ''} />
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
                        <Input {...field} type="email" value={field.value || ''} />
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
                        <Input {...field} value={field.value || ''} />
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
                        <Input {...field} value={field.value || ''} />
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
                        <Input {...field} value={field.value || ''} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectRelationshipDegree')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PARENT">{t('parent')}</SelectItem>
                          <SelectItem value="GUARDIAN">{t('guardian')}</SelectItem>
                          <SelectItem value="TRUSTEE">{t('trustee')}</SelectItem>
                          <SelectItem value="OTHER">{t('other')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch('representative.relationshipDegree') && (
                <>
                  <Divider className="my-12" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="representative.representativeDoc.link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('representativeDoc')}</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              multiple={false}
                              size={124 * 5}
                              accept="image/*"
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
                    <FormField
                      control={form.control}
                      name="representative.representativeDoc.number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('representativeDocNumber')}</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="representative.representativeDoc.issuingAuthority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{tDocument('issuingAuthority')}</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="representative.representativeDoc.issueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{tDocument('issueDate')}</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="representative.representativeDoc.expirationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{tDocument('expirationDate')}</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default Representative;
