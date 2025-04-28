'use client';

import { Suspense, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { columns } from '@/components/columns';
import { Button } from '@/components/ui/button';
import Loading from '@/components/layout/Loading';
import NoAccess from '@/components/layout/NoAccess';
import { DataTable } from '@/components/data-table';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { ApplicationStatus, Role } from '@prisma/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useApplicationStore } from '@/store/useApplicationStore';

export default function ApplicationsPage() {
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const c = useTranslations('Common');
  const t = useTranslations('Applications');
  const { fetchUser, user } = useAuthStore();
  const { applications, isLoading, error, fetchApplications, createNewApplication } =
    useApplicationStore();

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleCreateApplication = async () => {
    if (creating) return;
    try {
      setCreating(true);
      const newApplication = await createNewApplication();
      if (!newApplication) {
        throw new Error(c('error'));
      }
      await fetchUser();
      toast.success(c('success'));
      router.push(`/applications/${newApplication.id}`);
    } catch (error) {
      toast.error(c('error'));
      throw error;
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const hasAccessForm =
    user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'CONSULTANT';

  if (!hasAccessForm) {
    return <NoAccess />;
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
        <Suspense fallback={<Loading />}>
          <DataTable
            columns={columns}
            data={(applications || []).filter((app) => {
              const isCurrentUserApplication = app.createdById === user?.id;
              const isDraft = app.Log?.[0]?.statusId === ApplicationStatus.DRAFT;
              const isPrivilegedUser =
                user?.role === Role.CONSULTANT ||
                user?.role === Role.MANAGER ||
                user?.role === Role.ADMIN;
              return isCurrentUserApplication || (!isDraft && isPrivilegedUser);
            })}
          />
        </Suspense>
      </div>
    </div>
  );
}
