import { ColumnDef, Row } from '@tanstack/react-table';
import { Application, Log, Applicant } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type ApplicationWithRelations = Application & {
  Log?: Log[];
  applicant?: Applicant | null;
};

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
    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      {t(title)}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

const ActionCell = ({ row }: { row: Row<ApplicationWithRelations> }) => {
  const c = useTranslations('Common');
  const application = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">{c('view')}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/applications/${application.id}`}>{c('view')}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/applications/${application.id}/edit`}>{c('edit')}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600">{c('delete')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<ApplicationWithRelations>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => <HeaderComponent column={column} title="columnsId" />,
  },
  {
    accessorKey: 'statusId',
    header: ({ column }) => <HeaderComponent column={column} title="columnsStatus" />,
    cell: ({ row }) => {
      const status = row.original.Log?.[0]?.statusId || 'DRAFT';
      return <Badge variant="outline">{status}</Badge>;
    },
  },
  {
    accessorKey: 'applicant',
    header: ({ column }) => <HeaderComponent column={column} title="columnsApplicant" />,
    cell: ({ row }) => {
      const applicant = row.original.applicant;
      return applicant ? `${applicant.lastname || ''} ${applicant.firstname || ''}` : 'Не указан';
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <HeaderComponent column={column} title="columnsCreatedAt" />,
    cell: ({ row }) => {
      return new Date(row.original.createdAt).toLocaleDateString();
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell row={row} />,
  },
];
