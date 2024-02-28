import { Injectable } from '@nestjs/common';
import { AccumulatedDiscountRule } from './rules/accumulated-discount.rule';
import { DiscountRule } from './rules/discount-rule.interface';
import { CachePort } from '../cache/cache.port';
import { LargeShipmentLpRule } from './rules/large-shipment-lp.rule';
import { SmallShipmentRule } from './rules/small-shipment.rule';
import { InputTransaction } from '../transaction/types/input-transaction.type';

@Injectable()
export class DiscountCalculator {
  private readonly applicableRules: DiscountRule[];

  constructor(
    private readonly cache: CachePort<number>,
    private readonly largeShipmentLpRule: LargeShipmentLpRule,
    private readonly smallShipmentRule: SmallShipmentRule,
    private readonly accumulatedDiscountRule: AccumulatedDiscountRule,
  ) {
    this.applicableRules = [this.largeShipmentLpRule, this.smallShipmentRule];
  }

  private buildPackageKey({ name, packageSize }: InputTransaction) {
    return `${name}-${packageSize}`;
  }

  private getAvailableDiscount({
    availableDiscountLeft,
    transactionDiscount,
  }: {
    availableDiscountLeft: number;
    transactionDiscount: number;
  }) {
    return transactionDiscount > availableDiscountLeft ? availableDiscountLeft : transactionDiscount;
  }

  async calculateDiscountAndPrice(transaction: InputTransaction): Promise<{ discount: number; price: number }> {
    const fullPrice = await this.cache.get(this.buildPackageKey(transaction));
    const availableDiscountLeft = await this.accumulatedDiscountRule.calculate(transaction);

    if (!availableDiscountLeft) {
      return { discount: 0, price: fullPrice };
    }

    const transactionDiscount = await this.findTransactionDiscount(transaction);
    const discount = this.getAvailableDiscount({ availableDiscountLeft, transactionDiscount });

    await this.accumulatedDiscountRule.saveDiscount({ day: transaction.day, availableDiscountLeft, discount });

    return { discount, price: fullPrice - discount };
  }

  private async findTransactionDiscount(transaction: InputTransaction): Promise<number> {
    const discounts = await Promise.all(
      this.applicableRules.map(async (rule) => {
        const discount = await rule.calculate(transaction);
        return discount;
      }),
    );

    const filteredDiscounts = discounts.filter((discount) => discount !== null);

    if (filteredDiscounts.length > 1) {
      throw new Error('Discount rules violation. More than 1 applicable discount found');
    }

    if (filteredDiscounts.length === 1) {
      return filteredDiscounts[0];
    }

    return 0;
  }
}
