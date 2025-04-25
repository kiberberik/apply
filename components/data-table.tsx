import { useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
  Header,
  HeaderGroup,
  Cell,
  Table as TableInstance,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { ExtendedApplication, useApplicationStore } from '@/store/useApplicationStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Trash2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/useAuthStore';

interface DataTableProps {
  columns: ColumnDef<ExtendedApplication, unknown>[];
  data: ExtendedApplication[];
}

const columnWidths: { [key: string]: string } = {
  number: 'w-[50px] min-w-[50px] max-w-[50px]',
  applicant: 'w-[250px] min-w-[250px] max-w-[250px]',
  identificationNumber: 'w-[120px] min-w-[120px] max-w-[120px]',
  submittedAt: 'w-[100px] min-w-[100px] max-w-[100px]',
  academicLevel: 'w-[120px] min-w-[120px] max-w-[120px]',
  type: 'w-[120px] min-w-[120px] max-w-[120px]',
  consultant: 'w-[200px] min-w-[200px] max-w-[200px]',
  statusId: 'w-[150px] min-w-[150px] max-w-[150px]',
  actions: 'w-[50px] min-w-[50px] max-w-[50px]',
};

function PaginationButtons({ table }: { table: TableInstance<ExtendedApplication> }) {
  const currentPage = table.getState().pagination.pageIndex;
  const totalPages = table.getPageCount();

  const generatePaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 7;

    // Всегда показываем первую страницу
    buttons.push(
      <Button
        key={0}
        variant={currentPage === 0 ? 'default' : 'outline'}
        size="sm"
        onClick={() => table.setPageIndex(0)}
      >
        1
      </Button>,
    );

    if (totalPages <= maxVisibleButtons) {
      // Если страниц мало, показываем все
      for (let i = 1; i < totalPages; i++) {
        buttons.push(
          <Button
            key={i}
            variant={currentPage === i ? 'default' : 'outline'}
            size="sm"
            onClick={() => table.setPageIndex(i)}
          >
            {i + 1}
          </Button>,
        );
      }
    } else {
      // Сложная логика с эллипсисом
      if (currentPage > 2) {
        buttons.push(<span key="ellipsis1">...</span>);
      }

      // Показываем страницы вокруг текущей
      for (
        let i = Math.max(1, currentPage - 1);
        i <= Math.min(currentPage + 1, totalPages - 2);
        i++
      ) {
        buttons.push(
          <Button
            key={i}
            variant={currentPage === i ? 'default' : 'outline'}
            size="sm"
            onClick={() => table.setPageIndex(i)}
          >
            {i + 1}
          </Button>,
        );
      }

      if (currentPage < totalPages - 3) {
        buttons.push(<span key="ellipsis2">...</span>);
      }

      // Всегда показываем последнюю страницу
      if (totalPages > 1) {
        buttons.push(
          <Button
            key={totalPages - 1}
            variant={currentPage === totalPages - 1 ? 'default' : 'outline'}
            size="sm"
            onClick={() => table.setPageIndex(totalPages - 1)}
          >
            {totalPages}
          </Button>,
        );
      }
    }

    return buttons;
  };

  return <div className="flex items-center gap-1">{generatePaginationButtons()}</div>;
}

export function DataTable({ columns, data }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchValue, setSearchValue] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { applications, isLoading, error } = useApplicationStore();
  const c = useTranslations('Common');
  const tApplications = useTranslations('Applications');

  const table = useReactTable<ExtendedApplication>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    manualPagination: false,
    pageCount: undefined,
  });

  // Обработчик изменения поискового запроса
  const handleSearch = (value: string) => {
    setSearchValue(value);
    table.getColumn('applicant')?.setFilterValue(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">{c('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">{tApplications('noApplications')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder={tApplications('searchPlaceholder')}
          value={searchValue}
          onChange={(event) => handleSearch(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<ExtendedApplication>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<ExtendedApplication, unknown>) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        columnWidths[header.column.id] || 'w-[200px] max-w-[200px] min-w-[200px]'
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: Row<ExtendedApplication>) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-muted/50 cursor-pointer"
                >
                  {row.getVisibleCells().map((cell: Cell<ExtendedApplication, unknown>) => (
                    <TableCell
                      key={cell.id}
                      className={`${columnWidths[cell.column.id] || 'w-[200px] max-w-[200px] min-w-[200px]'} truncate`}
                    >
                      <Link href={`/applications/${row.original.id}`} className="block w-full">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Link>
                    </TableCell>
                  ))}
                  <RemoveCell row={row} />
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {tApplications('noApplications')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {`${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-${Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} / ${table.getFilteredRowModel().rows.length}`}
        </div>
        <div className="flex items-center space-x-2">
          <PaginationButtons table={table} />
        </div>
      </div>
    </div>
  );
}

export const RemoveCell = ({ row }: { row: Row<ExtendedApplication> }) => {
  const c = useTranslations('Common');
  const application = row.original;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteApplication } = useApplicationStore();
  const { user } = useAuthStore();
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteApplication(application.id);
      setIsDeleteDialogOpen(false);
      toast.success(c('successDelete'));
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error(c('errorDelete'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <TableCell className="flex items-center justify-center">
        <Button
          variant="ghost"
          className="bg-none hover:cursor-pointer"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={
            application.Log?.[0]?.statusId !== 'DRAFT' || application.createdById !== user?.id
          }
        >
          <Trash2 className="h-4 w-4 text-red-600 hover:text-red-700" />
        </Button>
      </TableCell>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby="dialog-title">
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
