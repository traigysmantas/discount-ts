import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { PackageProviderModule } from '../package-provider/package-provider.module';
import { DiscountModule } from 'src/discount/discount.module';
import { TransactionCalculator } from './transaction.calculator';
import { TransactionValidator } from './transaction.validator';
import { ObjectStorageModule } from 'src/object-storage/object-storage.module';

@Module({
  imports: [CacheModule, PackageProviderModule, DiscountModule, ObjectStorageModule],
  providers: [TransactionCalculator, TransactionValidator],
  exports: [TransactionCalculator],
})
export class TransactionModule {}
