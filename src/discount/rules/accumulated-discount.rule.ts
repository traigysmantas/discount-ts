import { Injectable } from '@nestjs/common';
import { DiscountRule } from './discount-rule.interface';
import { InputTransaction } from '../../transaction/types/input-transaction.type';
import { CachePort } from '../../cache/cache.port';

/**
 * Accumulated discounts cannot exceed X (default: 10) € in a calendar month. If there are not enough funds to fully cover a discount this calendar month, it should be covered partially.
 */
@Injectable()
export class AccumulatedDiscountRule implements DiscountRule {
  ruleName = AccumulatedDiscountRule.name;

  private MAX_DISCOUNT = 10;

  constructor(private readonly cache: CachePort<number>) {}

  private buildMonthKey(day: InputTransaction['day']) {
    const PREFIX = 'ACCUMULATED';

    return `${PREFIX}-${day.getFullYear()}-${day.getMonth() + 1}`;
  }

  private isDiscountApplicable(accumulatedDiscount: number) {
    return accumulatedDiscount < this.MAX_DISCOUNT;
  }

  get maxDiscount() {
    return this.MAX_DISCOUNT;
  }

  private async getAccumulatedDiscount(day: InputTransaction['day']) {
    const monthKey = this.buildMonthKey(day);
    const accumulatedDiscount = (await this.cache.get(monthKey)) ?? 0;

    return accumulatedDiscount;
  }

  async saveDiscount({ day, discount }: { day: Date; discount: number }) {
    const accumulatedDiscount = await this.getAccumulatedDiscount(day);

    await this.cache.set({ key: this.buildMonthKey(day), value: accumulatedDiscount + discount });
  }

  async calculate({ day }: InputTransaction) {
    const accumulatedDiscount = await this.getAccumulatedDiscount(day);

    if (!this.isDiscountApplicable(accumulatedDiscount)) {
      return null;
    }

    return this.maxDiscount - accumulatedDiscount;
  }
}
