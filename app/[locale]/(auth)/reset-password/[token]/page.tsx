'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>(); // Здесь!

  // console.log(token);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const router = useRouter();
  const t = useTranslations('auth');
  const locale = useLocale();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, locale }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setStatus('success');
      setTimeout(() => {
        router.push('/auth');
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
      setStatus('error');
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">{t('resetPassword')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {status === 'success' ? (
          <div className="rounded bg-green-100 p-3 text-green-700">{t('passwordResetSuccess')}</div>
        ) : (
          <>
            {error && <div className="rounded bg-red-100 p-3 text-red-700">{error}</div>}
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                {t('newPassword')}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                {t('confirmPassword')}
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded bg-[#010101] px-4 py-2 text-white hover:bg-zinc-400 disabled:bg-blue-300"
            >
              {status === 'loading' ? t('saving') : t('resetPassword')}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
