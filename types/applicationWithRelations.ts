import { Application, Applicant, Details, Log } from '@prisma/client';

export type ApplicationWithRelations = Application & {
  applicant:
    | (Applicant & {
        givennames: string | null;
        surname: string | null;
      })
    | null;
  details: Details | null;
  Log?: Log[];
  createdBy?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
};
