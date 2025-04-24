import { create } from 'zustand';
import { Log, ApplicationStatus } from '@prisma/client';

// Расширенный интерфейс лога с дополнительной информацией о создателе
export interface ExtendedLog extends Log {
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

// Интерфейс для запроса создания нового лога
interface CreateLogRequest {
  applicationId: string;
  statusId?: ApplicationStatus | null;
  description?: string | null;
  createdById?: string | null;
}

interface LogStore {
  logs: Record<string, ExtendedLog[]>; // Хранилище логов по applicationId
  latestLogs: Record<string, ExtendedLog>; // Хранилище последних логов по applicationId
  isLoading: boolean;
  error: string | null;

  // Действия
  fetchLogsByApplicationId: (applicationId: string) => Promise<void>;
  fetchLatestLogByApplicationId: (applicationId: string) => Promise<ExtendedLog | null>;
  createLog: (data: CreateLogRequest) => Promise<ExtendedLog | null>;
  addLog: (log: ExtendedLog) => void;
  getLatestLogByApplicationId: (applicationId: string) => ExtendedLog | null;
  clearLogs: (applicationId?: string) => void;
}

export const useLogStore = create<LogStore>((set, get) => ({
  logs: {},
  latestLogs: {},
  isLoading: false,
  error: null,

  // Получение логов по ID заявки
  fetchLogsByApplicationId: async (applicationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/applications/${applicationId}/logs?noCache=${Date.now()}`);

      if (!response.ok) {
        throw new Error('Логи не найдены');
      }

      const data = await response.json();

      // Обновляем логи для указанной заявки
      set((state) => ({
        logs: {
          ...state.logs,
          [applicationId]: data,
        },
      }));
    } catch (error) {
      console.error('Ошибка при загрузке логов:', error);
      set({ error: 'Не удалось загрузить логи' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Получение последнего лога по ID заявки через API
  fetchLatestLogByApplicationId: async (applicationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `/api/applications/${applicationId}/logs/latest?noCache=${Date.now()}`,
      );

      if (!response.ok) {
        throw new Error('Лог не найден');
      }

      const data = await response.json();

      // Обновляем последний лог для указанной заявки
      set((state) => ({
        latestLogs: {
          ...state.latestLogs,
          [applicationId]: data,
        },
      }));

      return data;
    } catch (error) {
      console.error('Ошибка при загрузке последнего лога:', error);
      set({ error: 'Не удалось загрузить последний лог' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Создание нового лога через API
  createLog: async (data: CreateLogRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/applications/${data.applicationId}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при создании лога');
      }

      const newLog = await response.json();

      // Добавляем новый лог в стор
      get().addLog(newLog);

      // Обновляем последний лог
      set((state) => ({
        latestLogs: {
          ...state.latestLogs,
          [data.applicationId]: newLog,
        },
      }));

      return newLog;
    } catch (error) {
      console.error('Ошибка при создании лога:', error);
      set({ error: 'Не удалось создать лог' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Добавление нового лога
  addLog: (log: ExtendedLog) => {
    if (!log.applicationId) return;

    set((state) => {
      const applicationLogs = state.logs[log.applicationId || ''] || [];

      return {
        logs: {
          ...state.logs,
          [log.applicationId as string]: [...applicationLogs, log],
        },
      };
    });
  },

  // Получение последнего лога для заявки из локального стора
  getLatestLogByApplicationId: (applicationId: string) => {
    // Сначала проверяем, есть ли последний лог в latestLogs
    const state = get();
    if (state.latestLogs[applicationId]) {
      return state.latestLogs[applicationId];
    }

    // Если нет, ищем в массиве логов
    const logs = state.logs[applicationId] || [];

    if (logs.length === 0) return null;

    // Сортируем логи по дате создания (от новых к старым)
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return sortedLogs[0] || null;
  },

  // Очистка логов
  clearLogs: (applicationId?: string) => {
    if (applicationId) {
      // Очищаем логи только для указанной заявки
      set((state) => {
        const newLogs = { ...state.logs };
        const newLatestLogs = { ...state.latestLogs };
        delete newLogs[applicationId];
        delete newLatestLogs[applicationId];
        return { logs: newLogs, latestLogs: newLatestLogs };
      });
    } else {
      // Очищаем все логи
      set({ logs: {}, latestLogs: {} });
    }
  },
}));
