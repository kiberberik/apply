import { create } from 'zustand';
import { Application, Applicant, Details, Log, User } from '@prisma/client';
import { useAuthStore } from './useAuthStore';

interface ExtendedApplication extends Application {
  applicant: Applicant | null;
  details: Details | null;
  Log?: Log[];
  consultant?: User | null;
}

interface ApplicationsState {
  applications: ExtendedApplication[];
  userApplications: ExtendedApplication[]; // Заявки текущего пользователя
  currentApplication: ExtendedApplication | null;
  isLoading: boolean;
  isLoadingUserApps: boolean; // Состояние загрузки заявок пользователя
  error: string | null;
  userAppsError: string | null; // Ошибки при работе с заявками пользователя

  // Actions для всех заявок
  fetchApplications: () => Promise<void>;
  createApplication: (application: ExtendedApplication) => void;
  createNewApplication: () => Promise<ExtendedApplication | null>;
  updateApplication: (id: string, application: Partial<ExtendedApplication>) => void;
  deleteApplication: (id: string) => void;
  setCurrentApplication: (application: ExtendedApplication | null) => void;

  // Actions для заявок пользователя
  fetchUserApplications: () => Promise<void>; // Загрузка заявок пользователя
  fetchDetailedUserApplications: () => Promise<void>; // Загрузка деталей заявок пользователя

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
  userApplications: [], // Инициализация пустым массивом
  currentApplication: null,
  isLoading: false,
  isLoadingUserApps: false, // Начальное состояние загрузки
  error: null,
  userAppsError: null, // Начальное состояние ошибок
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

  // Загрузка заявок текущего пользователя из API /api/me
  fetchUserApplications: async () => {
    set({ isLoadingUserApps: true, userAppsError: null });
    try {
      console.log('Fetching user applications...');
      const response = await fetch('/api/me');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось загрузить заявки пользователя');
      }

      const userData = await response.json();

      if (!userData.createdApplications) {
        console.log('User has no applications');
        set({ userApplications: [], userAppsError: null });
        return;
      }

      // Фильтрация: только не удаленные заявки
      const userApps = userData.createdApplications.filter(
        (app: ExtendedApplication) => app.isDeleted !== true,
      );

      console.log(`User has ${userApps.length} active applications`);
      set({ userApplications: userApps, userAppsError: null });
    } catch (error) {
      console.error('Error fetching user applications:', error);
      set({
        userAppsError: error instanceof Error ? error.message : 'Ошибка загрузки заявок',
        userApplications: [],
      });
    } finally {
      set({ isLoadingUserApps: false });
    }
  },

  // Загрузка детальной информации о заявках пользователя
  fetchDetailedUserApplications: async () => {
    const { userApplications } = get();

    if (!userApplications.length) {
      await get().fetchUserApplications();
    }

    const apps = get().userApplications;
    if (!apps.length) return;

    set({ isLoadingUserApps: true, userAppsError: null });

    try {
      console.log('Fetching detailed information for user applications...');

      // Получаем детальные данные для каждой заявки пользователя
      const applicationPromises = apps.map(async (app) => {
        try {
          const response = await fetch(`/api/applications/${app.id}?noCache=${Date.now()}`);
          if (!response.ok) {
            console.error(`Ошибка при загрузке заявки ${app.id}: ${response.status}`);
            return app;
          }
          return await response.json();
        } catch (error) {
          console.error(`Ошибка при загрузке заявки ${app.id}:`, error);
          return app;
        }
      });

      const detailedApps = await Promise.all(applicationPromises);
      console.log(`Loaded detailed data for ${detailedApps.length} applications`);

      set({ userApplications: detailedApps, userAppsError: null });
    } catch (error) {
      console.error('Error loading detailed application data:', error);
      set({
        userAppsError:
          error instanceof Error ? error.message : 'Ошибка при загрузке детальных данных заявок',
      });
    } finally {
      set({ isLoadingUserApps: false });
    }
  },

  createNewApplication: async () => {
    set({ isLoading: true, error: null });
    try {
      // Получаем id текущего пользователя из AuthStore
      const authStore = useAuthStore.getState();
      const userId = authStore.user?.id;

      if (!userId) {
        throw new Error('Пользователь не авторизован');
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ createdById: userId }), // Используем правильное поле createdById
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при создании заявки');
      }

      const newApplication = await response.json();
      console.log('Создана новая заявка:', newApplication);

      // Добавляем созданную заявку в состояние общих заявок
      get().createApplication(newApplication);

      // Добавляем также в заявки пользователя
      set((state) => ({
        userApplications: [...state.userApplications, newApplication],
      }));

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
      userApplications: state.userApplications.map((app) =>
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
        userApplications: state.userApplications.map((app) =>
          app.id === id ? { ...app, isDeleted: true } : app,
        ),
        currentApplication:
          state.currentApplication?.id === id
            ? { ...state.currentApplication, isDeleted: true }
            : state.currentApplication,
      }));

      // Обновляем список заявок
      await get().fetchApplications();
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
