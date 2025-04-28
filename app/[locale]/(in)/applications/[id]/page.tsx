'use client';
import { Suspense, useEffect, use } from 'react';
import { Role } from '@prisma/client';
import { useLogStore } from '@/store/useLogStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useApplicationStore } from '@/store/useApplicationStore';
import ApplicationForm from '@/components/applicationForm/application-form';
import Warning from '@/components/applicationForm/Warning';
import NoAccess from '@/components/layout/NoAccess';
import Loading from '@/components/layout/Loading';
import Error from '@/components/layout/Error';

interface ApplicationPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default function ApplicationPage({ params }: ApplicationPageProps) {
  const { id } = use(params);
  const { user } = useAuthStore();

  const {
    fetchSingleApplication,
    singleApplication,
    isLoadingSingleApp,
    error,
    clearSingleApplication,
  } = useApplicationStore();
  const { fetchLatestLogByApplicationId, clearLogs } = useLogStore();
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
    fetchSingleApplication(id);
    fetchLatestLogByApplicationId(id);
    return () => {
      clearSingleApplication();
      clearLogs(id);
    };
  }, [
    id,
    fetchSingleApplication,
    clearSingleApplication,
    fetchLatestLogByApplicationId,
    clearLogs,
    fetchUser,
  ]);

  const hasAccessForm =
    ((user?.role === 'ADMIN' || user?.role === 'MANAGER') &&
      (singleApplication?.Log?.[0]?.statusId !== 'DRAFT' ||
        singleApplication?.createdById === user?.id)) ||
    (user?.createdApplications && user.createdApplications.some((app) => app.id === id)) ||
    (user?.consultedApplications && user.consultedApplications.some((app) => app.id === id)) ||
    (singleApplication?.createdById && singleApplication.createdById === user?.id);

  if (!hasAccessForm) return <NoAccess />;
  if (error) return <Error />;
  if (!singleApplication) return <Loading />;

  return (
    <div className="container mx-auto py-10">
      {isLoadingSingleApp && <Loading />}
      {user?.role === Role.USER && <Warning />}
      <div className="mt-8">
        <Suspense fallback={'...'}>
          <ApplicationForm id={id} />
        </Suspense>
      </div>
    </div>
  );
}
