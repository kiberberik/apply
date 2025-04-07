'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthProvider() {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser(); // Всегда проверяем текущего пользователя
  }, [fetchUser]);

  return null;
}
