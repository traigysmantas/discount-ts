import { InputTransaction } from './input-transaction.type';

export type OutputTransaction = InputTransaction & { price: number; discount: number };
