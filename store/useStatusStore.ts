import { create } from 'zustand';

interface Status {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface StatusState {
  status: Status | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStatus: (id: string) => Promise<void>;
  createStatus: (status: Omit<Status, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  clearStatus: () => void;
}

export const useStatusStore = create<StatusState>((set) => ({
  status: null,
  isLoading: false,
  error: null,

  fetchStatus: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/statuses/${id}`);
      if (!response.ok) {
        throw new Error('Статус не найден');
      }
      const data = await response.json();
      set({ status: data });
    } catch (error) {
      console.error('Ошибка при загрузке статуса:', error);
      set({ error: error instanceof Error ? error.message : 'Ошибка при загрузке статуса' });
    } finally {
      set({ isLoading: false });
    }
  },

  createStatus: async (statusData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/statuses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при создании статуса');
      }

      const newStatus = await response.json();
      set({ status: newStatus });
    } catch (error) {
      console.error('Ошибка при создании статуса:', error);
      set({ error: error instanceof Error ? error.message : 'Ошибка при создании статуса' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearStatus: () => {
    set({ status: null, error: null });
  },
}));
