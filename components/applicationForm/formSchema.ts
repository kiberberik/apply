import { z } from 'zod';
import {
  AcademicLevel,
  IdentificationDocumentType,
  RelationshipDegree,
  StudyType,
  SupportLanguages,
} from '@prisma/client';

export const formSchema = z.object({
  applicant: z.object({
    givennames: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    surname: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    patronymic: z.string().nullable(),
    birthDate: z
      .string()
      .min(1, '')
      .nullable()
      .refine((val) => val !== null && val !== '', {
        message: '',
      }),
    birthPlace: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    citizenship: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    identificationNumber: z.string().nullable(),
    documentType: z
      .nativeEnum(IdentificationDocumentType, {
        errorMap: () => {
          return { message: '' };
        },
      })
      .nullable()
      .refine((val) => val !== null, {
        message: '',
      }),
    documentNumber: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    documentIssueDate: z
      .string()
      .min(1, '')
      .nullable()
      .refine((val) => val !== null && val !== '', {
        message: '',
      }),
    documentExpiryDate: z
      .string()
      .min(1, '')
      .nullable()
      .refine((val) => val !== null && val !== '', {
        message: '',
      }),
    documentIssuingAuthority: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    documentFileLinks: z.string().nullable(),
    email: z
      .string()
      .email('')
      .nullable()
      .refine((val) => val !== null && val !== '', {
        message: '',
      }),
    phone: z
      .string()
      .trim()
      .min(1)
      .nullable()
      .refine((val) => val !== null && val !== '', {
        message: '',
      }),
    addressResidential: z
      .string()
      .trim()
      .min(1)
      .nullable()
      .refine((val) => val !== null && val !== '', {
        message: '',
      }),
    addressRegistration: z
      .string()
      .trim()
      .min(1)
      .nullable()
      .refine((val) => val !== null && val !== '', {
        message: '',
      }),
  }),
  representative: z
    .object({
      givennames: z.string().nullable().optional(),
      surname: z.string().nullable().optional(),
      patronymic: z.string().nullable().optional(),
      citizenship: z.string().nullable().optional(),
      identificationNumber: z.string().nullable().optional(),
      documentType: z.nativeEnum(IdentificationDocumentType).nullable().optional(),
      documentNumber: z.string().nullable().optional(),
      documentIssueDate: z.string().nullable().optional(),
      documentExpiryDate: z.string().nullable().optional(),
      documentIssuingAuthority: z.string().nullable().optional(),
      documentFileLinks: z.string().nullable().optional(),
      representativeDocumentNumber: z.string().nullable().optional(),
      representativeDocumentIssueDate: z.string().nullable().optional(),
      representativeDocumentExpiryDate: z.string().nullable().optional(),
      representativeDocumentIssuingAuthority: z.string().nullable().optional(),
      representativeDocumentFileLinks: z.string().nullable().optional(),
      relationshipDegree: z.nativeEnum(RelationshipDegree).nullable().optional(),
      email: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      addressResidential: z.string().nullable().optional(),
      addressRegistration: z.string().nullable().optional(),
      applicantId: z.string().nullable().optional(),
      id: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  details: z.object({
    type: z.nativeEnum(StudyType, {
      errorMap: () => {
        return { message: '' };
      },
    }),
    academicLevel: z.nativeEnum(AcademicLevel, {
      errorMap: () => {
        return { message: '' };
      },
    }),
    isDormNeeds: z.boolean().nullable().optional(),
    studyingLanguage: z.nativeEnum(SupportLanguages, {
      errorMap: () => {
        return { message: '' };
      },
    }),
    educationalProgramId: z
      .string()
      .trim()
      .min(1, '')
      .nullable()
      .refine((val) => val !== null && val !== '', {
        message: '',
      }),
  }),
  contractLanguage: z
    .nativeEnum(SupportLanguages, { required_error: '' })
    .nullable()
    .transform((v) => (v === null ? ('RUS' as SupportLanguages) : v)),
  documents: z.record(z.string(), z.string()).nullable().optional(),
});
