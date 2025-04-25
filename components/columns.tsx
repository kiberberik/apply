import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ExtendedApplication } from '@/store/useApplicationStore';
import { AcademicLevel, ApplicationStatus, StudyType, User, Role } from '@prisma/client';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FilterMenu } from './ui/filter-menu';
import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useConsultants } from '@/hooks/useConsultants';

const HeaderComponent = ({
  column,
  title,
}: {
  column: {
    toggleSorting: (desc: boolean) => void;
    getIsSorted: () => false | 'asc' | 'desc';
  };
  title: string;
}) => {
  const t = useTranslations('Applications');
  return (
    <Button
      className="flex items-center justify-center"
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {t(title)}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

const FilterHeaderComponent = ({
  column,
  title,
  filterType,
}: {
  column: {
    toggleSorting: (desc: boolean) => void;
    getIsSorted: () => false | 'asc' | 'desc';
    setFilterValue: (value: string[] | undefined) => void;
  };
  title: string;
  filterType: 'academicLevel' | 'studyType' | 'status' | 'consultant';
}) => {
  const tAcademicLevel = useTranslations('AcademicLevel');
  const tStudyType = useTranslations('StudyType');
  const tApplicationStatus = useTranslations('ApplicationStatus');
  const { user } = useAuthStore();
  const { consultants } = useConsultants();
  const [options, setOptions] = useState(() => {
    let initialOptions: { id: string; label: string; checked: boolean }[] = [];

    switch (filterType) {
      case 'academicLevel':
        initialOptions = Object.values(AcademicLevel).map((level) => ({
          id: level,
          label: tAcademicLevel(level),
          checked: true,
        }));
        break;
      case 'studyType':
        initialOptions = Object.values(StudyType).map((type) => ({
          id: type,
          label: tStudyType(type),
          checked: true,
        }));
        break;
      case 'status':
        initialOptions = Object.values(ApplicationStatus).map((status) => ({
          id: status,
          label: tApplicationStatus(status),
          checked: true,
        }));
        break;
      case 'consultant':
        // По умолчанию пустой массив, будет заполнен в useEffect
        break;
    }

    return initialOptions;
  });

  // Обновляем опции консультантов при их загрузке
  useEffect(() => {
    if (filterType === 'consultant' && consultants.length > 0) {
      const allConsultants = [...consultants];

      // Добавляем текущего пользователя в список, если он ADMIN или MANAGER
      if (user && (user.role === Role.ADMIN || user.role === Role.MANAGER)) {
        const currentUserExists = allConsultants.some((c) => c.id === user.id);
        if (!currentUserExists) {
          allConsultants.push(user);
        }
      }

      const newOptions = allConsultants.map((consultant) => ({
        id: consultant.id,
        label: consultant.name || consultant.email || 'Консультант',
        // Для CONSULTANT выбран только он сам, для ADMIN/MANAGER все заявки
        checked: user?.role === Role.CONSULTANT ? consultant.id === user.id : true,
      }));
      setOptions(newOptions);

      // Устанавливаем начальное значение фильтра
      const selectedIds = newOptions.filter((option) => option.checked).map((option) => option.id);
      column.setFilterValue(selectedIds.length === allConsultants.length ? undefined : selectedIds);
    }
  }, [consultants, filterType, user, column]);

  const handleOptionChange = useCallback(
    (selectedOptions: string[]) => {
      column.setFilterValue(
        selectedOptions.length === options.length ? undefined : selectedOptions,
      );
      setOptions((prev) =>
        prev.map((option) => ({
          ...option,
          checked: selectedOptions.includes(option.id),
        })),
      );
    },
    [column, options.length],
  );

  return (
    <div className="flex items-center space-x-2">
      {/* <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        {t(title)}
      </Button> */}
      <FilterMenu title={title} options={options} onChange={handleOptionChange} />
    </div>
  );
};

const SimpleHeaderComponent = ({ title }: { title: string }) => {
  const t = useTranslations('Applications');
  return <div className="flex items-center justify-center text-sm font-medium">{t(title)}</div>;
};

const StatusCell = ({ status }: { status: ApplicationStatus }) => {
  const tApplicationStatus = useTranslations('ApplicationStatus');
  return (
    <Badge variant="outline" className="mx-auto w-full items-center justify-center p-2">
      <span className="text-center text-wrap">{status ? tApplicationStatus(status) : '-'}</span>
    </Badge>
  );
};

const AcademicLevelCell = ({ academicLevel }: { academicLevel: string }) => {
  const tAcademicLevel = useTranslations('AcademicLevel');
  return (
    <Badge variant="outline" className="mx-auto w-full items-center justify-center p-2">
      <span className="text-center text-wrap">
        {academicLevel ? tAcademicLevel(academicLevel as AcademicLevel) : '-'}
      </span>
    </Badge>
  );
};

const TypeCell = ({ type }: { type: string }) => {
  const tStudyType = useTranslations('StudyType');
  return (
    <Badge variant="outline" className="mx-auto w-full items-center justify-center p-2">
      <span className="text-center text-wrap">{type ? tStudyType(type as StudyType) : '-'}</span>
    </Badge>
  );
};

const ConsultantCell = ({ consultant }: { consultant: User | null }) => {
  return (
    <div className="mx-auto flex flex-wrap items-center justify-start">
      {consultant ? (
        <div>
          <h3 className="w-full text-left text-wrap">{consultant?.name}</h3>
          <p className="text-sm text-wrap text-gray-500">{consultant?.email}</p>
        </div>
      ) : (
        <div className="w-full text-center">-</div>
      )}
    </div>
  );
};

export const columns: ColumnDef<ExtendedApplication, unknown>[] = [
  {
    id: 'number',
    header: () => '#',
    cell: ({ table, row }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      const rowIndex = table.getRowModel().rows.findIndex((r) => r.id === row.id);
      return pageIndex * pageSize + rowIndex + 1;
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'applicant',
    header: ({ column }) => <HeaderComponent column={column} title="columnsApplicant" />,
    cell: ({ row }) => {
      const applicant = row.original.applicant;
      return (
        <div className="mx-auto flex w-full items-center justify-start">
          <span className="text-center break-words">
            {applicant ? `${applicant.surname || ''} ${applicant.givennames || ''}` : '-'}
          </span>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase();
      const applicant = row.original.applicant;
      if (!applicant) return false;

      return (
        (applicant.surname || '').toLowerCase().includes(searchValue) ||
        (applicant.givennames || '').toLowerCase().includes(searchValue) ||
        (applicant.patronymic || '').toLowerCase().includes(searchValue) ||
        (applicant.identificationNumber || '').toLowerCase().includes(searchValue)
      );
    },
  },
  {
    accessorKey: 'identificationNumber',
    header: () => <SimpleHeaderComponent title="columnsIdentificationNumber" />,
    cell: ({ row }) => {
      return (
        <div className="mx-auto flex w-full flex-wrap items-center justify-center">
          {row.original.applicant?.identificationNumber
            ? row.original.applicant.identificationNumber
            : '-'}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'submittedAt',
    header: ({ column }) => <HeaderComponent column={column} title="columnsSubmittedAt" />,
    cell: ({ row }) => {
      return (
        <div className="mx-auto flex w-full flex-wrap items-center justify-center">
          {row.original.submittedAt
            ? format(new Date(row.original.submittedAt), 'dd.MM.yyyy', { locale: ru })
            : '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'academicLevel',
    header: ({ column }) => (
      <FilterHeaderComponent
        column={column}
        title="columnsAcademicLevel"
        filterType="academicLevel"
      />
    ),
    cell: ({ row }) => (
      <AcademicLevelCell academicLevel={row.original.details?.academicLevel || ''} />
    ),
    filterFn: (row, id, filterValue: string[]) => {
      if (!filterValue?.length) return true;
      return filterValue.includes(row.original.details?.academicLevel || '');
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <FilterHeaderComponent column={column} title="columnsType" filterType="studyType" />
    ),
    cell: ({ row }) => <TypeCell type={row.original.details?.type || ''} />,
    filterFn: (row, id, filterValue: string[]) => {
      if (!filterValue?.length) return true;
      return filterValue.includes(row.original.details?.type || '');
    },
  },
  {
    accessorKey: 'statusId',
    header: ({ column }) => (
      <FilterHeaderComponent column={column} title="columnsStatus" filterType="status" />
    ),
    cell: ({ row }) => <StatusCell status={row.original.Log?.[0]?.statusId as ApplicationStatus} />,
    filterFn: (row, id, filterValue: string[]) => {
      if (!filterValue?.length) return true;
      return filterValue.includes(row.original.Log?.[0]?.statusId || '');
    },
  },
  {
    accessorKey: 'consultant',
    header: ({ column }) => (
      <FilterHeaderComponent column={column} title="columnsConsultant" filterType="consultant" />
    ),
    cell: ({ row }) => <ConsultantCell consultant={row.original.consultant || null} />,
    filterFn: (row, id, filterValue: string[]) => {
      if (!filterValue?.length) return true;
      return filterValue.includes(row.original.consultant?.id || '');
    },
  },
];
