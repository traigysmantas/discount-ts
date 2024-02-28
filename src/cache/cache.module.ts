import { Module } from '@nestjs/common';
import { CachePort } from './cache.port';
import { MemoryCache } from './memory.cache';

@Module({
  providers: [
    {
      provide: CachePort,
      useClass: MemoryCache,
    },
  ],
  exports: [CachePort],
})
export class CacheModule {}
