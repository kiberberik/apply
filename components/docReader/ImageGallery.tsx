import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

/* eslint-disable @next/next/no-img-element */
interface ImageGalleryProps {
  images: string[];
  onDelete: (index: number) => void;
}

export const ImageGallery = ({ images, onDelete }: ImageGalleryProps) => {
  const t = useTranslations('Common');
  if (images.length === 0) return null;

  return (
    <div className="rounded-lg bg-white">
      <h2 className="my-4 text-base font-semibold">{t('uploadedImages')}</h2>
      <div className="grid grid-cols-2 gap-2">
        {images.map((image, index) => (
          <div key={index} className="group relative">
            <img
              src={image}
              alt={`${index + 1}`}
              className="h-auto w-full rounded-lg object-contain"
            />
            <button
              onClick={() => onDelete(index)}
              className="absolute top-2 right-2 z-50 rounded-full bg-red-500 p-1 text-white opacity-100 transition-opacity group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
