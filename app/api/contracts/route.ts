import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { checkServerAccess } from '@/lib/serverAuth';

export async function POST(request: Request) {
  const hasAccess = await checkServerAccess(Role.USER);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }
  try {
    const { role, id } = await request.json();

    if (!role || role === Role.USER) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      select: { contractFileLinks: true },
    });

    if (!application?.contractFileLinks) {
      return NextResponse.json({ error: 'No contracts found' }, { status: 404 });
    }

    let contractLinks;
    try {
      contractLinks = JSON.parse(application.contractFileLinks);
      if (!Array.isArray(contractLinks) || contractLinks.length === 0) {
        return NextResponse.json({ error: 'No contracts found' }, { status: 404 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid contract links format' }, { status: 500 });
    }

    const latestContract = contractLinks[contractLinks.length - 1];
    const filePath = path.join(process.cwd(), 'private', 'contracts', latestContract);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Contract file not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${latestContract}"`,
      },
    });
  } catch (error) {
    console.error('Error accessing contract:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
