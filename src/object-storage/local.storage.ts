import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { ObjectStoragePort } from './object-storage.port';

@Injectable()
export class LocalStorage extends ObjectStoragePort {
  async getAll(directory?: string): Promise<string[]> {
    const fileDirectory = directory ?? '../../input.txt';

    const data = await readFile(join(__dirname, fileDirectory), 'utf-8');
    return data.split('\n');
  }
}
