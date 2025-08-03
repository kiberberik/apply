import * as fs from 'fs';
import * as path from 'path';

export async function getContractBuffer(filePath: string): Promise<Buffer | null> {
  try {
    // Безопасность: не даём выходить за пределы private/contracts
    const safePath = path.normalize(filePath).replace(/^\/+|\/+$/g, '');
    const contractsDir = path.join(process.cwd(), 'private', 'contracts');
    const absFilePath = path.join(contractsDir, safePath);

    if (!absFilePath.startsWith(contractsDir)) {
      console.error('Invalid filePath:', filePath);
      return null;
    }

    if (!fs.existsSync(absFilePath)) {
      console.error('Contract file not found:', absFilePath);
      return null;
    }

    return fs.readFileSync(absFilePath);
  } catch (error) {
    console.error('Error reading contract file:', error);
    return null;
  }
}

export async function saveContractBuffer(fileName: string, buffer: Buffer): Promise<string | null> {
  try {
    const contractsDir = path.join(process.cwd(), 'private', 'contracts');
    const filePath = path.join(contractsDir, fileName);

    // Убедимся, что директория существует
    await fs.promises.mkdir(contractsDir, { recursive: true });

    // Сохраняем файл
    await fs.promises.writeFile(filePath, buffer);

    return `/private/contracts/${fileName}`;
  } catch (error) {
    console.error('Error saving contract file:', error);
    return null;
  }
}
