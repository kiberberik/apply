import { create } from 'zustand';
import { RequiredDocument, Country, AcademicLevel, StudyType, AgeCategory } from '@prisma/client';

export interface ExtendedRequiredDocument
  extends Omit<RequiredDocument, 'countries' | 'academicLevels' | 'studyTypes' | 'ageCategories'> {
  countries: Country[];
  academicLevels: AcademicLevel[];
  studyTypes: StudyType[];
  ageCategories: AgeCategory[];
}

interface RequiredDocumentStore {
  documents: ExtendedRequiredDocument[];
  loading: boolean;
  error: string | null;
  fetchDocuments: () => Promise<void>;
  addDocument: (
    document: Omit<ExtendedRequiredDocument, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<void>;
  updateDocument: (id: string, document: Partial<ExtendedRequiredDocument>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useRequiredDocuments = create<RequiredDocumentStore>((set) => ({
  documents: [],
  loading: false,
  error: null,

  fetchDocuments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/required-documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      set({ documents: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  addDocument: async (document) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/required-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(document),
      });
      if (!response.ok) throw new Error('Failed to add document');
      const newDocument = await response.json();
      set((state) => ({ documents: [...state.documents, newDocument], loading: false }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  updateDocument: async (id, document) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/required-documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(document),
      });
      if (!response.ok) throw new Error('Failed to update document');
      const updatedDocument = await response.json();
      set((state) => ({
        documents: state.documents.map((doc) => (doc.id === id ? updatedDocument : doc)),
        loading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  deleteDocument: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/required-documents/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete document');
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
}));
