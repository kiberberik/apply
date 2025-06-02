import { create } from 'zustand';
import {
  Application,
  Applicant,
  Representative,
  Details,
  ApplicationStatus,
  Log,
  Document,
  EducationalProgram,
  User,
  IdentificationDocumentType,
  RelationshipDegree,
} from '@prisma/client';
import { useAuthStore } from './useAuthStore';

// Тип для запроса обновления заявки
export interface UpdateApplicationRequest {
  applicant?: {
    id?: string;
    email?: string | null;
    givennames?: string | null;
    patronymic?: string | null;
    surname?: string | null;
    birthDate?: string | null;
    birthPlace?: string | null;
    isCitizenshipKz?: boolean | null;
    citizenship?: string | null;
    documentType?: IdentificationDocumentType | null;
    identificationNumber?: string | null;
    // Поля документа
    documentNumber?: string | null;
    documentIssueDate?: string | null;
    documentExpiryDate?: string | null;
    documentIssuingAuthority?: string | null;
    documentFileLinks?: string | null; // JSON строка массива ссылок
    gender?: string | null;
    maritalStatus?: string | null;
    phone?: string | null;
    addressResidential?: string | null;
    addressRegistration?: string | null;
  } | null;
  representative?: {
    id?: string;
    email?: string | null;
    givennames?: string | null;
    patronymic?: string | null;
    surname?: string | null;
    citizenship?: string | null;
    documentType?: IdentificationDocumentType | null;
    identificationNumber?: string | null;
    documentNumber?: string | null;
    documentIssueDate?: string | null;
    documentExpiryDate?: string | null;
    documentIssuingAuthority?: string | null;
    documentFileLinks?: string | null;
    representativeDocumentNumber?: string | null;
    representativeDocumentIssueDate?: string | null;
    representativeDocumentExpiryDate?: string | null;
    representativeDocumentIssuingAuthority?: string | null;
    representativeDocumentFileLinks?: string | null;
    relationshipDegree?: RelationshipDegree | null;
    phone?: string | null;
    addressResidential?: string | null;
    addressRegistration?: string | null;
    applicantId?: string | null;
  } | null;
  details?: {
    id?: string;
    type?: string | null;
    academicLevel?: string | null;
    studyingLanguage?: string | null;
    educationalProgramId?: string | null;
  } | null;
  documentDetails?: {
    [key: string]: {
      diplomaSerialNumber?: string;
      number?: string;
      issueDate?: string;
      expirationDate?: string;
      issuingAuthority?: string;
    };
  } | null;
  contractLanguage?: string | null;
  contractNumber?: string | null;
  // Документы загружаются через отдельный API-маршрут
  statusId?: string;
  submittedAt?: string | null;
  consultantId?: string | null;
  trustMeId?: string | null;
  trustMeUrl?: string | null;
  trustMeFileName?: string | null;
  contractSignType?: 'TRUSTME' | 'OFFLINE' | 'NOT_SIGNED';
}

interface ExtendedLog extends Log {
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  status: ApplicationStatus | null;
}

export interface ExtendedApplication extends Application {
  applicant: Applicant | null;
  representative: Representative | null;
  details:
    | (Details & {
        educationalProgram: EducationalProgram | null;
      })
    | null;
  status: ApplicationStatus | null;
  Log?: ExtendedLog[];
  documents?: Document[];
  createdBy: User | null;
  consultant?: User | null;
  sequenceNumber?: number;
}

interface ApplicationsState {
  applications: ExtendedApplication[];
  userApplications: ExtendedApplication[]; // Заявки текущего пользователя
  currentApplication: ExtendedApplication | null;
  singleApplication: ExtendedApplication | null; // Для отдельной заявки
  isLoading: boolean;
  isLoadingUserApps: boolean; // Состояние загрузки заявок пользователя
  isLoadingSingleApp: boolean; // Состояние загрузки отдельной заявки
  error: string | null;
  userAppsError: string | null; // Ошибки при работе с заявками пользователя
  singleAppError: string | null; // Ошибки при работе с отдельной заявкой

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

  // Actions для отдельной заявки
  fetchSingleApplication: (id: string) => Promise<void>;
  updateSingleApplication: (
    id: string,
    application: UpdateApplicationRequest,
  ) => Promise<{ error?: string }>;
  clearSingleApplication: () => void;

  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'createdAt' | 'updatedAt';
  setSortBy: (sort: 'createdAt' | 'updatedAt') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
}

export const useApplicationStore = create<ApplicationsState>((set, get) => ({
  applications: [],
  userApplications: [], // Инициализация пустым массивом
  currentApplication: null,
  singleApplication: null, // Инициализация для отдельной заявки
  isLoading: false,
  isLoadingUserApps: false, // Начальное состояние загрузки
  isLoadingSingleApp: false, // Начальное состояние загрузки отдельной заявки
  error: null,
  userAppsError: null, // Начальное состояние ошибок
  singleAppError: null, // Начальное состояние ошибок отдельной заявки
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
      const filteredData = data
        .filter((app: ExtendedApplication) => app.isDeleted !== true)
        .map((app: ExtendedApplication, index: number) => ({
          ...app,
          sequenceNumber: index + 1,
        }));

      // console.log(
      //   `Received ${data.length} applications, filtered to ${filteredData.length} non-deleted applications`,
      // );
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
      // Получаем id текущего пользователя из AuthStore и проверяем авторизацию
      const authStore = useAuthStore.getState();

      // Проверяем сначала, что пользователь авторизован
      if (!authStore.isAuthenticated) {
        // Попытаемся запросить обновление данных пользователя с сервера
        await authStore.fetchUser();

        // Проверяем ещё раз после обновления
        if (!authStore.isAuthenticated) {
          throw new Error('Пользователь не авторизован. Пожалуйста, войдите в систему.');
        }
      }

      const userId = authStore.user?.id;
      if (!userId) {
        throw new Error('Не удалось получить ID пользователя');
      }

      console.log('Создание заявки для пользователя с ID:', userId);

      // Создаем заявку
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          createdById: userId,
          consultantId: authStore.user?.role === 'CONSULTANT' ? userId : null,
        }),
        credentials: 'include', // Важно для передачи cookie сессии
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Ошибка при создании заявки';
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) errorMessage = errorData.error;
          if (errorData.details) errorMessage += `: ${errorData.details}`;
        } catch {
          // Если не удалось распарсить JSON, используем текст ошибки или стандартное сообщение
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
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
      singleApplication:
        state.singleApplication?.id === id
          ? { ...state.singleApplication, ...application }
          : state.singleApplication,
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

  // Методы для работы с отдельной заявкой
  fetchSingleApplication: async (id: string) => {
    set({ isLoadingSingleApp: true, singleAppError: null });
    try {
      // Добавляю параметр noCache для обхода кэша браузера
      const response = await fetch(`/api/applications/${id}?noCache=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Заявка не найдена');
      }
      const data = await response.json();

      // Обновляем локальный стейт для singleApplication
      set({ singleApplication: data });

      // Обновляем общий стейт заявок
      get().updateApplication(id, data);
    } catch (error) {
      console.error('Ошибка при загрузке заявки:', error);
      set({ singleAppError: 'Failed to fetch application' });
    } finally {
      set({ isLoadingSingleApp: false });
    }
  },

  updateSingleApplication: async (id: string, application: UpdateApplicationRequest) => {
    set({ isLoadingSingleApp: true, singleAppError: null });
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

      // Обновляем локальный стейт для singleApplication
      set({ singleApplication: updatedData });

      // Обновляем общий стейт заявок
      get().updateApplication(id, updatedData);

      return {};
    } catch (error) {
      console.error('Ошибка при обновлении заявки:', error);
      set({ singleAppError: 'Failed to update application' });
      return { error: error instanceof Error ? error.message : 'Ошибка при обновлении заявки' };
    } finally {
      set({ isLoadingSingleApp: false });
    }
  },

  clearSingleApplication: () => {
    set({ singleApplication: null, singleAppError: null });
  },
}));
