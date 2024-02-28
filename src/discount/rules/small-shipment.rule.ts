import { Injectable } from '@nestjs/common';
import { DiscountRule } from './discount-rule.interface';
import { PackageProvider } from '../../transaction/types/package-provider.type';
import { InputTransaction } from '../../transaction/types/input-transaction.type';
import { CachePort } from '../../cache/cache.port';
import { DbPort } from '../../package-provider/db.port';

/**
 * All S shipments should always match the lowest S package price among the providers.
 */
@Injectable()
export class SmallShipmentRule implements DiscountRule {
  ruleName = SmallShipmentRule.name;
  private lowestShipmentPrice: number;

  constructor(
    private readonly packageProviderDb: DbPort<PackageProvider>,
    private readonly cache: CachePort<number>,
  ) {
    this.getLowestDiscountPrice();
  }

  private async getLowestDiscountPrice() {
    const packageProviders = await this.packageProviderDb.getAll();

    this.lowestShipmentPrice = packageProviders.reduce((lowestPrice, { price, packageSize }) => {
      if (packageSize === 'S' && price < lowestPrice) {
        return price;
      }
      return lowestPrice;
    }, Number.POSITIVE_INFINITY);
  }

  async calculate({ packageSize, name }: InputTransaction): Promise<number> {
    if (packageSize !== 'S' || this.lowestShipmentPrice === Number.POSITIVE_INFINITY) {
      return null;
    }

    const packageShipmentPrice = (await this.cache.get(`${name}-${packageSize}`)) ?? 0;
    const discount = packageShipmentPrice - this.lowestShipmentPrice;

    return discount > 0 ? discount : null;
  }
}
