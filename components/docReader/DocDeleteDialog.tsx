'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useTranslations } from 'next-intl';

interface DocDeleteDialogProps {
  confirmDeleteOpen: boolean;
  setConfirmDeleteOpen: (open: boolean) => void;
  handleDeleteDocument: () => void;
  isLoading: Record<string, boolean>;
  documentToDelete: { code: string };
}

const DocDeleteDialog = ({
  confirmDeleteOpen,
  setConfirmDeleteOpen,
  handleDeleteDocument,
  isLoading,
  documentToDelete,
}: DocDeleteDialogProps) => {
  const c = useTranslations('Common');
  return (
    <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{c('deleteConfirmTitle')}</DialogTitle>
          <DialogDescription>{c('deleteConfirmDescription')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
            {c('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteDocument}
            disabled={isLoading[documentToDelete?.code || '']}
          >
            {isLoading[documentToDelete?.code || ''] ? c('deleting') : c('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocDeleteDialog;
