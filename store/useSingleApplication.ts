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
import { useApplicationStore } from './useApplicationStore';

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
    phone?: string | null;
    addressResidential?: string | null;
    addressRegistration?: string | null;
    isCitizenshipKz?: boolean | null;
    citizenship?: string | null;
    documentType?: IdentificationDocumentType | null;
    identificationNumber?: string | null;
    // Поля документа удостоверения личности
    documentNumber?: string | null;
    documentIssueDate?: string | null;
    documentExpiryDate?: string | null;
    documentIssuingAuthority?: string | null;
    documentFileLinks?: string | null; // JSON строка массива ссылок
    // Поля документа представителя
    representativeDocumentNumber?: string | null;
    representativeDocumentIssueDate?: string | null;
    representativeDocumentExpiryDate?: string | null;
    representativeDocumentIssuingAuthority?: string | null;
    representativeDocumentFileLinks?: string | null; // JSON строка массива ссылок
    relationshipDegree?: RelationshipDegree | null;
    applicantId?: string | null;
  } | null;
  details?: {
    id?: string;
    type?: string | null;
    academicLevel?: string | null;
    studyingLanguage?: string | null;
    educationalProgramId?: string | null;
  } | null;
  contractLanguage?: string | null;
  // Документы загружаются через отдельный API-маршрут
  statusId?: string;
  submittedAt?: string | null;
}

interface ExtendedLog extends Log {
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  status: ApplicationStatus | null;
}

interface ExtendedApplication extends Application {
  applicant: Applicant | null;
  representative: Representative | null;
  details:
    | (Details & {
        educationalProgram: EducationalProgram | null;
      })
    | null;
  status: ApplicationStatus | null;
  Log: ExtendedLog[];
  documents: Document[];
  createdBy: User | null;
}

interface SingleApplicationState {
  application: ExtendedApplication | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchApplication: (id: string) => Promise<void>;
  updateApplication: (
    id: string,
    application: UpdateApplicationRequest,
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
      // console.log('Fetching application from API with ID:', id);
      // Добавляю параметр noCache для обхода кэша браузера
      const response = await fetch(`/api/applications/${id}?noCache=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Заявка не найдена');
      }
      const data = await response.json();
      // console.log('Received fresh application data:', data);

      // Обновляем локальный стейт
      set({ application: data });

      // Обновляем общий стейт заявок
      const applicationsStore = useApplicationStore.getState();
      applicationsStore.updateApplication(id, data);
    } catch (error) {
      console.error('Ошибка при загрузке заявки:', error);
      set({ error: 'Failed to fetch application' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateApplication: async (id: string, application: UpdateApplicationRequest) => {
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
      const applicationsStore = useApplicationStore.getState();
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
