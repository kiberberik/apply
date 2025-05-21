import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { Role } from '@prisma/client';
import { ROLE_HIERARCHY } from './roles';

/**
 * Проверяет, имеет ли текущий пользователь доступ к требуемой роли
 * @param requiredRole - Минимальная требуемая роль
 * @returns {Promise<boolean>} - True, если доступ разрешён
 */
export async function checkServerAccess(requiredRole: Role): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session-token');

  if (!sessionToken) {
    return false;
  }

  const session = await prisma.session.findUnique({
    where: {
      sessionToken: sessionToken.value,
    },
    include: {
      user: true,
    },
  });

  if (!session || session.expires <= new Date()) {
    return false;
  }

  const userRole = session.user.role;
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);

  return userIndex !== -1 && userIndex >= requiredIndex;
}
