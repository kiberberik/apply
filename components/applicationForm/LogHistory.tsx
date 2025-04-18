'use client';

import { useEffect, useState } from 'react';
import { useSingleApplication } from '@/store/useSingleApplication';
import { ApplicationStatus, Log } from '@prisma/client';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTranslations } from 'next-intl';

interface ExtendedLog extends Log {
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  status: ApplicationStatus | null;
}

const LogHistory = () => {
  const { application, isLoading } = useSingleApplication();
  const [logs, setLogs] = useState<ExtendedLog[]>([]);
  const tApplicationStatus = useTranslations('ApplicationStatus');
  const tLogHistory = useTranslations('LogHistory');
  // Отслеживаем обновление данных заявки
  useEffect(() => {
    if (application?.Log) {
      setLogs(application.Log);
    }
  }, [application]);

  if (isLoading) {
    return <div className="p-4">{tLogHistory('loading')}</div>;
  }

  if (!logs || logs.length === 0) {
    return <div className="p-4">{tLogHistory('noLogs')}</div>;
  }

  return (
    <div className="mt-6 rounded-lg border p-4">
      <h2 className="mb-4 text-xl font-bold">{tLogHistory('title')}</h2>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="border-b pb-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-medium">
                  {tApplicationStatus(log.statusId as ApplicationStatus)}
                </span>
                {log.description && <p className="mt-1 text-gray-600">{log.description}</p>}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {format(new Date(log.createdAt), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                </div>
                {log.createdBy && (
                  <div className="text-sm text-gray-500">
                    {log.createdBy.name || log.createdBy.email || 'Неизвестный пользователь'}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogHistory;
