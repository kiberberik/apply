import React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { Button } from './button';
import { toast } from 'react-toastify';

interface DocumentPreviewProps {
  documentFileLinks: string | null;
  translationPrefix?: string;
  translations: {
    uploadedDocuments: string;
    view: string;
  };
  onDocumentRemoved?: () => void;
  applicantId?: string;
  representativeId?: string;
}

export function DocumentPreview({
  documentFileLinks,
  translations,
  onDocumentRemoved,
  applicantId,
  representativeId,
}: DocumentPreviewProps) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!documentFileLinks) return null;

  let links: string[] = [];
  try {
    // Если documentFileLinks - это строка
    if (documentFileLinks) {
      // Пытаемся распарсить как JSON
      try {
        const parsed = JSON.parse(documentFileLinks);

        // Если это массив, обрабатываем каждый элемент
        if (Array.isArray(parsed)) {
          links = parsed.flatMap((item) => {
            // Если элемент сам является JSON строкой, распарсим его
            if (typeof item === 'string') {
              if (item.startsWith('[') || item.startsWith('"')) {
                try {
                  const innerParsed = JSON.parse(item);
                  // Если это массив, возвращаем его элементы
                  if (Array.isArray(innerParsed)) {
                    return innerParsed;
                  }
                  return [innerParsed];
                } catch {
                  // Если не удалось распарсить как JSON, считаем обычной строкой
                  return [item];
                }
              }
              // Обычная строка URL
              return [item];
            }
            return [];
          });
        } else if (typeof parsed === 'string') {
          // Если распарсенное значение - строка
          links = [parsed];
        }
      } catch {
        // Если не удалось распарсить как JSON, считаем обычной строкой URL
        links = [documentFileLinks];
      }
    }

    // Фильтруем пустые значения и дубликаты
    links = [...new Set(links.filter(Boolean))];

    if (!links.length) return null;
  } catch (error) {
    console.error('Ошибка при парсинге documentFileLinks:', error);
    return null;
  }

  const handleDeleteClick = (e: React.MouseEvent, link: string) => {
    e.stopPropagation();
    setDeleteTarget(link);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await fetch('/api/delete-document', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl: deleteTarget,
          applicantId,
          representativeId,
        }),
      });

      if (response.ok) {
        toast.success('Документ удален', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        });
        if (onDocumentRemoved) {
          onDocumentRemoved();
        }
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при удалении документа');
      }
    } catch (error) {
      console.error('Ошибка при удалении документа:', error);
      toast.error(error instanceof Error ? error.message : 'Не удалось удалить документ', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="mt-4">
        <div className="mt-2 flex flex-wrap gap-4">
          {links.map((link: string, index: number) => {
            const isImage =
              link.toLowerCase().endsWith('.jpg') ||
              link.toLowerCase().endsWith('.jpeg') ||
              link.toLowerCase().endsWith('.png') ||
              link.toLowerCase().endsWith('.gif');

            return (
              <div
                key={index}
                className="group relative flex cursor-pointer flex-col items-center rounded-md border p-2"
                onClick={() => setSelectedImage(link)}
              >
                <div
                  className="absolute top-1 right-1 z-10 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => handleDeleteClick(e, link)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="rounded-full bg-white p-1 text-red-500 hover:text-red-700"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </div>
                {isImage ? (
                  <div className="relative mb-2 h-24 w-24">
                    <Image
                      src={link}
                      alt={`ID ${index + 1}`}
                      fill
                      unoptimized={true}
                      className="rounded-md object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-2 flex h-24 w-24 items-center justify-center rounded-md bg-gray-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Диалог просмотра документа */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-h-[80vh] sm:max-w-[80vw]" aria-describedby="dialog-title">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <div className="flex h-full w-full items-center justify-center">
            {selectedImage &&
              (selectedImage.toLowerCase().endsWith('.pdf') ? (
                <iframe src={selectedImage} className="h-[70vh] w-full" title={translations.view} />
              ) : (
                <div className="relative h-[70vh] w-full">
                  <Image
                    src={selectedImage}
                    alt={translations.view}
                    fill
                    unoptimized={true}
                    className="object-contain"
                  />
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить этот документ? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
