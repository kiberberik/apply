import { create } from 'zustand';
import { User } from '@prisma/client';
import { useAuthStore } from './useAuthStore';

interface UsersState {
  users: User[];
  selectedUser: User | null;
  setUsers: () => Promise<void>;
  selectUser: (id: string) => void;
  updateUser: (
    id: string,
    data: Partial<Pick<User, 'email' | 'role' | 'name' | 'managerId'>>,
  ) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  selectedUser: null,

  setUsers: async () => {
    const res = await fetch('/api/users');
    const users = await res.json();
    set({ users });
  },

  selectUser: (id) =>
    set((state) => ({
      selectedUser: state.users.find((user) => user.id === id) || null,
    })),

  updateUser: async (id, data) => {
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });

    if (!res.ok) throw new Error('Failed to update user');

    await res.json();

    set((state) => {
      const newUsers = state.users.map((user) => (user.id === id ? { ...user, ...data } : user));
      const newSelectedUser =
        state.selectedUser?.id === id ? { ...state.selectedUser, ...data } : state.selectedUser;

      // Sync with useAuthStore if the updated user is the current authenticated user
      const authState = useAuthStore.getState();
      if (authState.user?.id === id) {
        authState.setUser({ ...authState.user, ...data });
      }

      return {
        users: newUsers,
        selectedUser: newSelectedUser,
      };
    });
  },
}));
