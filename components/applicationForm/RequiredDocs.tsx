import { useForm } from 'react-hook-form';
import { useRequiredDocuments } from '@/store/useRequiredDocuments';
import { ExtendedApplication } from '@/types/application';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { differenceInYears } from 'date-fns';
import { useEffect } from 'react';

interface FormValues {
  documents?: Record<string, File> | null;
}

interface RequiredDocsProps {
  form: ReturnType<typeof useForm<FormValues>>;
  application: ExtendedApplication;
  isSubmitted?: boolean;
}

export function RequiredDocs({ form, application, isSubmitted = false }: RequiredDocsProps) {
  const { documents, fetchDocuments } = useRequiredDocuments();

  // console.log(documents);
  const filteredDocuments = documents.filter((doc) => {
    // Проверка гражданства
    const isKzCitizen = application.applicant?.isCitizenshipKz;
    const matchesCountry = doc.countries.some(
      (country) => country === (isKzCitizen ? 'KAZAKHSTAN' : 'OTHER'),
    );

    // Проверка возраста
    const birthDate = application.applicant?.birthDate;
    const age = birthDate ? differenceInYears(new Date(), new Date(birthDate)) : 0;
    const isAdult = age >= 18;
    const matchesAgeCategory = doc.ageCategories.some(
      (category) => category === (isAdult ? 'ADULT' : 'MINOR'),
    );

    // Проверка академического уровня
    const matchesAcademicLevel = doc.academicLevels.some(
      (level) => level === application.details?.academicLevel,
    );

    // Проверка типа обучения
    const matchesStudyType = doc.studyTypes.some((type) => type === application.details?.type);

    return matchesCountry && matchesAgeCategory && matchesAcademicLevel && matchesStudyType;
  });

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <div className="space-y-4">
      {filteredDocuments.map((doc) => (
        <FormField
          key={doc.id}
          control={form.control}
          name={`documents.${doc.id}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {doc.name_rus || doc.name_eng || doc.name_kaz}
                {doc.isScanRequired && <span className="ml-1 text-red-500">*</span>}
              </FormLabel>
              {doc.description && (
                <p className="text-muted-foreground mb-2 text-sm">{doc.description}</p>
              )}
              <FormControl>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.onChange(file);
                    }
                  }}
                  disabled={isSubmitted}
                />
              </FormControl>
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
