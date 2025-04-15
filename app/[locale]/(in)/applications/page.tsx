'use client';

import { useApplicationsStore } from '@/store/useApplicationsStore';
import { useEffect } from 'react';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable } from '../../../../components/data-table';
import { columns } from '../../../../components/columns';
import { ApplicationsTableSkeleton } from '../../../../components/loading';

export default function ApplicationsPage() {
  const { isLoading, error, fetchApplications } = useApplicationsStore();
  const t = useTranslations('Applications');

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
      </div>
      <div className="mt-8">
        <Suspense fallback={<ApplicationsTableSkeleton />}>
          <DataTable columns={columns} />
        </Suspense>
      </div>
    </div>
  );
}
