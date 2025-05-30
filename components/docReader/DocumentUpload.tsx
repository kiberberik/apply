import { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ImageGallery } from './ImageGallery';
import { useTranslations } from 'next-intl';
import { PDFGenerator } from './PDFGenerator';
import { toast } from 'react-toastify';

interface DocumentUploadProps {
  onImagesAdd: (images: string[]) => void;
  images: string[];
  onDelete: (index: number) => void;
}

export const DocumentUpload = ({ onImagesAdd, images, onDelete }: DocumentUploadProps) => {
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
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const pages = pdfDoc.getPages();

          const l = pages.length > 10 ? 10 : pages.length;

          for (let i = 0; i < l; i++) {
            const newPdfDoc = await PDFDocument.create();
            const [newPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
            newPdfDoc.addPage(newPage);

            const pdfBytes = await newPdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const imageUrl = 'pdf:' + URL.createObjectURL(blob);
            newImages.push(imageUrl);
          }
        } catch (error) {
          console.error('Error processing PDF:', error);
        }
      } else if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        newImages.push(imageUrl);
      }
    }

    onImagesAdd(newImages);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Очистка Blob URL при размонтировании компонента
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
    <div className="rounded-lg bg-stone-100 p-4 shadow">
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
      <ImageGallery images={images} onDelete={onDelete} />
      <PDFGenerator images={images} />
    </div>
  );
};
