import { readFile } from 'fs/promises';
import { join } from 'path';

import { PackageProvider } from '../transaction/types/package-provider.type';
import { PricesByPackageProdiver } from './types/prices-by-package-provider';

export const getIsoDay = (date: Date) => date.toISOString().split('T')[0];

export const mapPricesByPackageAndProvider = (packageProviders: PackageProvider[]): PricesByPackageProdiver =>
  packageProviders.reduce((mappedPricing: PricesByPackageProdiver, { name, packageSize, price }) => {
    const providerSizeKey = `${name}-${packageSize}`;

    return { ...mappedPricing, ...{ [providerSizeKey]: price } };
  }, {});

export const getInputFile = async (directory?: string): Promise<string[]> => {
  const fileDirectory = directory ?? '../../input.txt';

  const data = await readFile(join(__dirname, fileDirectory), 'utf-8');
  return data.split('\n');
};
