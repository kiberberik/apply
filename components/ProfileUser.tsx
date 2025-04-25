'use client';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useRouter } from '@/i18n/navigation';
import { useApplicationStore } from '@/store/useApplicationStore';
import { toast } from 'react-toastify';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ApplicationStatus } from '@prisma/client';

// Функция для форматирования даты
const formatDateDisplay = (date: Date | null | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString();
};

const ProfileUser = () => {
  const locale = useLocale();
  const {
    user,
    isAuthenticated,
    isEmailVerified,
    emailVerificationError,
    resendVerificationEmail,
    fetchUser,
  } = useAuthStore();
  const t = useTranslations('Profile');
  const c = useTranslations('Common');
  const tAcademicLevel = useTranslations('AcademicLevel');
  const tApplicationStatus = useTranslations('ApplicationStatus');
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  // Используем новые функции из расширенного стора для заявок пользователя
  const {
    userApplications,
    isLoadingUserApps,
    userAppsError,
    fetchDetailedUserApplications,
    createNewApplication,
  } = useApplicationStore();

  // Загружаем заявки пользователя при монтировании компонента
  useEffect(() => {
    fetchUser();
    // Вызываем функцию загрузки детальных данных заявок пользователя
    fetchDetailedUserApplications();
  }, [fetchUser, fetchDetailedUserApplications]);

  // Загрузка состояний из localStorage при инициализации компонента
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTimerData = localStorage.getItem('verification-timer-data');

      if (savedTimerData) {
        const { endTime, showNotification } = JSON.parse(savedTimerData);
        const now = new Date().getTime();
        const remainingSeconds = Math.max(0, Math.round((endTime - now) / 1000));

        if (remainingSeconds > 0) {
          setIsResendDisabled(true);
          setCountdown(remainingSeconds);
          setShowEmailSent(showNotification);
        } else {
          // Если время истекло, очищаем данные в localStorage
          localStorage.removeItem('verification-timer-data');
        }
      }
    }
  }, []);

  const handleResendVerification = () => {
    if (user?.email) {
      resendVerificationEmail(user.email, locale);

      // Установка временных меток и сохранение в localStorage
      const now = new Date().getTime();
      const endTime = now + 120 * 1000; // 2 минуты в миллисекундах

      localStorage.setItem(
        'verification-timer-data',
        JSON.stringify({
          endTime,
          showNotification: true,
        }),
      );

      setIsResendDisabled(true);
      setCountdown(120); // 2 минуты в секундах
      setShowEmailSent(true);
    }
  };

  // Обновление таймера
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isResendDisabled && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && isResendDisabled) {
      setIsResendDisabled(false);
      localStorage.removeItem('verification-timer-data');
    }

    return () => clearTimeout(timer);
  }, [isResendDisabled, countdown]);

  useEffect(() => {
    if (isAuthenticated && !isEmailVerified) {
      console.log('User is authenticated but email is not verified');
    }
  }, [isAuthenticated, isEmailVerified]);

  const handleCreateApplication = async () => {
    if (creating) return; // Предотвращаем повторные клики

    try {
      setCreating(true);

      // Создаем заявку через стор
      const newApplication = await createNewApplication();

      if (!newApplication) {
        throw new Error(t('applicationCreatedError'));
      }
      toast.success(t('applicationCreated'));

      // Обновляем список заявок пользователя после создания
      fetchDetailedUserApplications();

      router.push(`/applications/${newApplication.id}`);
    } catch (error) {
      console.error(t('applicationCreatedError'), ': ', error);
      toast.error(error instanceof Error ? error.message : t('applicationCreatedError'));
    } finally {
      setCreating(false);
    }
  };

  const handleViewApplication = (id: string) => {
    router.push(`/applications/${id}`);
  };

  if (isLoadingUserApps) {
    return <div>{c('loading')}</div>;
  }

  if (userAppsError) {
    return <div className="text-red-500">{userAppsError}</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        {t('greeting')}, {user?.name} <span className="italic">({user?.email})</span>
      </h1>

      {isEmailVerified ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('yourApplications')}</h2>
            <Button onClick={handleCreateApplication} disabled={creating}>
              {t('createApplication')}
            </Button>
          </div>

          {!userApplications.length ? (
            <div className="rounded-md bg-gray-50 p-4 text-center">{t('noApplications')}</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('applicationAcademicLevel')}</TableHead>
                    <TableHead>{t('applicationStatus')}</TableHead>
                    <TableHead>{t('createdAt')}</TableHead>
                    <TableHead>{t('submittedAt')}</TableHead>
                    <TableHead>{t('consultant')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userApplications.map((application) => (
                    <TableRow
                      key={application.id}
                      className="cursor-pointer"
                      onClick={() => handleViewApplication(application.id)}
                    >
                      <TableCell>
                        {application.details?.academicLevel
                          ? tAcademicLevel(application.details.academicLevel)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {application.Log && application.Log.length > 0
                          ? tApplicationStatus(application.Log[0].statusId as ApplicationStatus)
                          : '-'}
                      </TableCell>

                      <TableCell>{formatDateDisplay(application.createdAt)}</TableCell>
                      <TableCell>{formatDateDisplay(application.submittedAt)}</TableCell>
                      <TableCell>
                        {application.consultant
                          ? `${application.consultant?.name} (${application.consultant?.email})`
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p>{t('emailNotVerified')}</p>
          {emailVerificationError && <p className="error">{emailVerificationError}</p>}
          {showEmailSent && (
            <div className="rounded-md bg-green-100 p-3 text-green-800">
              {t('emailSent')} {user?.email}
            </div>
          )}
          <Button onClick={handleResendVerification} disabled={isResendDisabled}>
            {isResendDisabled
              ? `${t('resendVerification')} (${countdown}с)`
              : t('resendVerification')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileUser;
