import { Injectable } from '@nestjs/common';

import { CachePort } from '../cache/cache.port';
import { DiscountCalculator } from '../discount/discount.calculator';
import { PackageProvider } from './types/package-provider.type';
import { InputTransaction } from './types/input-transaction.type';
import { DbPort } from '../package-provider/db.port';
import { mapPricesByPackageAndProvider, getIsoDay } from '../utils';
import { OutputTransaction } from './types/output-transaction.type';
import { TransactionValidator } from './transaction.validator';
import { ObjectStoragePort } from 'src/object-storage/object-storage.port';

@Injectable()
export class TransactionCalculator {
  constructor(
    private readonly cache: CachePort<number>,
    private readonly packageProviderDb: DbPort<PackageProvider>,
    private readonly objectStorage: ObjectStoragePort,
    private readonly discountCalculator: DiscountCalculator,
    private readonly validator: TransactionValidator,
  ) {}

  private async getOutput(rawTransactions: string[]): Promise<string> {
    const outputData = [];

    for (const rawTransaction of rawTransactions) {
      const transactionDetails = rawTransaction.split(' ');

      if (!this.validator.isInputTransactionValid(transactionDetails)) {
        outputData.push(transactionDetails.join(' ') + ' Ignored');
        continue;
      }

      const transaction = this.transformToTransaction(transactionDetails);

      const { discount, price } = await this.discountCalculator.calculateDiscountAndPrice(transaction);

      outputData.push(this.transformToOutput({ ...transaction, discount, price }));
    }

    return outputData.join('\n');
  }

  private transformToTransaction(data: string[]): InputTransaction {
    const [rawDate, rawSize, rawProvider] = data;

    return {
      day: new Date(rawDate),
      packageSize: rawSize as PackageProvider['packageSize'],
      name: rawProvider as PackageProvider['name'],
    };
  }

  private transformToOutput({ day, packageSize, name, price, discount }: OutputTransaction): string {
    return `${getIsoDay(day)} ${packageSize} ${name} ${price.toFixed(2)} ${discount ? discount.toFixed(2) : '-'}`;
  }

  async init(fileDirectory?: string): Promise<string> {
    const packageProviders = await this.packageProviderDb.getAll();
    await this.cache.setMultiple(mapPricesByPackageAndProvider(packageProviders));

    const rawTransactions = await this.objectStorage.getAll(fileDirectory);

    const output = await this.getOutput(rawTransactions);

    return output;
  }
}
