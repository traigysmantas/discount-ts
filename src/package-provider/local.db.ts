import { Injectable } from '@nestjs/common';
import { DbPort } from './db.port';

@Injectable()
export class LocalDb<T> extends DbPort<T> {
  private data: T[];

  constructor(initialData: T[]) {
    super();
    this.data = initialData;
  }

  getAll(): T[] | Promise<T[]> {
    return this.data;
  }
}
