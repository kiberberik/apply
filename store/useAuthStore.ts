'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Application } from '@prisma/client';
import { toast } from 'react-toastify';

interface AuthState {
  user:
    | (User & {
        createdApplications?: Application[];
        consultedApplications?: Application[];
        consultants?: User[];
        manager?: User;
      })
    | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  errorMessage?: string;
  emailVerificationError: string | null;
  setUser: (user: User | null) => void;
  updateUser: (updatedUser: Partial<User>) => void;
  fetchUser: () => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  resendVerificationEmail: (email: string, locale: string) => Promise<void>;
  verifyEmail: (token: string, locale: string) => Promise<void>; // Убираем email из аргументов
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isEmailVerified: false,
      emailVerificationError: null,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user, isEmailVerified: !!user?.emailVerified });
      },

      updateUser: async (updatedUser) => {
        try {
          if (!useAuthStore.getState().user) {
            throw new Error('User is not authenticated');
          }

          const response = await fetch('/api/me', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser),
            credentials: 'same-origin',
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update user: ${errorText}`);
          }

          const newUser = await response.json();
          set((state) => ({
            user: { ...state.user!, ...newUser },
          }));
        } catch (error) {
          console.error('Error updating user:', error);
          throw error;
        }
      },

      fetchUser: async () => {
        try {
          const response = await fetch('/api/me', { credentials: 'include' });
          if (!response.ok) throw new Error('Failed to fetch user');

          const fetchedUser = await response.json();
          console.log('Fetched user data in store:', fetchedUser);

          set({
            user: {
              ...fetchedUser,
              createdApplications: fetchedUser.createdApplications || [],
              consultedApplications: fetchedUser.consultedApplications || [],
            },
            isAuthenticated: true,
            isEmailVerified: !!fetchedUser.emailVerified,
          });
        } catch (error) {
          console.error('Error fetching user:', error);
          set({ user: null, isAuthenticated: false, isEmailVerified: false });
        }
      },

      login: async (credentials) => {
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
            credentials: 'include',
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Login failed: ${errorText}`);
          }

          const user = await response.json();
          set({
            user,
            isAuthenticated: true,
            isEmailVerified: !!user.emailVerified,
          });
        } catch (error) {
          throw error;
        }
      },

      logout: async () => {
        try {
          await fetch('/api/logout', { method: 'POST', credentials: 'include' });
          set({ user: null, isAuthenticated: false, isEmailVerified: false });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      resendVerificationEmail: async (email, locale) => {
        try {
          const res = await fetch('/api/verification-email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, locale }),
          });

          if (!res.ok) {
            throw new Error('Failed to send verification email');
          }

          const data = await res.json();
          set({ emailVerificationError: null });
          toast.success(data.message);
        } catch (error) {
          console.error('Error sending verification email:', error);
          set({ emailVerificationError: error instanceof Error ? error.message : 'Unknown error' });
        }
      },

      verifyEmail: async (token, locale) => {
        try {
          const res = await fetch('/api/verification-email/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, locale }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Ошибка при подтверждении email');
          }

          const data = await res.json();

          if (data.message === 'Email already verified') {
            console.log('Email уже подтвержден');
            set((state) => ({
              isEmailVerified: true,
              user: state.user ? { ...state.user, emailVerified: new Date() } : data.user,
              isAuthenticated: true,
            }));
          } else if (data.message === 'Email verified') {
            console.log('Email успешно подтвержден');
            set({
              isEmailVerified: true,
              user: data.user,
              isAuthenticated: true,
            });
          } else {
            console.error('Неизвестное сообщение от сервера', data);
          }
        } catch (error: unknown) {
          console.error('Ошибка при подтверждении email:', error);
          set({
            errorMessage: error instanceof Error ? error.message : 'Неизвестная ошибка',
          });
          throw error; // Передаем ошибку в компонент
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        user: state.isAuthenticated ? state.user : null,
        isAuthenticated: state.isAuthenticated,
        isEmailVerified: state.isEmailVerified,
      }),
    },
  ),
);
