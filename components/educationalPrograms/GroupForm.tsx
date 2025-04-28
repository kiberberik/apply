'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AcademicLevel,
  EducationalProgram,
  EducationalProgramGroup,
  Language,
} from '@prisma/client';
import { useEducationalStore } from '@/store/useEducationalStore';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import Divider from '../ui/divider';
import ProgramForm from './ProgramForm';
import { useLocale } from 'next-intl';

// Определяем тип EducationalProgramWithLanguages для обеспечения совместимости с ProgramForm
interface EducationalProgramWithLanguages extends Omit<EducationalProgram, 'languages'> {
  languages: {
    language: Language;
  }[];
}

interface GroupFormProps {
  groupToEdit: EducationalProgramGroup | null;
  onClose: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({ groupToEdit, onClose }) => {
  const { programs, fetchPrograms, addGroup, updateGroup, deleteProgram } = useEducationalStore();
  const t = useTranslations('EducationalPrograms');
  const c = useTranslations('Common');
  const a = useTranslations('AcademicLevel');
  const l = useTranslations('SupportLanguages');
  const locale = useLocale();

  const [group, setGroup] = useState<Partial<EducationalProgramGroup>>({
    code: groupToEdit?.code || '',
    name_rus: groupToEdit?.name_rus || '',
    name_kaz: groupToEdit?.name_kaz || '',
    name_eng: groupToEdit?.name_eng || '',
    academic_level: groupToEdit?.academic_level || AcademicLevel.BACHELORS,
    visibility: groupToEdit?.visibility ?? true,
  });

  const [programFormOpen, setProgramFormOpen] = useState(false);
  const [programToEdit, setProgramToEdit] = useState<EducationalProgramWithLanguages | null>(null);

  // Загружаем программы при монтировании компонента или изменении groupToEdit
  useEffect(() => {
    fetchPrograms(); // Загружаем программы изначально
    if (groupToEdit) {
      const { name_rus, name_kaz, name_eng, academic_level, code, visibility } = groupToEdit;
      setGroup({
        name_rus: name_rus ?? '',
        name_kaz: name_kaz ?? '',
        name_eng: name_eng ?? '',
        academic_level: academic_level ?? AcademicLevel.BACHELORS,
        code: code ?? '',
        visibility: visibility ?? true,
      });
    }
  }, [groupToEdit, fetchPrograms]);

  const handleSaveGroup = async () => {
    try {
      if (groupToEdit?.id) {
        await updateGroup(groupToEdit.id, group as EducationalProgramGroup);
      } else {
        await addGroup(group as EducationalProgramGroup);
      }
      onClose();
    } catch (err) {
      console.error('Ошибка при сохранении группы:', err);
      toast.error('Произошла ошибка при сохранении группы');
    }
  };

  const handleDeleteProgram = async (id: string) => {
    try {
      await deleteProgram(id);
      toast.success('Программа удалена');
    } catch (err) {
      console.error('Ошибка при удалении программы:', err);
      toast.error('Ошибка при удалении программы');
    }
  };

  const handleOpenProgramForm = (program: EducationalProgram | null = null) => {
    // Если программа не null, добавим массив languages для совместимости с EducationalProgramWithLanguages
    if (program) {
      // В Prisma есть languages, но в TypeScript типе его нет, поэтому используем приведение типов
      // @ts-expect-error - свойство languages существует в БД, но отсутствует в TypeScript типе
      const languages = program.languages || [];

      const programWithLanguages = {
        ...program,
        languages, // Используем languages из объекта program или пустой массив
      } as unknown as EducationalProgramWithLanguages;

      setProgramToEdit(programWithLanguages);
    } else {
      setProgramToEdit(null);
    }
    setProgramFormOpen(true);
  };

  const handleCloseProgramForm = () => {
    setProgramFormOpen(false);
    setProgramToEdit(null);
  };

  const groupPrograms = groupToEdit ? programs.filter((p) => p.groupId === groupToEdit.id) : [];

  return (
    <>
      <Dialog open={Boolean(groupToEdit || group)} onOpenChange={onClose}>
        <DialogContent
          className="z-50 h-[90vh] max-w-[95vw] overflow-y-auto p-6"
          aria-describedby="dialog-title"
        >
          <DialogTitle className="mb-6 text-2xl font-bold">
            {groupToEdit ? c('edit') : c('create')} {t('group')}
          </DialogTitle>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-full flex-col space-y-6"
          >
            {/* Основная информация о группе */}
            <Card className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="w-full">
                  <Label className="text-sm font-medium">{t('code')}</Label>
                  <Input
                    placeholder={t('code')}
                    value={group.code ?? ''}
                    onChange={(e) => setGroup({ ...group, code: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div className="w-full">
                  <Label className="text-sm font-medium">{t('academicLevel')}</Label>
                  <Select
                    value={group.academic_level ?? AcademicLevel.BACHELORS}
                    onValueChange={(value) =>
                      setGroup({ ...group, academic_level: value as AcademicLevel })
                    }
                  >
                    <SelectTrigger className="mt-2 w-full">
                      <SelectValue placeholder={t('academicLevel')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(AcademicLevel).map((level) => (
                        <SelectItem key={level} value={level}>
                          {a(level)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  {/* <Label className="text-sm font-medium">{t('name')}</Label> */}
                  <div className="mt-2 space-y-4">
                    <Label className="text-sm font-medium">{t('nameRus')}</Label>
                    <Input
                      placeholder={t('nameRus')}
                      value={group.name_rus ?? ''}
                      onChange={(e) => setGroup({ ...group, name_rus: e.target.value })}
                    />
                    <Label className="text-sm font-medium">{t('nameKaz')}</Label>
                    <Input
                      placeholder={t('nameKaz')}
                      value={group.name_kaz ?? ''}
                      onChange={(e) => setGroup({ ...group, name_kaz: e.target.value })}
                    />
                    <Label className="text-sm font-medium">{t('nameEng')}</Label>
                    <Input
                      placeholder={t('nameEng')}
                      value={group.name_eng ?? ''}
                      onChange={(e) => setGroup({ ...group, name_eng: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="visibility"
                    checked={group.visibility ?? false}
                    onCheckedChange={(checked) => setGroup({ ...group, visibility: checked })}
                  />
                  <Label htmlFor="visibility" className="font-medium">
                    {c('visibility')}
                  </Label>
                </div>
              </div>
            </Card>

            {/* Кнопки управления */}
            <div className="sticky bottom-0 flex justify-end border-t bg-white p-4">
              <Button onClick={handleSaveGroup} className="bg-primary hover:bg-primary/90">
                {groupToEdit ? c('save') : c('create')}
              </Button>
            </div>

            {/* Секция программ */}
            {groupToEdit && (
              <>
                <Divider />
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t('programs')}</h3>
                    <Button
                      onClick={() => handleOpenProgramForm()}
                      className="flex items-center gap-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      {c('add')}
                    </Button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {groupPrograms.length > 0 ? (
                      groupPrograms.map((program) => (
                        <motion.div
                          key={program.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div>
                            <p className="font-medium">{program.code}</p>
                            <p className="text-sm text-gray-500">
                              {locale === 'ru'
                                ? program.name_rus
                                : locale === 'kz'
                                  ? program.name_kaz
                                  : program.name_eng}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs">
                              <span className="rounded">
                                {t('duration')}: {program.duration}
                              </span>
                              {program.costPerCredit && (
                                <span className="rounded">
                                  {t('costPerCredit')}: {program.costPerCredit}
                                </span>
                              )}
                              <span className="rounded bg-purple-100 px-2 py-0.5 text-purple-800">
                                {t('languages')}:{' '}
                                {(() => {
                                  try {
                                    // Если languages - это строка, пытаемся распарсить её
                                    if (typeof program.languages === 'string') {
                                      const languagesStr = program.languages as string;
                                      // Проверяем, содержит ли строка экранированные кавычки
                                      if (languagesStr.includes('\\"')) {
                                        // Удаляем экранированные кавычки и парсим
                                        const fixedString = languagesStr.replace(/\\"/g, '"');
                                        const languages = JSON.parse(fixedString);
                                        return languages
                                          .filter(
                                            (lang: string): lang is string =>
                                              typeof lang === 'string',
                                          )
                                          .map((lang: string) => {
                                            if (lang === 'KAZ') return l('KAZ');
                                            if (lang === 'RUS') return l('RUS');
                                            if (lang === 'ENG') return l('ENG');
                                            return lang;
                                          })
                                          .join(', ');
                                      } else {
                                        // Пытаемся распарсить как обычный JSON
                                        const languages = JSON.parse(program.languages);
                                        return languages
                                          .filter(
                                            (lang: string): lang is string =>
                                              typeof lang === 'string',
                                          )
                                          .map((lang: string) => {
                                            if (lang === 'KAZ') return l('KAZ');
                                            if (lang === 'RUS') return l('RUS');
                                            if (lang === 'ENG') return l('ENG');
                                            return lang;
                                          })
                                          .join(', ');
                                      }
                                    }
                                    // Если languages - это уже массив
                                    else if (Array.isArray(program.languages)) {
                                      return program.languages
                                        .map((lang) => {
                                          if (lang.language.code === 'KAZ') return l('KAZ');
                                          if (lang.language.code === 'RUS') return l('RUS');
                                          if (lang.language.code === 'ENG') return l('ENG');
                                          return lang.language.code;
                                        })
                                        .join(', ');
                                    }
                                    return '';
                                  } catch (error) {
                                    console.error('Ошибка при обработке языков:', error);
                                    return '';
                                  }
                                })()}
                              </span>
                              <span className={`rounded px-2 py-0.5`}>
                                <Switch id="visibility" checked={program.visibility ?? false} />
                                {/* {program.visibility ? t('visible') : t('hidden')} */}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleOpenProgramForm(program)}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <PencilIcon className="h-4 w-4" />
                              {c('edit')}
                            </Button>
                            <Button
                              onClick={() => handleDeleteProgram(program.id)}
                              variant="destructive"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <TrashIcon className="h-4 w-4" />
                              {c('delete')}
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500">{t('noPrograms')}</div>
                    )}
                  </div>
                </Card>
              </>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Модальное окно для создания/редактирования программы */}
      {groupToEdit && programFormOpen && (
        <ProgramForm
          programToEdit={programToEdit}
          groupId={groupToEdit.id}
          onClose={handleCloseProgramForm}
        />
      )}
    </>
  );
};

export default GroupForm;
