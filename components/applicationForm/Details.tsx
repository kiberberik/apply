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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const detailsSchema = z.object({
  type: z.enum(['PAID', 'GRANT', 'NONE_DEGREE', 'CONDITIONAL', 'OTHER']).nullable(),
  academicLevel: z.enum(['BACHELORS', 'MASTERS', 'DOCTORAL']).nullable(),
  isDormNeeds: z.boolean().nullable(),
  studyingLanguage: z.enum(['RUS', 'KAZ', 'ENG']).nullable(),
  contractLanguage: z.enum(['RUS', 'KAZ', 'ENG']).nullable(),
  educationalProgramId: z.string().nullable(),
});

type FormValues = z.infer<typeof detailsSchema>;

function Details() {
  const t = useTranslations('Details');
  const tAcademicLevel = useTranslations('AcademicLevel');
  const tSupportLanguages = useTranslations('SupportLanguages');

  const form = useForm<FormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      type: null,
      academicLevel: null,
      isDormNeeds: null,
      studyingLanguage: null,
      contractLanguage: null,
      educationalProgramId: null,
    },
  });

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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectType')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PAID">{t('paid')}</SelectItem>
                        <SelectItem value="GRANT">{t('grant')}</SelectItem>
                        <SelectItem value="NONE_DEGREE">{t('noneDegree')}</SelectItem>
                        <SelectItem value="CONDITIONAL">{t('conditional')}</SelectItem>
                        <SelectItem value="OTHER">{t('other')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="academicLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('academicLevel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectAcademicLevel')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BACHELORS">{tAcademicLevel('BACHELORS')}</SelectItem>
                        <SelectItem value="MASTERS">{tAcademicLevel('MASTERS')}</SelectItem>
                        <SelectItem value="DOCTORAL">{tAcademicLevel('DOCTORAL')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studyingLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('studyingLanguage')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectStudyingLanguage')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RUS">{tSupportLanguages('RUS')}</SelectItem>
                        <SelectItem value="KAZ">{tSupportLanguages('KAZ')}</SelectItem>
                        <SelectItem value="ENG">{tSupportLanguages('ENG')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contractLanguage')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectContractLanguage')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RUS">{tSupportLanguages('RUS')}</SelectItem>
                        <SelectItem value="KAZ">{tSupportLanguages('KAZ')}</SelectItem>
                        <SelectItem value="ENG">{tSupportLanguages('ENG')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isDormNeeds"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('isDormNeeds')}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

export default Details;
