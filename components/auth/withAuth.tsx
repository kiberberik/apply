'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { redirect } from 'next/navigation';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
      redirect('/auth');
    }

    return <Component {...props} />;
  };
}
