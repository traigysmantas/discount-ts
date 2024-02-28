import { readFile } from 'fs/promises';
import { join } from 'path';

export const getInputFile = async (filePath?: string): Promise<string[]> => {
  const fileDirectory = filePath ?? '../../input.txt';

  const data = await readFile(join(__dirname, fileDirectory), 'utf-8');
  return data.split('\n');
};
