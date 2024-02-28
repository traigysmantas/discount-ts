import { Module } from '@nestjs/common';
import { CacheModule } from './cache/cache.module';
import { DiscountModule } from './discount/discount.module';
import { PackageProviderModule } from './package-provider/package-provider.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [CacheModule, DiscountModule, PackageProviderModule, TransactionModule],
})
export class AppModule {}
