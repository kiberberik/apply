import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { EducationalProgramGroup, EducationalProgram, Language } from '@prisma/client';
import { useEducationalStore } from '@/store/useEducationalStore';
import { ExtendedApplication } from '@/types/application';

type ProgramWithLanguages = EducationalProgram & {
  languages: {
    language: Language;
  }[];
};

interface GroupWithPrograms extends EducationalProgramGroup {
  programs: ProgramWithLanguages[];
}

interface DetailsProps {
  application?: ExtendedApplication;
  isSubmitted?: boolean;
}

function Details({ application, isSubmitted = false }: DetailsProps) {
  const t = useTranslations('Details');
  const tAcademicLevel = useTranslations('AcademicLevel');
  const tSupportLanguages = useTranslations('SupportLanguages');
  const tEducationalPrograms = useTranslations('EducationalPrograms');
  const { groups, fetchGroups, getEducationalProgramDetails } = useEducationalStore();
  const local = useLocale();
  const form = useFormContext();

  // Использование application для логирования (не влияет на работу компонента)
  React.useEffect(() => {
    if (application?.id) {
      console.log('Details component received application with ID:', application.id);
    }
  }, [application]);

  const [filteredPrograms, setFilteredPrograms] = useState<GroupWithPrograms[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ProgramWithLanguages | null>(null);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const studyingLanguage = form.watch('details.studyingLanguage');
  const academicLevel = form.watch('details.academicLevel');
  const educationalProgramId = form.watch('details.educationalProgramId');

  useEffect(() => {
    if (educationalProgramId) {
      const fetchProgramDetails = async () => {
        const program = await getEducationalProgramDetails(educationalProgramId);
        setSelectedProgram(program);
      };
      fetchProgramDetails();
    } else {
      setSelectedProgram(null);
    }
  }, [educationalProgramId, getEducationalProgramDetails]);

  useEffect(() => {
    if (studyingLanguage && academicLevel && groups) {
      const filtered = (groups as unknown as GroupWithPrograms[])
        .filter((group) => group.academic_level === academicLevel)
        .map((group) => ({
          ...group,
          programs:
            group.programs?.filter((program) =>
              program.languages.some((lang) => lang.language.code === studyingLanguage),
            ) || [],
        }))
        .filter((group) => group.programs.length > 0);

      setFilteredPrograms(filtered);
    } else {
      setFilteredPrograms([]);
    }
  }, [studyingLanguage, academicLevel, groups]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="details.type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('type')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ''}
                    disabled={isSubmitted}
                  >
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
              name="details.academicLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('academicLevel')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ''}
                    disabled={isSubmitted}
                  >
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
              name="details.studyingLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('studyingLanguage')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ''}
                    disabled={isSubmitted}
                  >
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
              name="details.contractLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contractLanguage')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ''}
                    disabled={isSubmitted}
                  >
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
          </div>

          {filteredPrograms && filteredPrograms.length > 0 && (
            <FormField
              control={form.control}
              name="details.educationalProgramId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('educationalProgram')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ''}
                    disabled={isSubmitted}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectEducationalProgram')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredPrograms.map((group) => (
                        <div key={group.id}>
                          <div className="px-2 py-1.5 text-sm font-semibold">
                            {group.code}{' '}
                            {local === 'ru'
                              ? group.name_rus
                              : local === 'kz'
                                ? group.name_kaz
                                : group.name_eng}
                          </div>
                          {group.programs.map((program) => (
                            <SelectItem key={program.id} value={program.id}>
                              {program.code}{' '}
                              {local === 'ru'
                                ? program.name_rus
                                : local === 'kz'
                                  ? program.name_kaz
                                  : program.name_eng}{' '}
                              ({program.duration} {t('years')})
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {selectedProgram && (
            <div className="mt-4 rounded-lg border p-4">
              <h3 className="mb-2 text-lg font-semibold">
                {local === 'ru'
                  ? selectedProgram.name_rus
                  : local === 'kz'
                    ? selectedProgram.name_kaz
                    : selectedProgram.name_eng}
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">{tEducationalPrograms('code')}:</span>{' '}
                  {selectedProgram.code}
                </p>
                <p>
                  <span className="font-medium">{tEducationalPrograms('duration')}:</span>{' '}
                  {selectedProgram.duration} {t('years')}
                </p>
                <p>
                  <span className="font-medium">{tEducationalPrograms('costPerCredit')}:</span>{' '}
                  {selectedProgram.costPerCredit} ₸
                </p>
                <p>
                  <span className="font-medium">{tEducationalPrograms('accessLanguages')}:</span>{' '}
                  {selectedProgram.languages
                    .map((lang) =>
                      local === 'ru'
                        ? lang.language.name_rus
                        : local === 'kz'
                          ? lang.language.name_kaz
                          : lang.language.name_eng,
                    )
                    .join(', ')}
                </p>
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="details.isDormNeeds"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{t('isDormNeeds')}</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitted}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default Details;
