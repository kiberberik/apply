import { Application, Log } from '@prisma/client';

export type ApplicationWithRelations = Application & {
  Log?: Log[];
  applicant?: {
    firstname: string;
    lastname: string;
  } | null;
};
