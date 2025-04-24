'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { AcademicLevel, EducationalProgram, Language } from '@prisma/client';
import { useEducationalStore } from '@/store/useEducationalStore';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Определяем интерфейс для формы программы
interface ProgramFormData {
  name_rus: string;
  name_kaz: string;
  name_eng: string;
  code: string;
  languages: string[]; // теперь это массив ID языков
  academic_level: AcademicLevel;
  duration: number;
  visibility: boolean;
  isDeleted: boolean;
  costPerCredit: string;
}

// Расширяем тип EducationalProgram, чтобы включить поле languages
interface EducationalProgramWithLanguages extends Omit<EducationalProgram, 'languages'> {
  languages: {
    language: Language;
  }[];
}

interface ProgramFormProps {
  programToEdit: EducationalProgramWithLanguages | null;
  groupId: string;
  onClose: () => void;
}

const ProgramForm: React.FC<ProgramFormProps> = ({ programToEdit, groupId, onClose }) => {
  const { addProgram, updateProgram, fetchPrograms, groups } = useEducationalStore();
  const t = useTranslations('EducationalPrograms');
  const c = useTranslations('Common');

  // Находим группу по ID
  const group = groups.find((g) => g.id === groupId);

  // Инициализируем состояние формы с пустыми значениями
  const [formData, setFormData] = useState<ProgramFormData>({
    name_rus: programToEdit?.name_rus || '',
    name_kaz: programToEdit?.name_kaz || '',
    name_eng: programToEdit?.name_eng || '',
    code: programToEdit?.code || '',
    languages: programToEdit?.languages?.map((lang) => lang.language.id) || [],
    academic_level:
      programToEdit?.academic_level || group?.academic_level || AcademicLevel.BACHELORS,
    duration: programToEdit?.duration || 1,
    visibility: programToEdit?.visibility ?? group?.visibility ?? true,
    isDeleted: false,
    costPerCredit: programToEdit?.costPerCredit || '',
  });

  // Состояние для ошибок валидации
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Состояние для доступных языков
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);

  // Загружаем языки при монтировании компонента
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/languages');
        if (!response.ok) throw new Error('Failed to fetch languages');
        const data = await response.json();
        console.log('Доступные языки:', data);
        setAvailableLanguages(data);
      } catch (error) {
        console.error('Error fetching languages:', error);
        toast.error('Ошибка при загрузке языков');
      }
    };

    fetchLanguages();
  }, []);

  // Загружаем программы при монтировании компонента
  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Обновляем форму при изменении programToEdit или group
  useEffect(() => {
    if (programToEdit) {
      console.log('Полная структура программы:', programToEdit);
      console.log('Языки программы (оригинал):', programToEdit.languages);

      // Получаем ID языков из языков программы
      const selectedLanguageIds = programToEdit.languages?.map((lang) => lang.language.id) || [];
      console.log('Выбранные языки:', selectedLanguageIds);

      setFormData((prev) => ({
        ...prev,
        name_rus: programToEdit.name_rus || '',
        name_kaz: programToEdit.name_kaz || '',
        name_eng: programToEdit.name_eng || '',
        code: programToEdit.code || '',
        languages: selectedLanguageIds,
        academic_level:
          programToEdit.academic_level || group?.academic_level || AcademicLevel.BACHELORS,
        duration: programToEdit.duration || 1,
        visibility: programToEdit.visibility ?? true,
        costPerCredit: programToEdit.costPerCredit || '',
      }));
    }
  }, [programToEdit, group]);

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = t('codeRequired');
    }

    if (!formData.name_rus.trim()) {
      newErrors.name_rus = t('nameRusRequired');
    }

    if (!formData.name_kaz.trim()) {
      newErrors.name_kaz = t('nameKazRequired');
    }

    if (!formData.name_eng.trim()) {
      newErrors.name_eng = t('nameEngRequired');
    }

    if (formData.languages.length === 0) {
      newErrors.languages = t('languagesRequired');
    }

    if (formData.duration < 1) {
      newErrors.duration = t('durationInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProgram = async () => {
    // Валидация перед сохранением
    if (!validateForm()) {
      toast.error(t('formValidationError'));
      return;
    }

    try {
      // Всегда используем academic_level из группы
      const programData = {
        ...formData,
        groupId,
        academic_level: group?.academic_level || AcademicLevel.BACHELORS,
      };

      if (programToEdit?.id) {
        await updateProgram(programToEdit.id, programData);
      } else {
        await addProgram(programData);
      }
      onClose();
    } catch (err) {
      console.error('Ошибка при сохранении программы:', err);
    }
  };

  // Обработчик выбора языка явно указывает тип
  const handleLanguageSelect = (languageId: string, checked: boolean) => {
    console.log(`Выбор языка ${languageId}, статус: ${checked}`);

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, languageId],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        languages: prev.languages.filter((id) => id !== languageId),
      }));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className="h-[90vh] max-w-[95vw] overflow-y-auto p-6"
        aria-describedby="dialog-title"
      >
        <DialogTitle className="mb-6 text-2xl font-bold">
          {programToEdit ? c('edit') : c('create')} {t('program')}
        </DialogTitle>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid h-full grid-cols-1 gap-6 md:grid-cols-2"
        >
          {/* Код программы */}
          <Card className={`p-4 transition-all ${errors.code ? 'border-red-500' : ''}`}>
            <Label className="text-sm font-medium">{t('code')}</Label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder={t('code')}
            />
            {errors.code && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1 text-sm text-red-500"
              >
                {errors.code}
              </motion.p>
            )}

            <Label className="block text-sm font-medium">{t('name')}</Label>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-gray-500">{t('nameRus')}</Label>
                <Input
                  value={formData.name_rus}
                  onChange={(e) => setFormData({ ...formData, name_rus: e.target.value })}
                  placeholder={t('nameRus')}
                  className={errors.name_rus ? 'border-red-500' : ''}
                />
                {errors.name_rus && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.name_rus}
                  </motion.p>
                )}
              </div>

              <div>
                <Label className="text-xs text-gray-500">{t('nameKaz')}</Label>
                <Input
                  value={formData.name_kaz}
                  onChange={(e) => setFormData({ ...formData, name_kaz: e.target.value })}
                  placeholder={t('nameKaz')}
                  className={errors.name_kaz ? 'border-red-500' : ''}
                />
                {errors.name_kaz && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.name_kaz}
                  </motion.p>
                )}
              </div>

              <div>
                <Label className="text-xs text-gray-500">{t('nameEng')}</Label>
                <Input
                  value={formData.name_eng}
                  onChange={(e) => setFormData({ ...formData, name_eng: e.target.value })}
                  placeholder={t('nameEng')}
                  className={errors.name_eng ? 'border-red-500' : ''}
                />
                {errors.name_eng && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.name_eng}
                  </motion.p>
                )}
              </div>
            </div>
          </Card>

          {/* Языки обучения */}
          <Card className={`p-4 transition-all ${errors.languages ? 'border-red-500' : ''}`}>
            <Label className="mb-2 block text-sm font-medium">{t('languages')}</Label>
            <div className="space-y-2">
              {availableLanguages.map((language) => {
                const isChecked = formData.languages.includes(language.id);
                console.log(`Язык ${language.name_rus} (${language.id}), выбран: ${isChecked}`);

                return (
                  <div key={language.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`language-${language.id}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleLanguageSelect(language.id, !!checked)}
                    />
                    <div
                      className={`flex flex-col rounded-md p-2 transition-colors ${
                        isChecked ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <Label htmlFor={`language-${language.id}`} className="cursor-pointer text-sm">
                        {language.name_rus}
                      </Label>
                      <div className="flex space-x-2 text-xs text-gray-500">
                        <span>{language.name_kaz}</span>
                        <span>|</span>
                        <span>{language.name_eng}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.languages && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1 text-sm text-red-500"
              >
                {errors.languages}
              </motion.p>
            )}
          </Card>

          {/* Остальные поля */}
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">{t('duration')}</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })
                  }
                  min={1}
                  className={errors.duration ? 'border-red-500' : ''}
                />
                {errors.duration && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.duration}
                  </motion.p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">{t('costPerCredit')}</Label>
                <Input
                  value={formData.costPerCredit}
                  onChange={(e) => setFormData({ ...formData, costPerCredit: e.target.value })}
                  placeholder={t('costPerCredit')}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.visibility}
                  onCheckedChange={(checked) => setFormData({ ...formData, visibility: checked })}
                />
                <Label>{c('visibility')}</Label>
              </div>
            </div>
          </Card>

          {/* Кнопки действий */}
          <div className="col-span-full flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              {c('cancel')}
            </Button>
            <Button onClick={handleSaveProgram}>{c('save')}</Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ProgramForm;
