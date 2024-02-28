import { TestingModule, Test } from '@nestjs/testing';
import { MemoryCache } from './memory.cache';

describe(`${MemoryCache.name}`, () => {
  let memoryCache: MemoryCache<number>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemoryCache],
    }).compile();

    memoryCache = module.get(MemoryCache);
  });

  it('sets and gets a value', () => {
    const key = 'testKey';
    const value = 1;

    memoryCache.set({ key, value });
    expect(memoryCache.get(key)).toBe(value);
  });

  it('returns null if value does not exist', () => {
    expect(memoryCache.get('nonExistingKey')).toBeNull();
  });

  it('sets multiple values', () => {
    const data = {
      key1: 1,
      key2: 2,
    };

    memoryCache.setMultiple(data);
    expect(memoryCache.get('key1')).toBe(1);
    expect(memoryCache.get('key2')).toBe(2);
  });
});
