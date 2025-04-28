'use client';

import { useEffect } from 'react';
import { Role } from '@prisma/client';
import { useRouter } from '@/i18n/navigation';
import Loading from '@/components/layout/Loading';
import ProfileUser from '@/components/ProfileUser';
import { useAuthStore } from '@/store/useAuthStore';

export default function HomePage() {
  const { user, isAuthenticated, fetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user && isAuthenticated) {
      fetchUser();
    }

    if (user) {
      switch (user.role) {
        case Role.USER:
          break;
        case Role.ADMIN:
          router.replace('/system-settings');
          break;
        case Role.MANAGER:
          router.replace('/applications');
          break;
        case Role.CONSULTANT:
          router.replace('/applications');
          break;
        default:
          router.replace('/applications');
      }
    }
  }, [user, isAuthenticated, fetchUser, router]);

  if (!user && isAuthenticated) return <Loading />;

  if (user?.role === Role.USER) {
    return <ProfileUser />;
  }

  return null;
}
