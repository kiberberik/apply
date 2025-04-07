'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { AcademicLevel, EducationalProgram, StudyLanguage } from '@prisma/client';
import { useEducationalStore } from '@/store/useEducationalStore';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

// Определяем интерфейс для формы программы
interface ProgramFormData {
  name_rus: string;
  name_kaz: string;
  name_eng: string;
  code: string;
  languages: StudyLanguage[];
  academic_level: AcademicLevel;
  duration: number;
  visibility: boolean;
  isDeleted: boolean;
  costPerCredit: string;
}

// Расширяем тип EducationalProgram, чтобы включить поле languages
interface EducationalProgramWithLanguages extends Omit<EducationalProgram, 'languages'> {
  languages: unknown;
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
  const a = useTranslations('AcademicLevel');
  const l = useTranslations('StudyLanguage');

  // Находим группу по ID
  const group = groups.find((g) => g.id === groupId);

  // Инициализируем состояние формы с пустыми значениями
  const [formData, setFormData] = useState<ProgramFormData>({
    name_rus: '',
    name_kaz: '',
    name_eng: '',
    code: '',
    languages: [],
    academic_level: group?.academic_level || AcademicLevel.BACHELORS,
    duration: 1,
    visibility: true,
    isDeleted: false,
    costPerCredit: '',
  });

  // Состояние для ошибок валидации
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Загружаем программы при монтировании компонента
  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Заполняем форму данными программы, если она передана для редактирования
  useEffect(() => {
    if (programToEdit) {
      // Получаем языки из поля languages типа Json
      let languages: StudyLanguage[] = [];

      if (programToEdit.languages) {
        try {
          // Если languages - это строка JSON, парсим её
          if (typeof programToEdit.languages === 'string') {
            languages = JSON.parse(programToEdit.languages);
          }
          // Если languages - это уже объект, используем его напрямую
          else if (Array.isArray(programToEdit.languages)) {
            languages = programToEdit.languages;
          }
        } catch (error) {
          console.error('Ошибка при парсинге языков:', error);
        }
      }

      console.log('Загруженные языки:', languages); // Добавляем для отладки

      setFormData({
        name_rus: programToEdit.name_rus || '',
        name_kaz: programToEdit.name_kaz || '',
        name_eng: programToEdit.name_eng || '',
        code: programToEdit.code || '',
        languages: languages,
        academic_level:
          programToEdit.academic_level || group?.academic_level || AcademicLevel.BACHELORS,
        duration: programToEdit.duration || 1,
        visibility: programToEdit.visibility || true,
        isDeleted: false,
        costPerCredit: programToEdit.costPerCredit || '',
      });
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
        // Отправляем массив языков напрямую, API преобразует его в JSON
        languages: formData.languages,
      };

      if (programToEdit?.id) {
        await updateProgram(programToEdit.id, programData);
      } else {
        await addProgram(programData);
      }
      //   toast.success(programToEdit ? c('updated') : c('created'));
      onClose();
    } catch (err) {
      console.error('Ошибка при сохранении программы:', err);
      //   toast.error('Произошла ошибка при сохранении программы');
    }
  };

  // Обработчик изменения языков
  const handleLanguageChange = (language: StudyLanguage, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        languages: [...formData.languages, language],
      });
    } else {
      setFormData({
        ...formData,
        languages: formData.languages.filter((lang) => lang !== language),
      });
    }
    console.log(
      'Обновленные языки:',
      checked
        ? [...formData.languages, language]
        : formData.languages.filter((lang) => lang !== language),
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="h-[90vh] max-w-[95vw] overflow-y-auto p-6">
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
                  className={`mt-1 ${errors.name_rus ? 'border-red-500' : ''}`}
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
                  className={`mt-1 ${errors.name_kaz ? 'border-red-500' : ''}`}
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
                  className={`mt-1 ${errors.name_eng ? 'border-red-500' : ''}`}
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

          {/* Названия на разных языках */}
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">{t('academicLevel')}</Label>
                <Input
                  value={a(group?.academic_level || AcademicLevel.BACHELORS)}
                  disabled
                  className="mt-2 bg-gray-50"
                />
                <p className="mt-1 text-xs text-gray-500">{t('academicLevelInherited')}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">{t('duration')}</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })
                  }
                  placeholder={t('duration')}
                  className={`mt-2 ${errors.duration ? 'border-red-500' : ''}`}
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
                  type="text"
                  value={formData.costPerCredit}
                  onChange={(e) => setFormData({ ...formData, costPerCredit: e.target.value })}
                  placeholder={t('costPerCredit')}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">{t('languages')}</Label>
                <div className="mt-2 flex flex-wrap gap-4">
                  {Object.values(StudyLanguage).map((language) => (
                    <motion.div
                      key={language}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`language-${language}`}
                        checked={formData.languages.includes(language)}
                        onChange={(e) => handleLanguageChange(language, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor={`language-${language}`} className="cursor-pointer">
                        {language === StudyLanguage.RUS
                          ? l('RU')
                          : language === StudyLanguage.KAZ
                            ? l('KZ')
                            : language === StudyLanguage.ENG
                              ? l('EN')
                              : language}
                      </Label>
                    </motion.div>
                  ))}
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
              </div>
              <div className="flex items-center space-x-2 py-4">
                <Switch
                  id="visibility"
                  checked={formData.visibility}
                  onCheckedChange={(checked) => setFormData({ ...formData, visibility: checked })}
                />
                <Label htmlFor="visibility" className="font-medium">
                  {c('visibility')}
                </Label>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="sticky bottom-0 mt-6 flex justify-end space-x-4 border-t bg-white p-4">
          <Button variant="outline" onClick={onClose}>
            {c('cancel')}
          </Button>
          <Button onClick={handleSaveProgram} className="bg-primary hover:bg-primary/90">
            {programToEdit ? c('save') : c('create')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProgramForm;
