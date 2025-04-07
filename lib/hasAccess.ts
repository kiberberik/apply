import { Role } from '@prisma/client';
import { ROLE_HIERARCHY } from '@/lib/roles';

/**
 * Проверяет, имеет ли пользователь доступ
 * @param userRole - Текущая роль пользователя (из Prisma)
 * @param requiredRole - Минимальная требуемая роль
 * @returns {boolean} - True, если доступ разрешён
 */
export const hasAccess = (userRole: Role, requiredRole: Role): boolean => {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);

  return userIndex !== -1 && userIndex >= requiredIndex;
};
