import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    // Получаем код из БД
    const record = await prisma.verificationToken.findFirst({ where: { identifier: email } });
    // const user = await prisma.user.findUnique({ where: { email } });

    if (!record || !record.expires || new Date() > record.expires) {
      return NextResponse.json({ error: 'Код истёк или неверен' }, { status: 400 });
    }

    // Проверяем код
    const isValid = await bcrypt.compare(code, record.token);
    if (!isValid) {
      return NextResponse.json({ error: 'Неверный код' }, { status: 400 });
    }

    // Удаляем использованный токен
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    // Обновляем пользователя, отмечая email подтверждённым
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при подтверждении кода:', error);
    return NextResponse.json({ error: 'Ошибка запроса' }, { status: 500 });
  }
}
