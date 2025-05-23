import { cn } from '@/lib/utils';
import Divider from '../ui/divider';
import { useTranslations, useLocale } from 'next-intl';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { ExtendedApplication } from '@/types/application';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import dateUtils from '@/lib/dateUtils';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/useAuthStore';
import { Role } from '@prisma/client';
import React from 'react';
import { DocumentPreview } from '../ui/document-preview';
import { useLogStore } from '@/store/useLogStore';
import ReactSelect from 'react-select';
import countries from '@/data/countries.json';

// Типизация для страны из JSON
interface Country {
  id: number;
  ru: string;
  kz: string;
  en: string;
}

// Типизация для опций select
interface CountryOption {
  value: number;
  label: string;
}

// Константы для ограничения дат
const MIN_DATE = '1960-01-01';
const MAX_DATE = new Date().toISOString().split('T')[0];

interface ApplicantProps {
  application: ExtendedApplication | null;
  isSubmitted?: boolean;
}

function Applicant({ application, isSubmitted = false }: ApplicantProps) {
  const t = useTranslations('Applicant');
  const c = useTranslations('Common');
  const icdepartments = useTranslations('icdepartments');
  const tDocument = useTranslations('Document');
  const locale = useLocale() as 'ru' | 'kz' | 'en';
  const form = useFormContext();
  const { user } = useAuthStore();
  const { latestLogs } = useLogStore();

  // Преобразуем страны в опции для селекта с учетом текущего языка
  const countryOptions: CountryOption[] = React.useMemo(() => {
    return (countries as Country[]).map((country) => {
      // Безопасный доступ к полям с проверкой существования
      const label = country[locale] || country.ru || country.en || '';

      return {
        value: country.id,
        label: label,
      };
    });
  }, [locale]);

  console.log('latestLogs', latestLogs);
  // Проверяем, является ли пользователь с ролью USER и статус заявки DRAFT
  const isDraftForUser =
    user?.role === Role.USER &&
    (latestLogs?.[0]?.statusId === 'DRAFT' || !application?.submittedAt);

  // Если условие выполняется, устанавливаем email пользователя в форму
  React.useEffect(() => {
    if (isDraftForUser && user?.email) {
      form.setValue('applicant.email', user.email);
    }
  }, [user, form, isDraftForUser]);

  const isFieldChanged = (field: string, value: unknown, defaultValue: unknown): boolean => {
    if (field.includes('Date') && value && defaultValue) {
      const date1 = new Date(value as Date).setHours(0, 0, 0, 0);
      const date2 = new Date(defaultValue as Date).setHours(0, 0, 0, 0);
      return date1 !== date2;
    }

    // Проверка для null и undefined значений
    if (value === null || value === undefined) {
      return defaultValue !== null && defaultValue !== undefined;
    }

    if (defaultValue === null || defaultValue === undefined) {
      return value !== null && value !== undefined;
    }

    // Особая обработка для строк - рассматриваем пустые строки как эквивалент undefined
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

  // const documentType = form.watch('applicant.documentType');
  const citizenship = form.watch('applicant.citizenship');

  // Находим ID Казахстана в списке стран
  const kazakhstanId = React.useMemo(() => {
    const kazakhstanCountry = countries.find(
      (country) =>
        country.ru === 'КАЗАХСТАН' || country.en === 'KAZAKHSTAN' || country.kz === 'ҚАЗАҚСТАН',
    );
    return kazakhstanCountry?.id;
  }, []);

  // Проверяем, является ли выбранное гражданство Казахстаном
  const isCitizenshipKz = React.useMemo(() => {
    // Если это строка с id страны (новый формат)
    if (citizenship && typeof citizenship === 'string') {
      return String(kazakhstanId) === citizenship;
    }

    // Для обратной совместимости
    if (typeof citizenship === 'object' && citizenship?.value) {
      return citizenship.value === kazakhstanId;
    }

    // Если это число (идентификатор страны)
    if (typeof citizenship === 'number') {
      return citizenship === kazakhstanId;
    }

    // Если это название страны
    return (
      citizenship === 'КАЗАХСТАН' || citizenship === 'ҚАЗАҚСТАН' || citizenship === 'KAZAKHSTAN'
    );
  }, [citizenship, kazakhstanId]);

  // Функция для валидации даты
  const validateAndUpdateDate = (
    e: React.FocusEvent<HTMLInputElement>,
    fieldOnChange: (date: Date | undefined) => void,
  ) => {
    const inputValue = e.target.value;
    if (!inputValue) {
      fieldOnChange(undefined);
      return;
    }

    // Проверяем, что дата в допустимом диапазоне
    const inputDate = new Date(inputValue);
    const minDate = new Date(MIN_DATE);
    const maxDate = new Date(MAX_DATE);

    if (isNaN(inputDate.getTime()) || inputDate < minDate || inputDate > maxDate) {
      // Если дата некорректна или вне диапазона, сбрасываем поле
      e.target.value = '';
      fieldOnChange(undefined);
      toast.error(c('invalidDate'));
      return;
    }

    // Если дата корректна и в диапазоне, создаем объект Date
    const date = dateUtils.createDateFromInputValue(inputValue);
    fieldOnChange(date);
  };

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
              name="applicant.citizenship"
              render={({ field }) => (
                <FormItem>
                  <div className="text-sm font-medium">{t('citizenship')}</div>
                  <FormControl>
                    <ReactSelect
                      options={countryOptions}
                      value={
                        field.value
                          ? typeof field.value === 'string'
                            ? countryOptions.find((option) => String(option.value) === field.value)
                            : null
                          : null
                      }
                      onChange={(selectedOption: CountryOption | null) => {
                        field.onChange(selectedOption ? String(selectedOption.value) : null);
                        const isKazakhstan = selectedOption?.value === kazakhstanId;

                        if (!isKazakhstan) {
                          form.setValue('applicant.documentType', 'PASSPORT', {
                            shouldValidate: false,
                            shouldDirty: false,
                          });
                        }
                      }}
                      isDisabled={isSubmitted}
                      placeholder={t('citizenship')}
                      className={cn(
                        '',
                        isFieldChanged(
                          'citizenship',
                          application?.applicant?.citizenship,
                          field.value,
                        )
                          ? 'border-yellow-500'
                          : '',
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applicant.documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('documentType')}</FormLabel>
                  <Select
                    name="applicant.documentType"
                    disabled={isSubmitted}
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          'w-full',
                          isFieldChanged(
                            'documentType',
                            application?.applicant?.documentType,
                            field.value,
                          )
                            ? 'border-yellow-500'
                            : '',
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
          </div>
          <div className="my-auto grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="applicant.documentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tDocument('number')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      disabled={isSubmitted}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                        field.onChange(value);
                      }}
                      className={cn(
                        '',
                        isFieldChanged(
                          'documentNumber',
                          application?.applicant?.documentNumber,
                          field.value,
                        )
                          ? 'border-yellow-500'
                          : '',
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applicant.documentIssuingAuthority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tDocument('issuingAuthority')}</FormLabel>
                  <Select
                    name="applicant.documentIssuingAuthority"
                    onValueChange={field.onChange}
                    value={field.value || ''}
                    disabled={isSubmitted}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={tDocument('selectIssuingAuthority')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">{icdepartments('ministryJustice')}</SelectItem>
                      <SelectItem value="2">{icdepartments('ministryInternalAffairs')}</SelectItem>
                      <SelectItem value="3">{icdepartments('another')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applicant.documentIssueDate"
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
                        isFieldChanged(
                          'documentIssueDate',
                          application?.applicant?.documentIssueDate,
                          field.value,
                        )
                          ? 'border-yellow-500'
                          : '',
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applicant.documentExpiryDate"
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
                        isFieldChanged(
                          'documentExpiryDate',
                          application?.applicant?.documentExpiryDate,
                          field.value,
                        )
                          ? 'border-yellow-500'
                          : '',
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {application?.applicant?.documentFileLinks &&
              (() => {
                try {
                  return JSON.parse(application.applicant.documentFileLinks).length > 0;
                } catch {
                  return false;
                }
              })() && (
                <div className="mt-4 flex flex-col">
                  <p>{c('uploadedDocuments')}</p>

                  <DocumentPreview
                    documentFileLinks={application?.applicant?.documentFileLinks || null}
                    applicantId={application?.applicant?.id}
                    onDocumentRemoved={() => {
                      form.setValue('applicant.documentFileLinks', null);
                    }}
                    isSubmitted={isSubmitted}
                  />
                </div>
              )}
          </div>

          {/* {(!isCitizenshipKz || (isCitizenshipKz && documentType)) && (
            <> */}
          <Divider className="my-12" />
          {isCitizenshipKz && (
            <FormField
              control={form.control}
              name="applicant.identificationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tDocument('identificationNumber')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      disabled={isSubmitted}
                      className={cn(
                        '',
                        isFieldChanged(
                          'identificationNumber',
                          application?.applicant?.identificationNumber,
                          field.value,
                        )
                          ? 'border-yellow-500'
                          : '',
                      )}
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
              name="applicant.surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('surname')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      disabled={isSubmitted}
                      className={cn(
                        '',
                        isFieldChanged('surname', application?.applicant?.surname, field.value)
                          ? 'border-yellow-500'
                          : '',
                      )}
                    />
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
                    <Input
                      {...field}
                      value={field.value || ''}
                      disabled={isSubmitted}
                      className={cn(
                        '',
                        isFieldChanged(
                          'givennames',
                          application?.applicant?.givennames,
                          field.value,
                        )
                          ? 'border-yellow-500'
                          : '',
                      )}
                    />
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
                    <Input
                      {...field}
                      value={field.value || ''}
                      disabled={isSubmitted}
                      className={cn(
                        '',
                        isFieldChanged(
                          'patronymic',
                          application?.applicant?.patronymic,
                          field.value,
                        )
                          ? 'border-yellow-500'
                          : '',
                      )}
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
              name="applicant.birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('birthDate')}</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? dateUtils.formatToInputDate(field.value) : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(dateUtils.formatToInputDate(value));
                      }}
                      onBlur={(e) => validateAndUpdateDate(e, field.onChange)}
                      disabled={isSubmitted}
                      className={cn(
                        '',
                        isFieldChanged('birthDate', application?.applicant?.birthDate, field.value)
                          ? 'border-yellow-500'
                          : '',
                      )}
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
                    <Input
                      {...field}
                      value={field.value || ''}
                      disabled={isSubmitted}
                      className={cn(
                        '',
                        isFieldChanged(
                          'birthPlace',
                          application?.applicant?.birthPlace,
                          field.value,
                        )
                          ? 'border-yellow-500'
                          : '',
                      )}
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
              name="applicant.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      value={isDraftForUser ? user?.email : field.value || ''}
                      disabled={isSubmitted || isDraftForUser}
                      className={cn(
                        '',
                        isFieldChanged('email', application?.applicant?.email, field.value)
                          ? 'border-yellow-500'
                          : '',
                      )}
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
                    <Input
                      {...field}
                      type="tel"
                      value={field.value || ''}
                      disabled={isSubmitted}
                      className={cn(
                        '',
                        isFieldChanged('phone', application?.applicant?.phone, field.value)
                          ? 'border-yellow-500'
                          : '',
                      )}
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
              name="applicant.addressResidential"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('addressResidential')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      maxLength={70}
                      disabled={isSubmitted}
                      className={cn(
                        '',
                        isFieldChanged(
                          'addressResidential',
                          application?.applicant?.addressResidential,
                          field.value,
                        )
                          ? 'border-yellow-500'
                          : '',
                      )}
                    />
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
                    <Input
                      {...field}
                      value={field.value || ''}
                      maxLength={70}
                      disabled={isSubmitted}
                      className={cn(
                        '',
                        isFieldChanged(
                          'addressRegistration',
                          application?.applicant?.addressRegistration,
                          field.value,
                        )
                          ? 'border-yellow-500'
                          : '',
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* </>
          )} */}
        </div>
      </CardContent>
    </Card>
  );
}

export default Applicant;
