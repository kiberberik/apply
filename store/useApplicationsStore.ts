import { create } from 'zustand';
import { Application, Applicant, Details, Log } from '@prisma/client';

interface ExtendedApplication extends Application {
  applicant: Applicant | null;
  details: Details | null;
  Log?: Log[];
}

interface ApplicationsState {
  applications: ExtendedApplication[];
  currentApplication: ExtendedApplication | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchApplications: () => Promise<void>;
  createApplication: (application: ExtendedApplication) => void;
  createNewApplication: () => Promise<ExtendedApplication | null>;
  updateApplication: (id: string, application: Partial<ExtendedApplication>) => void;
  deleteApplication: (id: string) => void;
  setCurrentApplication: (application: ExtendedApplication | null) => void;

  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'createdAt' | 'updatedAt';
  setSortBy: (sort: 'createdAt' | 'updatedAt') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
}

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  applications: [],
  currentApplication: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  sortBy: 'createdAt',
  sortDirection: 'desc',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSortDirection: (direction) => set({ sortDirection: direction }),
  setCurrentApplication: (application) => set({ currentApplication: application }),

  fetchApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching applications from store...');
      const response = await fetch('/api/applications');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch applications');
      }

      const data = await response.json();
      // Фильтрация: отображаем только заявки, где isDeleted не равно true
      const filteredData = data.filter((app: ExtendedApplication) => app.isDeleted !== true);
      console.log(
        `Received ${data.length} applications, filtered to ${filteredData.length} non-deleted applications`,
      );
      set({ applications: filteredData, error: null });
    } catch (error) {
      console.error('Error in fetchApplications:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch applications',
        applications: [],
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createNewApplication: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Пустое тело запроса для создания заявки со значениями по умолчанию
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при создании заявки');
      }

      const newApplication = await response.json();
      console.log('Создана новая заявка:', newApplication);

      // Добавляем созданную заявку в состояние
      get().createApplication(newApplication);

      return newApplication;
    } catch (error) {
      console.error('Error in createNewApplication:', error);
      set({
        error: error instanceof Error ? error.message : 'Ошибка при создании заявки',
      });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  createApplication: (application) =>
    set((state) => ({
      applications: [...state.applications, application],
      currentApplication: application,
    })),

  updateApplication: (id, application) =>
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, ...application } : app,
      ),
      currentApplication:
        state.currentApplication?.id === id
          ? { ...state.currentApplication, ...application }
          : state.currentApplication,
    })),

  deleteApplication: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении заявки');
      }

      // Обновляем состояние: устанавливаем isDeleted = true вместо удаления
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === id ? { ...app, isDeleted: true } : app,
        ),
        currentApplication:
          state.currentApplication?.id === id
            ? { ...state.currentApplication, isDeleted: true }
            : state.currentApplication,
      }));
    } catch (error) {
      console.error('Error in deleteApplication:', error);
      set({
        error: error instanceof Error ? error.message : 'Ошибка при удалении заявки',
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
