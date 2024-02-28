import { Injectable } from '@nestjs/common';
import { DiscountRule } from './discount-rule.interface';
import { InputTransaction } from '../../transaction/types/input-transaction.type';
import { CachePort } from '../../cache/cache.port';

/**
 * The **X (default: third)** L shipment via LP should be free, but only once a calendar month.
 */
@Injectable()
export class LargeShipmentLpRule implements DiscountRule {
  ruleName = LargeShipmentLpRule.name;

  private FREE_SHIPMENT_COUNT = 3;

  constructor(private readonly cache: CachePort<number>) {}

  private isDiscountApplicable(shipmentCount: number) {
    return shipmentCount === this.FREE_SHIPMENT_COUNT;
  }

  private buildMonthKey(day: Date) {
    return `l-lp-${day.getFullYear()}-${day.getMonth() + 1}`;
  }

  async calculate({ packageSize, name, day }: InputTransaction) {
    if (packageSize !== 'L' || name !== 'LP') {
      return null;
    }

    const monthKey = this.buildMonthKey(day);
    const shipmentCount = (await this.cache.get(monthKey)) ?? 1;

    const packageShipmentPrice = this.cache.get(`${name}-${packageSize}`);
    const discount = this.isDiscountApplicable(shipmentCount) ? packageShipmentPrice : null;

    await this.cache.set({ key: monthKey, value: shipmentCount + 1 });

    return discount;
  }
}
