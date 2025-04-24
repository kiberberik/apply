'use client';

import { Dialog, DialogTitle } from '@headlessui/react';
import { Role, User } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Bounce, toast } from 'react-toastify';
import { useUsersStore } from '@/store/useUsersStore';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  // updateUser: (
  //   id: string,
  //   updatedData: Partial<Pick<User, 'email' | 'role' | 'name' | 'managerId'>>,
  // ) => Promise<void>;
}

export default function EditUserModal({ user, onClose }: EditUserModalProps) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [role, setRole] = useState<Role>(user.role);
  const [error, setError] = useState<string>('');
  const { user: currentUser } = useAuthStore();
  const [managerId, setManagerId] = useState(user?.managerId || '');
  const [managers, setManagers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const { updateUser } = useUsersStore();

  useEffect(() => {
    // Загрузка списка менеджеров
    const fetchManagers = async () => {
      const response = await fetch('/api/users?role=MANAGER');
      const data = await response.json();
      setManagers(data);
    };

    if (currentUser?.role === 'ADMIN') {
      fetchManagers();
    }
  }, [currentUser]);

  const t = useTranslations('Users');
  const c = useTranslations('Common');
  const rT = useTranslations('Roles');

  const roles = Object.values(Role);

  const handleSave = useCallback(async () => {
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim();

    if (!trimmedEmail?.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      setError('Неверный формат email');
      return;
    }

    try {
      await updateUser(user.id, {
        name: trimmedName,
        email: trimmedEmail,
        role,
        managerId,
      });
      toast.success(c('successUpdate'), {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
        transition: Bounce,
      });
      onClose();
    } catch (err) {
      console.log(err);
      setError('Ошибка при сохранении');
      toast.error(err instanceof Error ? err.message : c('errorUpdate'), {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
        transition: Bounce,
      });
    }
  }, [name, email, role, updateUser, user.id, onClose, c, managerId]);

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/25" />
      <div className="relative w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
        <DialogTitle as="h2" className="text-lg font-semibold text-gray-900">
          {t('modalTitle')}
        </DialogTitle>

        {error && <p className="mt-2 rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t('name')}</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 p-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              // placeholder="Введите имя"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t('email')}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 p-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              // placeholder="Введите email"
            />
          </label>

          {currentUser?.role === 'ADMIN' && (
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t('role')}</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="mt-1 block w-full rounded-md border-gray-300 p-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {rT(r)}
                  </option>
                ))}
              </select>
            </label>
          )}

          {currentUser?.role === 'ADMIN' && user?.role === 'CONSULTANT' && (
            <div>
              {/* <pre className="mt-4 rounded bg-gray-100 p-4">
                {JSON.stringify(user.managerId, null, 2)}
              </pre> */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Менеджер консультанта</span>
                <select
                  value={managerId || ''}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 p-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Выберите менеджера</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} ({manager.email})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            {c('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600"
          >
            {c('save')}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
