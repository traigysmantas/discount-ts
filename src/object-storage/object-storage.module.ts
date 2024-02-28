import { Module } from '@nestjs/common';
import { ObjectStoragePort } from './object-storage.port';
import { LocalStorage } from './local.storage';

@Module({
  providers: [
    {
      provide: ObjectStoragePort,
      useClass: LocalStorage,
    },
  ],
  exports: [ObjectStoragePort],
})
export class ObjectStorageModule {}
