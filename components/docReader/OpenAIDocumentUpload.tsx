import { useState, useRef, useEffect } from 'react';
// import { PDFDocument } from 'pdf-lib';
import { ImageGallery } from './ImageGallery';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import 'pdfjs-dist/legacy/build/pdf.worker.entry';

interface OpenAIDocumentUploadProps {
  onImagesAdd: (images: string[]) => void;
  images: string[];
  onDelete: (index: number) => void;
}

export const OpenAIDocumentUpload = ({
  onImagesAdd,
  images,
  onDelete,
}: OpenAIDocumentUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const t = useTranslations('Common');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const files = e.target.files;
    if (!files) return;

    setIsProcessing(true);
    const newImages: string[] = [];

    const totalImages = images.length + files.length;
    if (totalImages > 10) {
      toast.error(t('maxImagesExceeded'));
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    for (const file of Array.from(files)) {
      if (file.type === 'application/pdf') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const numPages = Math.min(pdf.numPages, 2);

          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            if (context) {
              await page.render({ canvasContext: context, viewport }).promise;
              const imageUrl = canvas.toDataURL('image/jpeg', 0.92);
              newImages.push(imageUrl);
            }
          }
        } catch (error) {
          console.error('Error processing PDF:', error);
        }
      } else if (file.type.startsWith('image/')) {
        // Конвертируем изображение в dataURL (image/jpeg)
        const imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Преобразуем в JPEG, если это не JPEG
            if (typeof reader.result === 'string' && !reader.result.startsWith('data:image/jpeg')) {
              const img = new window.Image();
              img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(img, 0, 0);
                  resolve(canvas.toDataURL('image/jpeg', 0.92));
                } else {
                  resolve(reader.result as string);
                }
              };
              img.onerror = () => resolve(reader.result as string);
              img.src = reader.result as string;
            } else {
              resolve(reader.result as string);
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        newImages.push(imageUrl);
      }
    }

    onImagesAdd(newImages);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      images.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images]);

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">{t('uploadDocuments')}</h2>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.pdf"
        multiple
        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
      />
      {isProcessing && <p className="mt-2 text-sm text-gray-500">{t('processingFiles')}</p>}
      <ImageGallery images={images || []} onDelete={onDelete} />
    </div>
  );
};
