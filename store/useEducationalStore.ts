import { EducationalProgram, EducationalProgramGroup } from '@prisma/client';
import { toast } from 'react-toastify';
import { create } from 'zustand';

interface EducationalStore {
  programs: EducationalProgram[];
  groups: EducationalProgramGroup[];
  fetchPrograms: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  addProgram: (
    program: Omit<EducationalProgram, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<void>;
  updateProgram: (id: string, updates: Partial<EducationalProgram>) => Promise<void>;
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
      const programs = data.map((program: EducationalProgram) => ({
        ...program,
        languages: program.languages
          ? typeof program.languages === 'string'
            ? JSON.parse(program.languages)
            : program.languages
          : [],
      }));
      set({ programs });
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

  addProgram: async (program) => {
    try {
      const programWithJsonLanguages = {
        ...program,
        languages: JSON.stringify(program.languages),
      };

      const res = await fetch('/api/educational-programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(programWithJsonLanguages),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Ошибка при создании программы');
        return;
      }

      const newProgram = await res.json();
      const processedProgram = {
        ...newProgram,
        languages: newProgram.languages
          ? typeof newProgram.languages === 'string'
            ? JSON.parse(newProgram.languages)
            : newProgram.languages
          : [],
      };

      set((state) => ({ programs: [...state.programs, processedProgram] }));
      toast.success('Программа успешно создана');
    } catch (error) {
      console.error('Ошибка при создании программы:', error);
      toast.error('Ошибка при создании программы');
    }
  },

  updateProgram: async (id, updates) => {
    try {
      const updatesWithJsonLanguages = {
        ...updates,
        id,
        languages: updates.languages ? JSON.stringify(updates.languages) : undefined,
      };

      const res = await fetch(`/api/educational-programs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatesWithJsonLanguages),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Ошибка при обновлении программы');
        return;
      }

      const updated = await res.json();
      const processedUpdated = {
        ...updated,
        languages: updated.languages
          ? typeof updated.languages === 'string'
            ? JSON.parse(updated.languages)
            : updated.languages
          : [],
      };

      set((state) => ({
        programs: state.programs.map((p) => (p.id === id ? processedUpdated : p)),
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

      // Обновляем состояние, удаляя программу из списка
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
    const res = await fetch('/api/educational-program-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(group),
    });
    if (!res.ok) {
      toast.error('Ошибка');
      return;
    }
    toast.success('Успех!');
    const newGroup = await res.json();
    set((state) => ({ groups: [...state.groups, newGroup] }));
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

      // Обновляем состояние, удаляя группу из списка
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
