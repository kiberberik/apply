'use client';

import { useEffect, useState } from 'react';
import { useSingleApplication } from '@/store/useSingleApplication';
import { useLogStore } from '@/store/useLogStore';
import { ApplicationStatus } from '@prisma/client';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { CheckCircle2, ChevronDown, ChevronUp, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const LogHistory = () => {
  const { application } = useSingleApplication();
  const { logs, isLoading, fetchLogsByApplicationId, getLatestLogByApplicationId } = useLogStore();
  const tApplicationStatus = useTranslations('ApplicationStatus');
  const tLogHistory = useTranslations('LogHistory');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (application?.id) {
      fetchLogsByApplicationId(application.id);
    }
  }, [application?.id, fetchLogsByApplicationId]);

  // Получаем и сортируем логи (сначала самые новые)
  const applicationLogs = application?.id
    ? [...(logs[application.id] || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    : [];

  const latestLog = application?.id ? getLatestLogByApplicationId(application.id) : null;

  if (isLoading) {
    return <div className="p-4">{tLogHistory('loading')}</div>;
  }

  if (!applicationLogs || applicationLogs.length === 0) {
    return <div className="p-4">{tLogHistory('noLogs')}</div>;
  }

  // Функция для получения цвета статуса
  const getStatusColor = (status: ApplicationStatus | null) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'NEED_SIGNATURE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'REFUSED_TO_SIGN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CHECK_DOCS':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'NEED_DOCS':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'RE_PROCESSING':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ENROLLED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EARLY_REFUSED_TO_ENROLL':
      case 'REFUSED_TO_ENROLL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="mt-6 w-full rounded-lg border bg-white p-4">
      <h2 className="mb-4 flex flex-wrap items-center justify-between text-xl font-bold">
        <div>{tLogHistory('title')}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1 text-sm"
        >
          <History className="h-4 w-4" />
          {tLogHistory('statusHistory')}
          {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </h2>

      {latestLog && !showHistory && (
        <div className="mb-4">
          <div className="relative">
            <div
              className={cn(
                'rounded-lg border-2 p-3 shadow-sm',
                getStatusColor(latestLog.statusId as ApplicationStatus).split(' ')[2],
              )}
            >
              <div className="absolute -top-2 -right-2 rounded-full bg-white">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>

              <div className="flex flex-col flex-wrap items-center justify-center gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <span
                    className={cn(
                      'rounded-full border px-2 py-1 text-sm font-medium',
                      getStatusColor(latestLog.statusId as ApplicationStatus),
                    )}
                  >
                    {tApplicationStatus(latestLog.statusId as ApplicationStatus)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {format(new Date(latestLog.createdAt), 'dd.MM.yyyy, HH:mm', { locale: ru })}
                  </div>
                  {latestLog.createdBy && (
                    <div className="text-sm text-gray-500">
                      {latestLog.createdBy.name} {latestLog.createdBy.email}
                    </div>
                  )}
                </div>
                {latestLog.description && (
                  <p className="mt-2 text-gray-600">{latestLog.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="space-y-2">
          {applicationLogs.map((log, index) => {
            const isLatest = latestLog?.id === log.id;
            const statusColor = getStatusColor(log.statusId as ApplicationStatus);

            return (
              <div key={log.id} className="relative">
                <div
                  className={cn(
                    'rounded-lg border p-3 transition-all',
                    isLatest ? 'border-2 shadow-sm' : 'border-gray-200 hover:bg-gray-50',
                    isLatest && statusColor.split(' ')[2],
                  )}
                >
                  {isLatest && (
                    <div className="absolute -top-2 -right-2 rounded-full bg-white">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  )}

                  <div className="flex flex-col flex-wrap items-center justify-center gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <span
                        className={cn(
                          'rounded-full border px-2 py-1 text-sm font-medium',
                          statusColor,
                        )}
                      >
                        {tApplicationStatus(log.statusId as ApplicationStatus)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {format(new Date(log.createdAt), 'dd.MM.yyyy, HH:mm', { locale: ru })}
                      </div>
                      {log.createdBy && (
                        <div className="text-sm text-gray-500">
                          {log.createdBy.name} {log.createdBy.email}
                        </div>
                      )}
                    </div>
                    {log.description && <p className="mt-2 text-gray-600">{log.description}</p>}
                  </div>
                </div>

                {/* Стрелка между логами (показываем только если не последний лог) */}
                {index < applicationLogs.length - 1 && (
                  <div className="relative z-10 my-2 flex items-center justify-center">
                    <div className="h-6 w-[2px] bg-gray-300"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LogHistory;
