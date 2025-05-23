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
    // isCitizenshipKz: z
    //   .boolean({ required_error: '' })
    //   .nullable()
    //   .transform((v) => (v === null ? false : v)),
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
    // .string({ required_error: '' })
    // .trim()
    // .min(1, '')
    // .nullable()
    // .transform((v) => (v === null ? '' : v)),
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
      givennames: z
        .string()
        .trim()
        .min(1, '')
        .nullable()
        .refine((val) => val !== null && val !== '', {
          message: '',
        }),
      surname: z
        .string()
        .trim()
        .min(1, '')
        .nullable()
        .refine((val) => val !== null && val !== '', {
          message: '',
        }),
      patronymic: z.string().nullable(),
      citizenship: z
        .string()
        .trim()
        .min(1, '')
        .nullable()
        .refine((val) => val !== null && val !== '', {
          message: '',
        }),
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
        .string()
        .trim()
        .min(1, '')
        .nullable()
        .refine((val) => val !== null && val !== '', {
          message: '',
        }),
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
        .string()
        .trim()
        .min(1, '')
        .nullable()
        .refine((val) => val !== null && val !== '', {
          message: '',
        }),
      documentFileLinks: z.string().nullable(),
      representativeDocumentNumber: z
        .string()
        .trim()
        .min(1, '')
        .nullable()
        .refine((val) => val !== null && val !== '', {
          message: '',
        }),
      representativeDocumentIssueDate: z
        .string()
        .min(1, '')
        .nullable()
        .refine((val) => val !== null && val !== '', {
          message: '',
        }),
      representativeDocumentExpiryDate: z
        .string()
        .min(1, '')
        .nullable()
        .refine((val) => val !== null && val !== '', {
          message: '',
        }),
      representativeDocumentIssuingAuthority: z
        .string()
        .trim()
        .min(1, '')
        .nullable()
        .refine((val) => val !== null && val !== '', {
          message: '',
        }),
      representativeDocumentFileLinks: z.string().nullable(),
      relationshipDegree: z
        .nativeEnum(RelationshipDegree, {
          errorMap: () => {
            return { message: '' };
          },
        })
        .nullable()
        .refine((val) => val !== null, {
          message: '',
        }),
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
        .min(1, '')
        .nullable()
        .refine((val) => val !== null && val !== '', {
          message: '',
        }),
      addressResidential: z
        .string()
        .trim()
        .min(1, '')
        .nullable()
        .refine((val) => val !== null && val !== '', {
          message: '',
        }),
      addressRegistration: z
        .string()
        .trim()
        .min(1, '')
        .nullable()
        .refine((val) => val !== null && val !== '', {
          message: '',
        }),
      applicantId: z.string().nullable(),
      id: z.string().nullable(),
    })
    .nullable(),
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
