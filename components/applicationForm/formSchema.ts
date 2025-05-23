import {
  AcademicLevel,
  IdentificationDocumentType,
  RelationshipDegree,
  StudyType,
  SupportLanguages,
} from '@prisma/client';
import { z } from 'zod';

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
      .string({ required_error: '' })
      .nullable()
      .transform((v) => (v === null ? '' : v)),
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
        required_error: '',
      })
      .nullable()
      .transform((v) => (v === null ? ('ID_CARD' as IdentificationDocumentType) : v)),
    documentNumber: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    documentIssueDate: z
      .string({ required_error: '' })
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    documentExpiryDate: z
      .string({ required_error: '' })
      .nullable()
      .transform((v) => (v === null ? '' : v)),
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
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .email('Некорректный формат email')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    phone: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    addressResidential: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
    addressRegistration: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
  }),
  representative: z
    .object({
      givennames: z.string().nullable().optional(),
      surname: z.string().nullable().optional(),
      patronymic: z.string().nullable().optional(),
      // isCitizenshipKz: z.boolean().nullable().optional(),
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
      email: z.string().email().nullable().optional(),
      phone: z.string().nullable().optional(),
      addressResidential: z.string().nullable().optional(),
      addressRegistration: z.string().nullable().optional(),
      applicantId: z.string().nullable().optional(),
      id: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  details: z.object({
    type: z
      .nativeEnum(StudyType, { required_error: '' })
      .nullable()
      .transform((v) => (v === null ? ('PAID' as StudyType) : v)),
    academicLevel: z
      .nativeEnum(AcademicLevel, { required_error: '' })
      .nullable()
      .transform((v) => (v === null ? ('BACHELORS' as AcademicLevel) : v)),
    isDormNeeds: z.boolean().nullable().optional(),
    studyingLanguage: z
      .nativeEnum(SupportLanguages, { required_error: '' })
      .nullable()
      .transform((v) => (v === null ? ('RUS' as SupportLanguages) : v)),
    educationalProgramId: z
      .string({ required_error: '' })
      .trim()
      .min(1, '')
      .nullable()
      .transform((v) => (v === null ? '' : v)),
  }),
  contractLanguage: z
    .nativeEnum(SupportLanguages, { required_error: '' })
    .nullable()
    .transform((v) => (v === null ? ('RUS' as SupportLanguages) : v)),
  documents: z.record(z.string(), z.string()).nullable().optional(),
});
