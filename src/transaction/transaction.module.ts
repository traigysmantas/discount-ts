import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { PackageProviderModule } from '../package-provider/package-provider.module';
import { DiscountModule } from '../discount/discount.module';
import { TransactionCalculator } from './transaction.calculator';
import { TransactionValidator } from './transaction.validator';
import { TransactionTransformer } from './transaction.transformer';

@Module({
  imports: [CacheModule, PackageProviderModule, DiscountModule],
  providers: [TransactionCalculator, TransactionValidator, TransactionTransformer],
  exports: [TransactionCalculator],
})
export class TransactionModule {}
