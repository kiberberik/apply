import { create } from 'zustand';
import { Document } from '@prisma/client';

interface DocumentStore {
  documents: Document[];
  document: Document | null;
  isLoading: boolean;
  error: string | null;
  fetchDocument: (id: string) => Promise<void>;
  fetchDocumentsByApplication: (applicationId: string) => Promise<void>;
  createDocument: (documentData: Partial<Document>) => Promise<Document | null>;
  updateDocument: (id: string, documentData: Partial<Document>) => Promise<Document | null>;
  updateDocumentDeliveryStatus: (id: string, isDelivered: boolean) => Promise<Document | null>;
  deleteDocument: (id: string) => Promise<boolean>;
  resetDocument: () => void;
  resetDocuments: () => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
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
      return data;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
      return null;
    }
  },

  fetchDocumentsByApplication: async (applicationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/documents?applicationId=${applicationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      set({ documents: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
      return [];
    }
  },

  createDocument: async (documentData: Partial<Document>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const newDocument = await response.json();
      set((state) => ({
        documents: [...state.documents, newDocument],
        isLoading: false,
      }));

      return newDocument;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
      return null;
    }
  },

  updateDocument: async (id: string, documentData: Partial<Document>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        throw new Error('Failed to update document');
      }

      const updatedDocument = await response.json();
      set((state) => ({
        documents: state.documents.map((doc) => (doc.id === id ? updatedDocument : doc)),
        document: get().document?.id === id ? updatedDocument : get().document,
        isLoading: false,
      }));

      return updatedDocument;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
      return null;
    }
  },

  updateDocumentDeliveryStatus: async (id: string, isDelivered: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/documents/${id}/delivery-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDelivered }),
      });

      if (!response.ok) {
        throw new Error('Failed to update document delivery status');
      }

      const updatedDocument = await response.json();
      set((state) => ({
        documents: state.documents.map((doc) => (doc.id === id ? updatedDocument : doc)),
        document: get().document?.id === id ? updatedDocument : get().document,
        isLoading: false,
      }));

      return updatedDocument;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
      return null;
    }
  },

  deleteDocument: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
        document: get().document?.id === id ? null : get().document,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
      return false;
    }
  },

  resetDocument: () => {
    set({ document: null, error: null });
  },

  resetDocuments: () => {
    set({ documents: [], error: null });
  },
}));
