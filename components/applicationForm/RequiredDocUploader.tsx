'use client';
import React, { useState } from 'react';
import { DocumentUpload } from '../docReader/DocumentUpload';
import { CameraCapture } from '../docReader/CameraCapture';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

const RequiredDocUploader = ({ documentCode }: { documentCode: string }) => {
  const c = useTranslations('Common');
  const [images, setImages] = useState<string[]>([]);
  const handleImageAdd = (newImages: string[]) => {
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleImageDelete = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{c('uploadDocuments')}</Button>
      </DialogTrigger>
      <DialogTitle></DialogTitle>
      <DialogContent className="max-w-7xl">
        <div className="mx-auto w-full space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <DocumentUpload
              onImagesAdd={handleImageAdd}
              images={images}
              onDelete={handleImageDelete}
              documentCode={documentCode}
            />
            <div className="hidden md:block">
              <CameraCapture onImagesAdd={handleImageAdd} images={images} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequiredDocUploader;
