import { create } from 'zustand';
import { Document } from '@prisma/client';

interface DocumentStore {
  document: Document | null;
  isLoading: boolean;
  error: string | null;
  fetchDocument: (id: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  document: null,
  isLoading: false,
  error: null,
  fetchDocument: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/documents/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }
      const data = await response.json();
      set({ document: data, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },
}));
