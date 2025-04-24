import { PrismaAdapter } from '@auth/prisma-adapter';
import type { NextAuthConfig } from 'next-auth';
import { prisma } from './prisma';

// Расширяем тип AdapterUser из @auth/core
declare module '@auth/core/adapters' {
  interface AdapterUser {
    role?: string | null;
  }
}

// Проблема с типами между @auth/prisma-adapter и next-auth
// Используем принудительное приведение к any для обхода несоответствия типов
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = PrismaAdapter(prisma) as any;

export const authOptions: NextAuthConfig = {
  adapter,
  session: {
    strategy: 'jwt',
  },
  providers: [
    // Здесь будут добавлены провайдеры аутентификации
  ],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
};
