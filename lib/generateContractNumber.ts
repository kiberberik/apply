import { AcademicLevel, StudyType } from '@prisma/client';

const CONTRACT_CODES: Record<AcademicLevel, Partial<Record<StudyType, string>>> = {
  [AcademicLevel.BACHELORS]: {
    [StudyType.PAID]: 'Б',
    [StudyType.CONDITIONAL]: 'УЗ',
    [StudyType.NONE_DEGREE]: 'ND',
  },
  [AcademicLevel.MASTERS]: {
    [StudyType.PAID]: 'М',
    [StudyType.CONDITIONAL]: 'М-УЗ',
    [StudyType.NONE_DEGREE]: 'M-ND',
    [StudyType.GRANT]: 'M',
  },
  [AcademicLevel.DOCTORAL]: {
    [StudyType.PAID]: 'Д',
    [StudyType.CONDITIONAL]: 'Д',
    [StudyType.NONE_DEGREE]: 'Д',
    [StudyType.GRANT]: 'Д',
  },
};

const DURATION_CODES: Record<number, string> = {
  1: '010',
  2: '020',
  3: '030',
  4: '040',
};

export const generateContractNumber = (
  academicLevel: AcademicLevel,
  type: StudyType,
  duration: number,
  identificationNumber: string,
): string => {
  const contractCode = CONTRACT_CODES[academicLevel]?.[type] ?? 'Б';
  const durationCode = DURATION_CODES[duration] ?? '040';
  const year = new Date().getFullYear().toString().slice(-2);

  return `${contractCode}-${durationCode}/${year}-${identificationNumber}`;
};
