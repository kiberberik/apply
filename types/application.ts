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
  email: string | null;
  phone: string | null;
  addressResidential: string | null;
  addressRegistration: string | null;
  identificationDocId: string | null;
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
  relationshipDegree: RelationshipDegree | null;
  email: string | null;
  phone: string | null;
  addressResidential: string | null;
  addressRegistration: string | null;
  identificationDocId: string | null;
  representativeDocId: string | null;
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
}
