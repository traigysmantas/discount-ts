import { InputTransaction } from '../../transaction/types/input-transaction.type';

export interface DiscountRule {
  ruleName: string;
  calculate(transaction: InputTransaction): number | null | Promise<number | null>;
}
