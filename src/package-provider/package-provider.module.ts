import { Module } from '@nestjs/common';
import { PackageProviderLocalDb } from './package-provider-local.db';
import { DbPort } from './db.port';

@Module({
  providers: [
    {
      provide: DbPort,
      useClass: PackageProviderLocalDb,
    },
  ],
  exports: [DbPort],
})
export class PackageProviderModule {}
