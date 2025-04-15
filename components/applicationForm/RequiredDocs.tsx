import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useApplicationsStore } from '@/store/useApplicationsStore';
import { Country, AcademicLevel, StudyType } from '@prisma/client';

interface RequiredDoc {
  id: string;
  title: string;
  description: string;
  requiredFor: {
    citizenship: Country[];
    academicLevel: AcademicLevel[];
    studyType: StudyType[];
  };
}

interface RequiredDocsProps {
  onDocumentUpload: (documentId: string, file: File) => void;
}

function RequiredDocs({ onDocumentUpload }: RequiredDocsProps) {
  const t = useTranslations('RequiredDocuments');
  const { currentApplication } = useApplicationsStore();

  if (!currentApplication?.applicant || !currentApplication?.details) {
    return null;
  }

  const { citizenship } = currentApplication.applicant;
  const { academicLevel, type: studyType } = currentApplication.details;

  const requiredDocs: RequiredDoc[] = [
    {
      id: 'passport',
      title: 'Паспорт',
      description: 'Копия паспорта',
      requiredFor: {
        citizenship: [Country.KAZAKHSTAN],
        academicLevel: [AcademicLevel.BACHELORS, AcademicLevel.MASTERS, AcademicLevel.DOCTORAL],
        studyType: [StudyType.PAID, StudyType.GRANT],
      },
    },
    {
      id: 'diploma',
      title: 'Диплом',
      description: 'Копия диплома о предыдущем образовании',
      requiredFor: {
        citizenship: [Country.KAZAKHSTAN, Country.OTHER],
        academicLevel: [AcademicLevel.MASTERS, AcademicLevel.DOCTORAL],
        studyType: [StudyType.PAID, StudyType.GRANT],
      },
    },
    {
      id: 'transcript',
      title: 'Академическая справка',
      description: 'Копия академической справки',
      requiredFor: {
        citizenship: [Country.KAZAKHSTAN, Country.OTHER],
        academicLevel: [AcademicLevel.MASTERS, AcademicLevel.DOCTORAL],
        studyType: [StudyType.PAID, StudyType.GRANT],
      },
    },
  ];

  const filteredDocs = requiredDocs.filter((doc) => {
    if (citizenship && !doc.requiredFor.citizenship.includes(citizenship as Country)) {
      return false;
    }
    if (academicLevel && !doc.requiredFor.academicLevel.includes(academicLevel)) {
      return false;
    }
    if (studyType && !doc.requiredFor.studyType.includes(studyType)) {
      return false;
    }
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredDocs.map((doc) => (
            <FormItem key={doc.id}>
              <FormLabel>
                {doc.title}{' '}
                {citizenship &&
                  doc.requiredFor.citizenship.includes(citizenship as Country) &&
                  '(Оригинал)'}
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onDocumentUpload(doc.id, file);
                    }
                  }}
                />
              </FormControl>
              {doc.description && (
                <p className="text-muted-foreground text-sm">{doc.description}</p>
              )}
              <FormMessage />
            </FormItem>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default RequiredDocs;
