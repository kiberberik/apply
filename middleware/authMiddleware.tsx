'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session-token');

  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: {
      sessionToken: sessionToken.value,
    },
    include: {
      user: true,
    },
  });

  if (session && session.expires > new Date()) {
    return session.user;
  }

  return null;
}
