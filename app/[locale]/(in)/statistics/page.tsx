'use client';
import { Role } from '@prisma/client';
import { hasAccess } from '@/lib/hasAccess';
import NoAccess from '@/components/layout/NoAccess';
import { useAuthStore } from '@/store/useAuthStore';
import React from 'react';
import ExportAll from '@/components/(statistics)/ExportAll';

export default function Page() {
  const { user } = useAuthStore();

  if (user?.role && !hasAccess(user?.role, Role.MANAGER)) {
    return <NoAccess />;
  }

  return (
    <div>
      Statistics
      <ExportAll />
    </div>
  );
}
