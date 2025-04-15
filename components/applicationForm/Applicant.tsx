import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Divider from '../ui/divider';

const applicantSchema = z.object({
  firstname: z.string().nullable(),
  middlename: z.string().nullable(),
  lastname: z.string().nullable(),
  birthDate: z.string().nullable(),
  birthPlace: z.string().nullable(),
  citizenship: z.enum(['KAZAKHSTAN', 'OTHER']).nullable(),
  documentType: z.enum(['ID_CARD', 'PASSPORT']).nullable(),
  idCardNumber: z.string().nullable(),
  passportNumber: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  addressResidential: z.string().nullable(),
  addressRegistration: z.string().nullable(),
  issuingAuthority: z.string().nullable(),
  issueDate: z.string().nullable(),
  expirationDate: z.string().nullable(),
  identificationNumber: z.string().nullable(),
  id_card: z.string().nullable(),
  passport: z.string().nullable(),
});

type FormValues = z.infer<typeof applicantSchema>;

function Applicant() {
  const t = useTranslations('Applicant');
  const tCitizenship = useTranslations('Citizenship');
  const tDocument = useTranslations('Document');

  const form = useForm<FormValues>({
    resolver: zodResolver(applicantSchema),
    defaultValues: {
      firstname: null,
      middlename: null,
      lastname: null,
      birthDate: null,
      birthPlace: null,
      citizenship: null,
      documentType: null,
      idCardNumber: null,
      passportNumber: null,
      email: null,
      phone: null,
      addressResidential: null,
      addressRegistration: null,
      issuingAuthority: null,
      issueDate: null,
      expirationDate: null,
      identificationNumber: null,
      id_card: null,
      passport: null,
    },
  });

  const citizenship = form.watch('citizenship');
  const documentType = form.watch('documentType');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="citizenship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('citizenship')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={tCitizenship('selectCitizenship')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="KAZAKHSTAN">{tCitizenship('KAZAKHSTAN')}</SelectItem>
                        <SelectItem value="OTHER">{tCitizenship('OTHER')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {citizenship === 'KAZAKHSTAN' && (
                <>
                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('documentType')}</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              {citizenship === 'KAZAKHSTAN' && documentType === 'ID_CARD' && (
                <>
                  <FormField
                    control={form.control}
                    name="id_card"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tDocument('id_card')}</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            multiple={false}
                            size={124 * 5}
                            accept="image/*"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <br />
                  <FormField
                    control={form.control}
                    name="passportNumber"
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
                    name="issuingAuthority"
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
                    name="issueDate"
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
                    name="expirationDate"
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
                </>
              )}

              {(citizenship === 'OTHER' || documentType === 'PASSPORT') && (
                <>
                  <FormField
                    control={form.control}
                    name="passport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tDocument('passport')}</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            multiple={false}
                            size={124 * 5}
                            accept="image/*"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <br />
                  <FormField
                    control={form.control}
                    name="passportNumber"
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
                    name="issuingAuthority"
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
                    name="issueDate"
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
                    name="expirationDate"
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
                </>
              )}
            </div>

            {(citizenship === 'OTHER' || (citizenship === 'KAZAKHSTAN' && documentType)) && (
              <>
                <Divider className="my-12" />
                {citizenship === 'KAZAKHSTAN' && (
                  <FormField
                    control={form.control}
                    name="identificationNumber"
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

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="lastname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('lastName')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('firstName')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middlename"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('middleName')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('birthDate')}</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthPlace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('birthPlace')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
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
                    name="phone"
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="addressResidential"
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
                    name="addressRegistration"
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
              </>
            )}
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

export default Applicant;
