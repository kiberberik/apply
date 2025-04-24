'use client';

import { useApplicationsStore } from '@/store/useApplicationsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable } from '../../../../components/data-table';
import { columns } from '../../../../components/columns';
import { ApplicationsTableSkeleton } from '../../../../components/loading';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'react-toastify';

export default function ApplicationsPage() {
  const { applications, isLoading, error, fetchApplications, createNewApplication } =
    useApplicationsStore();
  const { fetchUser } = useAuthStore();
  const t = useTranslations('Applications');
  const c = useTranslations('Common');
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Функция для создания пустой заявки
  const handleCreateApplication = async () => {
    if (creating) return; // Предотвращаем повторные клики

    try {
      setCreating(true);

      // Создаем заявку через стор
      const newApplication = await createNewApplication();

      if (!newApplication) {
        throw new Error('Не удалось создать заявку');
      }

      // Обновляем данные пользователя, чтобы получить информацию о новой заявке
      await fetchUser();

      // Показываем уведомление об успешном создании
      toast.success('Заявка успешно создана');

      // Перенаправляем на страницу созданной заявки с учетом локали
      router.push(`/applications/${newApplication.id}`);
    } catch (error) {
      console.error('Ошибка при создании заявки:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка при создании заявки');
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) {
    return <div>{c('loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
        <Button onClick={handleCreateApplication} disabled={creating}>
          <Plus />
          {c('add')}
        </Button>
      </div>
      <div className="mt-8">
        <Suspense fallback={<ApplicationsTableSkeleton />}>
          <DataTable columns={columns} data={applications || []} />
        </Suspense>
      </div>
    </div>
  );
}
