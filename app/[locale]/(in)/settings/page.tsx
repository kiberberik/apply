'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const t = useTranslations('UserSettings');

  const handleUpdateUser = async (data: Partial<{ name: string; password: string }>) => {
    try {
      setLoading(true);
      const trimmedData = {
        ...data,
        name: data.name?.trim(),
        password: data.password?.trim(),
      };
      await updateUser(trimmedData);
      toast.success(data.name ? t('nameSuccess') : t('passSuccess'));
      if (data.password) {
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Ошибка обновления:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = password === confirmPassword && password.length >= 6;

  return (
    <div className="mx-auto max-w-lg p-6">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('title')}</h2>

      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">{t('nameChange')}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateUser({ name });
          }}
        >
          <div className="mb-4">
            <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">
              {t('name')}
            </label>
            <input
              value={name}
              placeholder={user?.name ?? ''}
              onChange={(e) => setName(e.target.value)}
              type="text"
              name="fullname"
              id="fullname"
              maxLength={50}
              autoComplete="fullname"
              className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-rose-600 focus:ring-rose-600 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || name.trim() === user?.name || name.trim().length === 0}
            className="w-full rounded-md bg-zinc-800 px-4 py-2 text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? t('updating') : t('updateName')}
          </button>
        </form>
      </div>

      {/* Password Update Form */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">{t('passChange')}</h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateUser({ password });
          }}
        >
          <input
            type="text"
            name="username"
            autoComplete="username"
            className="absolute -left-[9999px] hidden"
          />

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('newPass')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                maxLength={100}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-rose-600 focus:ring-rose-600 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              {t('newPassConfirm')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                maxLength={100}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-rose-600 focus:ring-rose-600 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{t('passNotMatch')}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full rounded-md bg-zinc-800 px-4 py-2 text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? t('updating') : t('updatePass')}
          </button>
        </form>
      </div>
    </div>
  );
}
