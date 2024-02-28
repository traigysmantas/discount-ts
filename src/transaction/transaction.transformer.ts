import { Injectable } from '@nestjs/common';

import { PackageProvider } from './types/package-provider.type';
import { InputTransaction } from './types/input-transaction.type';
import { getIsoDay } from '../utils';
import { OutputTransaction } from './types/output-transaction.type';

@Injectable()
export class TransactionTransformer {
  constructor() {}

  transformToTransaction(data: string[]): InputTransaction {
    const [rawDate, rawSize, rawProvider] = data;

    return {
      day: new Date(rawDate),
      packageSize: rawSize as PackageProvider['packageSize'],
      name: rawProvider as PackageProvider['name'],
    };
  }

  transformToOutput({ day, packageSize, name, price, discount }: OutputTransaction): string {
    return `${getIsoDay(day)} ${packageSize} ${name} ${price.toFixed(2)} ${discount ? discount.toFixed(2) : '-'}`;
  }
}
