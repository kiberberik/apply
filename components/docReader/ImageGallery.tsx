import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { FileIcon } from 'lucide-react';

/* eslint-disable @next/next/no-img-element */
interface ImageGalleryProps {
  images: string[];
  onDelete: (index: number) => void;
}

export const ImageGallery = ({ images, onDelete }: ImageGalleryProps) => {
  const t = useTranslations('Common');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  console.log(images);
  if (images.length === 0) return null;

  const isPdf = (url: string) => url.startsWith('pdf:');

  const getFileType = (url: string) => {
    if (isPdf(url)) {
      return 'pdf';
    }
    return 'image';
  };

  const getDisplayUrl = (url: string) => {
    if (isPdf(url)) {
      return url.substring(4); // Убираем префикс 'pdf:'
    }
    return url;
  };

  return (
    <div className="mt-4 rounded-lg bg-white p-4">
      <h2 className="my-4 text-base font-semibold">{t('uploadedImages')}</h2>
      <div className="grid grid-cols-3 gap-2">
        {images.map((image, index) => (
          <div key={index} className="group relative">
            {getFileType(image) === 'pdf' ? (
              <div
                onClick={() => setSelectedImage(image)}
                className="flex h-32 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
              >
                <FileIcon className="h-8 w-8 text-gray-400" />
              </div>
            ) : (
              <img
                src={image}
                alt={`${index + 1}`}
                className="h-32 w-full cursor-pointer rounded-lg object-contain"
                onClick={() => setSelectedImage(image)}
              />
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete(index);
              }}
              className="absolute top-2 right-2 z-50 rounded-full bg-red-500 p-1 text-white opacity-100 transition-opacity group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogTitle className="text-lg font-semibold"></DialogTitle>
        <DialogContent className="max-w-4xl">
          {selectedImage &&
            (getFileType(selectedImage) === 'pdf' ? (
              <iframe
                src={getDisplayUrl(selectedImage)}
                className="h-[80vh] w-full"
                title="PDF Preview"
              />
            ) : (
              <img
                src={selectedImage}
                alt="Preview"
                className="max-h-[80vh] w-full object-contain"
              />
            ))}
        </DialogContent>
      </Dialog>
    </div>
  );
};
