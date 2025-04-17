import { ColumnDef, Row } from '@tanstack/react-table';
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
import { ApplicationWithRelations } from '@/types/applicationWithRelations';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApplicationsStore } from '@/store/useApplicationsStore';

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteApplication } = useApplicationsStore();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteApplication(application.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting application:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Скрываем кнопку удаления если заявка уже помечена как удаленная
  if (application.isDeleted) {
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
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
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
          {/* <DropdownMenuItem asChild>
            <Link href={`/applications/${application.id}/edit`}>{c('edit')}</Link>
          </DropdownMenuItem> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600" onClick={() => setIsDeleteDialogOpen(true)}>
            {c('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{c('deleteConfirmation')}</DialogTitle>
            <DialogDescription>{c('deleteApplicationConfirmation')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              {c('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? c('deleting') : c('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const columns: ColumnDef<ApplicationWithRelations, unknown>[] = [
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
      return applicant ? `${applicant.surname || ''} ${applicant.givennames || ''}` : 'Не указан';
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
