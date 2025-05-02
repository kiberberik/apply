'use client';

import { pdf, DocumentProps } from '@react-pdf/renderer';
import { useEffect, useState, ReactElement } from 'react';

interface PDFViewerProps {
  children: ReactElement<DocumentProps>;
}

const PDFViewer = ({ children }: PDFViewerProps) => {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const generatePDF = async () => {
      try {
        const blob = await pdf(children).toBlob();
        const url = URL.createObjectURL(blob);
        setUrl(url);
      } catch (error) {
        console.error('Ошибка при генерации PDF:', error);
      }
    };

    generatePDF();

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [children, url]);

  if (!url) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-gray-500">Загрузка PDF...</div>
      </div>
    );
  }

  return <iframe src={url} className="h-screen w-full border-0" title="PDF Viewer" />;
};

export default PDFViewer;
