'use client';
import ProfileUser from '@/components/ProfileUser';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Role } from '@prisma/client';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, isAuthenticated, fetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Если пользователь еще не загружен, но сессия должна быть, подтягиваем данные
    if (!user && isAuthenticated) {
      fetchUser();
    }

    // Выполняем редирект только после загрузки данных пользователя
    if (user) {
      switch (user.role) {
        case Role.USER:
          // Остаемся на текущей странице (ProfileUser)
          break;
        case Role.ADMIN:
          router.replace('/system-settings'); // Редирект для админов
          break;
        case Role.MANAGER:
          router.replace('/applications'); // Редирект для менеджеров
          break;
        case Role.CONSULTANT:
          router.replace('/applications'); // Редирект для консультантов
          break;
        default:
          router.replace('/applications'); // Редирект по умолчанию для других ролей
      }
    }
  }, [user, isAuthenticated, fetchUser, router]);

  // Пока данные пользователя не загружены, показываем лоадер
  if (!user && isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Загрузка данных пользователя...</p>
      </div>
    );
  }

  // Если пользователь не авторизован, можно перенаправить на страницу логина
  // if (!isAuthenticated) {
  //   router.replace('/auth');
  //   return null;
  // }

  // Если роль USER, отображаем ProfileUser
  if (user?.role === Role.USER) {
    return <ProfileUser />;
  }

  // Если редирект уже выполнен, ничего не рендерим
  return null;
}
