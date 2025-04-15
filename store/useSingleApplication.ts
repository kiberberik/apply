import { create } from 'zustand';
import {
  Application,
  Applicant,
  Representative,
  Details,
  ApplicationStatus,
  Log,
} from '@prisma/client';
import { useApplicationsStore } from './useApplicationsStore';

interface ExtendedApplication extends Application {
  applicant: Applicant | null;
  representative: Representative | null;
  details: Details | null;
  status: ApplicationStatus | null;
  Log: Log[];
}

interface SingleApplicationState {
  application: ExtendedApplication | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchApplication: (id: string) => Promise<void>;
  updateApplication: (
    id: string,
    application: Partial<ExtendedApplication>,
  ) => Promise<{ error?: string }>;
  clearApplication: () => void;
}

export const useSingleApplication = create<SingleApplicationState>((set) => ({
  application: null,
  isLoading: false,
  error: null,

  fetchApplication: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/applications/${id}`);
      if (!response.ok) {
        throw new Error('Заявка не найдена');
      }
      const data = await response.json();

      // Обновляем локальный стейт
      set({ application: data });

      // Обновляем общий стейт заявок
      const applicationsStore = useApplicationsStore.getState();
      applicationsStore.updateApplication(id, data);
    } catch (error) {
      console.error('Ошибка при загрузке заявки:', error);
      set({ error: 'Failed to fetch application' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateApplication: async (id: string, application: Partial<ExtendedApplication>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(application),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обновлении заявки');
      }

      const updatedData = await response.json();

      // Обновляем локальный стейт
      set({ application: updatedData });

      // Обновляем общий стейт заявок
      const applicationsStore = useApplicationsStore.getState();
      applicationsStore.updateApplication(id, updatedData);

      return {};
    } catch (error) {
      console.error('Ошибка при обновлении заявки:', error);
      set({ error: 'Failed to update application' });
      return { error: error instanceof Error ? error.message : 'Ошибка при обновлении заявки' };
    } finally {
      set({ isLoading: false });
    }
  },

  clearApplication: () => {
    set({ application: null, error: null });
  },
}));
