import {
  RelationshipDegree,
  IdentificationDocumentType,
  StudyType,
  AcademicLevel,
  SupportLanguages,
} from '@prisma/client';

export interface Applicant {
  id: string;
  givennames: string | null;
  surname: string | null;
  patronymic: string | null;
  birthDate: Date | null;
  birthPlace: string | null;
  isCitizenshipKz: boolean | null;
  citizenship: string | null;
  identificationNumber: string | null;
  documentType: IdentificationDocumentType | null;
  documentNumber: string | null;
  documentIssueDate: Date | null;
  documentExpiryDate: Date | null;
  documentIssuingAuthority: string | null;
  documentFileLinks: string | null;
  email: string | null;
  phone: string | null;
  addressResidential: string | null;
  addressRegistration: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Representative {
  id: string;
  givennames: string | null;
  surname: string | null;
  patronymic: string | null;
  isCitizenshipKz: boolean | null;
  citizenship: string | null;
  identificationNumber: string | null;
  documentType: IdentificationDocumentType | null;
  documentNumber: string | null;
  documentIssueDate: Date | null;
  documentExpiryDate: Date | null;
  documentIssuingAuthority: string | null;
  documentFileLinks: string | null;
  representativeDocumentNumber: string | null;
  representativeDocumentIssueDate: Date | null;
  representativeDocumentExpiryDate: Date | null;
  representativeDocumentIssuingAuthority: string | null;
  representativeDocumentFileLinks: string | null;
  relationshipDegree: RelationshipDegree | null;
  email: string | null;
  phone: string | null;
  addressResidential: string | null;
  addressRegistration: string | null;
  applicantId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationDetails {
  id: string;
  type: StudyType;
  academicLevel: AcademicLevel;
  isDormNeeds: boolean;
  studyingLanguage: SupportLanguages;
  educationalProgramId: string;
  applicationId: string | null;
  educationalProgram: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean | null;
    code: string | null;
    name_rus: string | null;
    name_kaz: string | null;
    name_eng: string | null;
    duration: number | null;
    visibility: boolean | null;
    costPerCredit: string | null;
    groupId: string | null;
    academic_level: AcademicLevel | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtendedApplication {
  id: string;
  applicant: Applicant | null;
  representative: Representative | null;
  details: ApplicationDetails | null;
  contractLanguage: SupportLanguages | null;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date | null;
  Log?: Array<{
    id: string;
    statusId: string;
    createdAt: Date;
    updatedAt: Date;
  }> | null;
}
