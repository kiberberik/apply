'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { useSingleApplication } from '@/store/useSingleApplication';
import { RelationshipDegree } from '@prisma/client';
import ApplicantForm from './Applicant';
import RepresentativeForm from './Representative';
import DetailsForm from './Details';
import RequiredDocs from './RequiredDocs';

interface ApplicationFormProps {
  id: string;
}

const applicantSchema = z.object({
  firstname: z.string().nullable(),
  lastname: z.string().nullable(),
  middlename: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  birthDate: z.string().nullable(),
  identificationNumber: z.string().nullable(),
});

const representativeSchema = z.object({
  firstname: z.string().nullable(),
  lastname: z.string().nullable(),
  middlename: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  identificationNumber: z.string().nullable(),
  relationshipDegree: z.nativeEnum(RelationshipDegree).nullable(),
});

const detailsSchema = z.object({
  type: z.enum(['PAID', 'GRANT', 'NONE_DEGREE', 'CONDITIONAL', 'OTHER']).nullable(),
  academicLevel: z.enum(['BACHELORS', 'MASTERS', 'DOCTORAL']).nullable(),
  studyingLanguage: z.enum(['RUS', 'KAZ', 'ENG']).nullable(),
  isDormNeeds: z.boolean().nullable(),
});

const formSchema = z.object({
  applicant: applicantSchema,
  representative: representativeSchema.optional(),
  details: detailsSchema,
});

type FormValues = z.infer<typeof formSchema>;

export function ApplicationForm({ id }: ApplicationFormProps) {
  const c = useTranslations('Common');
  const router = useRouter();
  const { application, updateApplication } = useSingleApplication();
  const tApplicant = useTranslations('Applicant');
  const tRepresentative = useTranslations('Representative');
  const tDetails = useTranslations('Details');
  const tDocuments = useTranslations('Documents');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicant: {
        firstname: '',
        lastname: '',
        middlename: '',
        email: '',
        phone: '',
        birthDate: '',
        identificationNumber: '',
      },
      details: {
        type: 'PAID',
        academicLevel: 'BACHELORS',
        studyingLanguage: 'RUS',
        isDormNeeds: false,
      },
    },
  });

  useEffect(() => {
    if (application) {
      form.reset({
        applicant: {
          firstname: application.applicant?.firstname || '',
          lastname: application.applicant?.lastname || '',
          middlename: application.applicant?.middlename || '',
          email: application.applicant?.email || '',
          phone: application.applicant?.phone || '',
          birthDate: application.applicant?.birthDate
            ? new Date(application.applicant.birthDate).toISOString().split('T')[0]
            : '',
          identificationNumber: application.applicant?.identificationNumber || '',
        },
        representative: application.representative
          ? {
              firstname: application.representative.firstname || '',
              lastname: application.representative.lastname || '',
              middlename: application.representative.middlename || '',
              email: application.representative.email || '',
              phone: application.representative.phone || '',
              identificationNumber: application.representative.identificationNumber || '',
              relationshipDegree: application.representative.relationshipDegree || null,
            }
          : undefined,
        details: {
          type: application.details?.type || 'PAID',
          academicLevel: application.details?.academicLevel || 'BACHELORS',
          studyingLanguage: application.details?.studyingLanguage || 'RUS',
          isDormNeeds: application.details?.isDormNeeds || false,
        },
      });
    }
  }, [application, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      const updatedApplication = {
        ...application,
        applicant: application?.applicant
          ? {
              ...application.applicant,
              ...data.applicant,
              birthDate: data.applicant.birthDate ? new Date(data.applicant.birthDate) : null,
              createdAt: application.applicant.createdAt,
              updatedAt: new Date(),
            }
          : null,
        representative:
          data.representative && application?.representative
            ? {
                ...application.representative,
                ...data.representative,
                createdAt: application.representative.createdAt,
                updatedAt: new Date(),
              }
            : null,
        details: application?.details
          ? {
              ...application.details,
              ...data.details,
              createdAt: application.details.createdAt,
              updatedAt: new Date(),
            }
          : null,
      };

      const response = await updateApplication(id, updatedApplication);

      if (response.error) {
        throw new Error(response.error);
      }

      router.push('/applications');
    } catch (error) {
      console.error('Error updating application:', error);
      alert(error instanceof Error ? error.message : 'Произошла ошибка при обновлении заявки');
    }
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  if (!application) {
    return <div>Загрузка...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Tabs defaultValue="applicant" className="space-y-4">
          <TabsList>
            <TabsTrigger value="applicant">{tApplicant('title')}</TabsTrigger>
            <TabsTrigger value="representative">{tRepresentative('title')}</TabsTrigger>
            <TabsTrigger value="details">{tDetails('title')}</TabsTrigger>
            <TabsTrigger value="documents">{tDocuments('title')}</TabsTrigger>
          </TabsList>

          <TabsContent value="applicant">
            <ApplicantForm />
          </TabsContent>

          <TabsContent value="representative">
            <RepresentativeForm />
          </TabsContent>

          <TabsContent value="details">
            <DetailsForm />
          </TabsContent>

          <TabsContent value="documents">
            <RequiredDocs onDocumentUpload={() => {}} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4">
          <Button type="submit" onClick={handleSubmit}>
            {c('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
