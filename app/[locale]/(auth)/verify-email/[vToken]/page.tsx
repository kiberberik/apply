'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

const VerifyEmail = () => {
  const { vToken } = useParams<{ vToken: string }>();
  const { verifyEmail } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('emailVerification');

  useEffect(() => {
    let isMounted = true; // Флаг для предотвращения обновлений после размонтирования

    const verify = async () => {
      if (!vToken) {
        if (isMounted) {
          setError(t('invalidToken'));
          toast.error(t('invalidToken'));
          setLoading(false);
        }
        return;
      }

      try {
        await verifyEmail(vToken, locale);
        if (isMounted) {
          setLoading(false);
          setVerified(true); // Устанавливаем verified сразу после успешного вызова
          // toast.success(t('emailVerified'));
        }
      } catch (err) {
        if (isMounted) {
          setLoading(false);
          console.error('Ошибка верификации:', err);
          const errorMessage = err instanceof Error ? err.message : t('error');
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
  }, [vToken, verifyEmail, locale, router, error, verified, t]); // Убрали isEmailVerified из зависимостей

  useEffect(() => {
    if (error) {
      toast.error(error);
      // setTimeout(() => {
      //   router.push('/');
      // }, 2000);
    }
    if (verified) {
      toast.success(t('emailVerified'));
      // Добавляем перенаправление после успешной верификации
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  }, [error, verified, t, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>{t('checkingToken')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 text-red-500">
        <h1 className="text-2xl font-semibold">{t('error')}</h1>
        <p>{error}</p>
        <Button onClick={() => router.push('/')}>{t('returnToProfile')}</Button>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 text-green-600">
        <h1 className="text-2xl font-semibold">{t('emailVerified')}</h1>
        <p>{t('emailVerifiedDescription')}</p>
        <Button onClick={() => router.push('/')}>{t('returnToProfile')}</Button>
      </div>
    );
  }

  return null;
};

export default VerifyEmail;
