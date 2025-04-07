'use client';

import { hasAccess } from '@/lib/hasAccess';
import { useAuthStore } from '@/store/useAuthStore';
import { Role } from '@prisma/client';

export default function SingleUser({ userId }: { userId: string }) {
  const { user } = useAuthStore();

  if (!hasAccess(user?.role ?? Role.USER, Role.ADMIN)) {
    return <div>Нет доступа</div>;
  }

  return <div>User: {userId}</div>;
}
