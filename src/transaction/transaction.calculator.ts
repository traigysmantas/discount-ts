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

    // 4.1. iterate over raw transations
    for (const rawTransaction of rawTransactions) {
      const transactionDetails = rawTransaction.split(' ');

      // 4.2. check is input is valid
      if (!this.validator.isInputTransactionValid(transactionDetails)) {
        // 4.2.1. if invalid -> add to output array
        outputData.push(transactionDetails.join(' ') + ' Ignored');
        continue;
      }

      // 4.3. transform input to object.
      const transaction = this.transformer.transformToTransaction(transactionDetails);
      // 4.4 calculate discount and price
      const { discount, price } = await this.discountCalculator.calculateDiscountAndPrice(transaction);

      // 4.5. transform back to string and add to output array
      outputData.push(this.transformer.transformToOutput({ ...transaction, discount, price }));
    }

    return outputData.join('\n');
  }

  async init(fileDirectory?: string): Promise<string> {
    // 1. get providers
    const packageProviders = await this.packageProviderDb.getAll();
    // 2. map providers' prices by package and provider and store it to cache
    // cache currently is just object in memory.
    await this.packagePriceCache.setMultiple(mapPricesByPackageAndProvider(packageProviders));

    // 3. get raw transations
    const rawTransactions = await getInputFile(fileDirectory);

    // 4. iterate over transactions, calculate them and return output.
    const output = await this.getOutput(rawTransactions);

    return output;
  }
}
