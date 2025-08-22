'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '../ui/button';
import { useLocale } from 'next-intl';
import { useLogStore } from '@/store/useLogStore';
import { ApplicationStatus } from '@prisma/client';

const EnrolledEmailButton = ({ applicationId }: { applicationId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { createLog, fetchLogsByApplicationId, getLatestLogByApplicationId } = useLogStore();
  const { user } = useAuthStore();

  const locale = useLocale();

  useEffect(() => {
    if (applicationId) {
      fetchLogsByApplicationId(applicationId);
    }
  }, [applicationId, fetchLogsByApplicationId]);

  const handleSendSuccessEnrolled = async () => {
    setIsLoading(true);
    try {
      const emailResponse = await fetch('/api/email/success-enrolled', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: applicationId, // 'cmdcpd3vk0001rqx6mdm80ztz', // 'cm9sqpj9g0001rqnmnf7d8hgd',
          locale: locale, // Используем русский язык по умолчанию
        }),
      });

      if (!emailResponse.ok) {
        console.error('Ошибка при отправке письма');
        toast.error('Произошла ошибка при отправке Email');
      }

      toast.success('Email успешно отправлен');

      if (applicationId) {
        await fetchLogsByApplicationId(applicationId);
      }
      const latestLog = applicationId ? getLatestLogByApplicationId(applicationId) : null;
      console.log('latestLog: ', latestLog);
      console.log('latestLog?.statusId: ', latestLog?.statusId);
      console.log('typeof latestLog?.statusId: ', typeof latestLog?.statusId);

      // Проверяем, загружены ли логи для этой заявки
      const { logs } = useLogStore.getState();
      const applicationLogs = logs[applicationId || ''] || [];
      console.log('Application logs count: ', applicationLogs.length);
      console.log('All application logs: ', applicationLogs);

      console.log('Creating log with statusId: ', latestLog?.statusId);

      // Проверяем, есть ли statusId у latestLog
      if (!latestLog?.statusId) {
        console.warn('latestLog.statusId is null or undefined, will create log without statusId');
      }

      const logData = {
        applicationId: applicationId,
        statusId: ApplicationStatus.ENROLLED, // latestLog?.statusId || null, // Явно указываем null если statusId нет
        createdById: user?.id,
        description: `Письмо счастья успешно отправлено`,
      };
      console.log('Full log data being sent: ', logData);
      await createLog(logData);
      await fetchLogsByApplicationId(applicationId as string);
    } catch (error) {
      console.error('Ошибка при отправке письма:', error);
      toast.error('Произошла ошибка при отправке Email');
    }
    setIsLoading(false);
  };

  return (
    <div>
      <Button
        className="flex-col bg-none px-4 py-2 hover:cursor-pointer"
        onClick={() => handleSendSuccessEnrolled()}
        disabled={isLoading}
      >
        {isLoading ? (
          <svg
            className="h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        ) : (
          'Отправить письмо'
        )}
      </Button>
    </div>
  );
};

export default EnrolledEmailButton;
