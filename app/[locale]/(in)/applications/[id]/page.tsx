'use client';
import { Suspense, useEffect, use } from 'react';
import { useSingleApplication } from '@/store/useSingleApplication';
import { useLogStore } from '@/store/useLogStore';
import ApplicationForm from '@/components/applicationForm/application-form';
import Warning from '@/components/applicationForm/Warning';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslations } from 'next-intl';
import { Role } from '@prisma/client';
import { Loader2 } from 'lucide-react';

interface ApplicationPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default function ApplicationPage({ params }: ApplicationPageProps) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const c = useTranslations('Common');

  const { fetchApplication, application, isLoading, error, clearApplication } =
    useSingleApplication();
  const { fetchLatestLogByApplicationId, clearLogs } = useLogStore();
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
    fetchApplication(id);
    fetchLatestLogByApplicationId(id);
    return () => {
      clearApplication();
      clearLogs(id);
    };
  }, [id, fetchApplication, clearApplication, fetchLatestLogByApplicationId, clearLogs, fetchUser]);

  if (error) {
    return (
      <div className="container mx-auto py-10 text-red-500">
        {c('error')}: {error}
      </div>
    );
  }

  if (!application) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-zinc-800/50">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  const hasAccessForm =
    ((user?.role === 'ADMIN' || user?.role === 'MANAGER') &&
      (application?.Log?.[0]?.statusId !== 'DRAFT' || application?.createdById === user?.id)) ||
    (user?.createdApplications && user.createdApplications.some((app) => app.id === id)) ||
    (user?.consultedApplications && user.consultedApplications.some((app) => app.id === id)) ||
    (application?.createdById && application.createdById === user?.id);

  if (!hasAccessForm) {
    return <div className="container mx-auto py-10 text-red-500">{c('noAccess')}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      {isLoading && (
        <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-zinc-800/50">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      )}
      {user?.role === Role.USER && <Warning />}
      <div className="mt-8">
        <Suspense fallback={'...'}>
          <ApplicationForm id={id} />
        </Suspense>
      </div>
    </div>
  );
}
