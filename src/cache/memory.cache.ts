import { Injectable } from '@nestjs/common';
import { CachePort } from './cache.port';

@Injectable()
export class MemoryCache<T extends string | object | number> extends CachePort<T> {
  private cache: Record<string, T> = {};

  constructor() {
    super();
  }

  get(key: string): T | null {
    const value = this.cache[key];
    return value ? value : null;
  }

  set({ key, value }: { key: string; value: T }) {
    this.cache[key] = value;
  }

  setMultiple(data: { [key: string]: T }) {
    Object.keys(data).forEach((key) => {
      this.cache[key] = data[key];
    });
  }
}
