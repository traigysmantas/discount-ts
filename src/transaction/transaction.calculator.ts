import { Injectable } from '@nestjs/common';

import { CachePort } from '../cache/cache.port';
import { DiscountCalculator } from '../discount/discount.calculator';
import { PackageProvider } from './types/package-provider.type';
import { DbPort } from '../package-provider/db.port';
import { mapPricesByPackageAndProvider } from '../utils/map-prices-by-provider';
import { TransactionValidator } from './transaction.validator';
import { TransactionTransformer } from './transaction.transformer';
import { getInputFile } from '../utils/get-input-file';

@Injectable()
export class TransactionCalculator {
  constructor(
    private readonly packagePriceCache: CachePort<number>,
    private readonly packageProviderDb: DbPort<PackageProvider>,
    private readonly discountCalculator: DiscountCalculator,
    private readonly validator: TransactionValidator,
    private readonly transformer: TransactionTransformer,
  ) {}

  private async getOutput(rawTransactions: string[]): Promise<string> {
    const outputData = [];

    for (const rawTransaction of rawTransactions) {
      const transactionDetails = rawTransaction.split(' ');

      if (!this.validator.isInputTransactionValid(transactionDetails)) {
        outputData.push(transactionDetails.join(' ') + ' Ignored');
        continue;
      }

      const transaction = this.transformer.transformToTransaction(transactionDetails);
      const { discount, price } = await this.discountCalculator.calculateDiscountAndPrice(transaction);

      outputData.push(this.transformer.transformToOutput({ ...transaction, discount, price }));
    }

    return outputData.join('\n');
  }

  async init(fileDirectory?: string): Promise<string> {
    const packageProviders = await this.packageProviderDb.getAll();
    await this.packagePriceCache.setMultiple(mapPricesByPackageAndProvider(packageProviders));

    const rawTransactions = await getInputFile(fileDirectory);

    const output = await this.getOutput(rawTransactions);

    return output;
  }
}
