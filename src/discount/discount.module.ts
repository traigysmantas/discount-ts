import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { DiscountCalculator } from './discount.calculator';
import { PackageProviderModule } from '../package-provider/package-provider.module';
import { LargeShipmentLpRule } from './rules/large-shipment-lp.rule';
import { SmallShipmentRule } from './rules/small-shipment.rule';
import { AccumulatedDiscountRule } from './rules/accumulated-discount.rule';

@Module({
  imports: [CacheModule, PackageProviderModule],
  controllers: [],
  providers: [DiscountCalculator, LargeShipmentLpRule, SmallShipmentRule, AccumulatedDiscountRule],
  exports: [DiscountCalculator],
})
export class DiscountModule {}
