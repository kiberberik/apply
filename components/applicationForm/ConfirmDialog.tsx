import React from 'react';
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

interface ConfirmDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  onClick: () => void;
  closeDialog: () => void;
  titleKey: string;
  descriptionKey: string;
  confirmButtonClassName?: string;
}

const ConfirmDialog = ({
  dialogOpen,
  setDialogOpen,
  onClick,
  closeDialog,
  titleKey,
  descriptionKey,
  confirmButtonClassName,
}: ConfirmDialogProps) => {
  const c = useTranslations('Common');
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{c(titleKey)}</DialogTitle>
          <DialogDescription>{c(descriptionKey)}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            {c('cancel')}
          </Button>
          <Button onClick={onClick} className={confirmButtonClassName}>
            {c('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
