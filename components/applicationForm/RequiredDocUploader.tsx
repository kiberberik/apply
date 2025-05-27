import React, { useState } from 'react';
import { DocumentUpload } from '../docReader/DocumentUpload';
import { CameraCapture } from '../docReader/CameraCapture';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const RequiredDocUploader = () => {
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
        <Button variant="outline">Загрузить документы</Button>
      </DialogTrigger>
      <DialogTitle>Загрузить документы</DialogTitle>
      <DialogContent className="max-w-7xl">
        <div className="mx-auto space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <DocumentUpload
              onImagesAdd={handleImageAdd}
              images={images}
              onDelete={handleImageDelete}
            />
            <div className="hidden md:block">
              <CameraCapture onImagesAdd={handleImageAdd} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequiredDocUploader;
