import React, { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface FormValues {
  documents: {
    [key: string]: string;
  };
  documentDetails: {
    [key: string]: {
      diplomaSerialNumber?: string;
      number?: string;
      issueDate?: string;
      expirationDate?: string;
      issuingAuthority?: string;
    };
  };
  applicant: {
    isCitizenshipKz: boolean;
    birthDate: string;
  };
  details: {
    academicLevel: string;
    type: string;
  };
}

interface PDFContextType {
  application?: {
    id: string;
    applicant?: {
      id: string;
    };
  };
  doc: {
    code: string;
  };
  form: UseFormReturn<FormValues>;
  field: {
    onChange: (value: string) => void;
  };
  setDocumentsLoaded: (value: boolean) => void;
  fetchDocumentsByApplication: (id: string) => void;
}

const PDFContext = createContext<PDFContextType | undefined>(undefined);

export const PDFProvider: React.FC<{
  children: React.ReactNode;
  value: PDFContextType;
}> = ({ children, value }) => {
  return <PDFContext.Provider value={value}>{children}</PDFContext.Provider>;
};

export const usePDF = () => {
  const context = useContext(PDFContext);
  if (context === undefined) {
    throw new Error('usePDF must be used within a PDFProvider');
  }
  return context;
};
