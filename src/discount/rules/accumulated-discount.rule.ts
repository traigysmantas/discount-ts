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

  async saveDiscount({
    day,
    discount,
    availableDiscountLeft,
  }: {
    day: Date;
    discount: number;
    availableDiscountLeft: number;
  }) {
    const accumulatedDiscount = this.MAX_DISCOUNT - availableDiscountLeft;

    await this.cache.set({ key: this.buildMonthKey(day), value: accumulatedDiscount + discount });
  }

  async calculate({ day }: InputTransaction) {
    const monthKey = this.buildMonthKey(day);
    const accumulatedDiscount = (await this.cache.get(monthKey)) ?? 0;

    if (!this.isDiscountApplicable(accumulatedDiscount)) {
      return null;
    }

    return this.MAX_DISCOUNT - accumulatedDiscount;
  }
}
