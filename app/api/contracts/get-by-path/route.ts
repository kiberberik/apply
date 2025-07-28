import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json();
    if (!filePath) {
      return NextResponse.json({ error: 'filePath is required' }, { status: 400 });
    }
    // Безопасность: не даём выходить за пределы private/contracts
    const safePath = path.normalize(filePath).replace(/^\/+|\/+$/g, '');
    const contractsDir = path.join(process.cwd(), 'private', 'contracts');
    const absFilePath = path.join(contractsDir, safePath);
    if (!absFilePath.startsWith(contractsDir)) {
      return NextResponse.json({ error: 'Invalid filePath' }, { status: 400 });
    }
    if (!fs.existsSync(absFilePath)) {
      return NextResponse.json({ error: 'Contract file not found' }, { status: 404 });
    }
    const fileBuffer = fs.readFileSync(absFilePath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${path.basename(absFilePath)}"`,
      },
    });
  } catch (error) {
    console.error('Error accessing contract by path:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
