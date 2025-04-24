import { Role } from '@prisma/client';

// Определяем иерархию ролей (от низшей к высшей)
export const ROLE_HIERARCHY: Role[] = [
  Role.USER,
  Role.CONSULTANT,
  Role.MANAGER,
  Role.LAWYER,
  Role.ADMIN,
];
