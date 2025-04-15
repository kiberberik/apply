'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useLocale } from 'next-intl';

const VerifyEmail = () => {
  const { vToken } = useParams<{ vToken: string }>();
  const { verifyEmail } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    let isMounted = true; // Флаг для предотвращения обновлений после размонтирования

    const verify = async () => {
      if (!vToken) {
        if (isMounted) {
          setError('Отсутствует токен верификации.');
          toast.error('Отсутствует токен верификации.');
          setLoading(false);
        }
        return;
      }

      try {
        await verifyEmail(vToken, locale);
        if (isMounted) {
          setLoading(false);
          setVerified(true); // Устанавливаем verified сразу после успешного вызова
          toast.success('Email успешно подтвержден!');
          setTimeout(() => {
            if (isMounted) router.push('/');
          }, 2000);
        }
      } catch (err) {
        if (isMounted) {
          setLoading(false);
          console.error('Ошибка верификации:', err);
          const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    };

    if (!verified && !error && isMounted) {
      verify();
    }

    return () => {
      isMounted = false; // Очищаем флаг при размонтировании
    };
  }, [vToken, verifyEmail, locale, router, error, verified]); // Убрали isEmailVerified из зависимостей

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (verified) {
      toast.success('Email verified successfully');
    }
  }, [error, verified]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Проверка токена...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-red-500">
        <h1 className="text-2xl font-semibold">Ошибка</h1>
        <p>{error}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Вернуться к профилю
        </button>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-green-600">
        <h1 className="text-2xl font-semibold">Email успешно подтвержден!</h1>
        <p>Ваш email был успешно подтвержден. Перенаправляем вас на главную страницу...</p>
      </div>
    );
  }

  return null;
};

export default VerifyEmail;
