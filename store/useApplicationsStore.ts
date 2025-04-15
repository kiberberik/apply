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

export const useApplicationsStore = create<ApplicationsState>((set) => ({
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
      const response = await fetch('/api/applications');
      const data = await response.json();
      set({ applications: data });
    } catch (error) {
      console.error('Ошибка при загрузке заявок:', error);
      set({ error: 'Failed to fetch applications' });
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

  deleteApplication: (id) =>
    set((state) => ({
      applications: state.applications.filter((app) => app.id !== id),
      currentApplication: state.currentApplication?.id === id ? null : state.currentApplication,
    })),
}));
