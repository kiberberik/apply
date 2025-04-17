import { EducationalProgram, EducationalProgramGroup, Language } from '@prisma/client';
import { toast } from 'react-toastify';
import { create } from 'zustand';

type ProgramWithLanguages = EducationalProgram & {
  languages: {
    language: Language;
  }[];
};

interface EducationalStore {
  programs: ProgramWithLanguages[];
  groups: EducationalProgramGroup[];
  fetchPrograms: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  getEducationalProgramDetails: (id: string) => Promise<ProgramWithLanguages | null>;
  addProgram: (
    program: Omit<EducationalProgram, 'id' | 'createdAt' | 'updatedAt'> & {
      languages: string[];
    },
  ) => Promise<void>;
  updateProgram: (
    id: string,
    updates: Partial<EducationalProgram> & { languages?: string[] },
  ) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  addGroup: (
    group: Omit<EducationalProgramGroup, 'id' | 'createdAt' | 'updatedAt' | 'programs'>,
  ) => Promise<void>;
  updateGroup: (id: string, updates: Partial<EducationalProgramGroup>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
}

export const useEducationalStore = create<EducationalStore>((set) => ({
  programs: [],
  groups: [],

  fetchPrograms: async () => {
    try {
      const res = await fetch('/api/educational-programs');
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Ошибка при загрузке программ');
        return;
      }
      const data = await res.json();
      set({ programs: data });
    } catch (error) {
      console.error('Ошибка при загрузке программ:', error);
      toast.error('Ошибка при загрузке программ');
    }
  },

  fetchGroups: async () => {
    try {
      const res = await fetch('/api/educational-program-groups');
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Ошибка при загрузке групп');
        return;
      }
      const data = await res.json();
      set({ groups: data });
    } catch (error) {
      console.error('Ошибка при загрузке групп:', error);
      toast.error('Ошибка при загрузке групп');
    }
  },

  getEducationalProgramDetails: async (id: string) => {
    try {
      const res = await fetch(`/api/educational-programs/${id}`);
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Ошибка при получении деталей программы');
        return null;
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Ошибка при получении деталей программы:', error);
      toast.error('Ошибка при получении деталей программы');
      return null;
    }
  },

  addProgram: async (program) => {
    try {
      const res = await fetch('/api/educational-programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(program),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Ошибка при создании программы');
        return;
      }

      const newProgram = await res.json();
      set((state) => ({ programs: [...state.programs, newProgram] }));
      toast.success('Программа успешно создана');
    } catch (error) {
      console.error('Ошибка при создании программы:', error);
      toast.error('Ошибка при создании программы');
    }
  },

  updateProgram: async (id, updates) => {
    try {
      const res = await fetch(`/api/educational-programs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, id }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Ошибка при обновлении программы');
        return;
      }

      const updated = await res.json();
      set((state) => ({
        programs: state.programs.map((p) => (p.id === id ? updated : p)),
      }));
      toast.success('Программа успешно обновлена');
    } catch (error) {
      console.error('Ошибка при обновлении программы:', error);
      toast.error('Ошибка при обновлении программы');
    }
  },

  deleteProgram: async (id) => {
    try {
      const res = await fetch(`/api/educational-programs`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Ошибка при удалении программы');
        return;
      }

      set((state) => ({
        programs: state.programs.filter((p) => p.id !== id),
      }));

      toast.success('Программа успешно удалена');
    } catch (error) {
      console.error('Ошибка при удалении программы:', error);
      toast.error('Ошибка при удалении программы');
    }
  },

  addGroup: async (group) => {
    try {
      const res = await fetch('/api/educational-program-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(group),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Ошибка при создании группы');
        return;
      }

      const newGroup = await res.json();
      set((state) => ({ groups: [...state.groups, newGroup] }));
      toast.success('Группа успешно создана');
    } catch (error) {
      console.error('Ошибка при создании группы:', error);
      toast.error('Ошибка при создании группы');
    }
  },

  updateGroup: async (id, updates) => {
    try {
      const res = await fetch(`/api/educational-program-groups`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, id }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Ошибка при обновлении группы');
        return;
      }

      const updated = await res.json();
      set((state) => ({
        groups: state.groups.map((g) => (g.id === id ? updated : g)),
      }));
      toast.success('Группа успешно обновлена');
    } catch (error) {
      console.error('Ошибка при обновлении группы:', error);
      toast.error('Ошибка при обновлении группы');
    }
  },

  deleteGroup: async (id) => {
    try {
      const res = await fetch(`/api/educational-program-groups`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Ошибка при удалении группы');
        return;
      }

      set((state) => ({
        groups: state.groups.filter((g) => g.id !== id),
      }));

      toast.success('Группа успешно удалена');
    } catch (error) {
      console.error('Ошибка при удалении группы:', error);
      toast.error('Ошибка при удалении группы');
    }
  },
}));
