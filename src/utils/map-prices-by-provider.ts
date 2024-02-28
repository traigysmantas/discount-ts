import { PackageProvider } from '../transaction/types/package-provider.type';
import { PricesByPackageProdiver } from './types/prices-by-package-provider';

export const mapPricesByPackageAndProvider = (packageProviders: PackageProvider[]): PricesByPackageProdiver =>
  packageProviders.reduce((mappedPricing: PricesByPackageProdiver, { name, packageSize, price }) => {
    const providerSizeKey = `${name}-${packageSize}`;

    return { ...mappedPricing, ...{ [providerSizeKey]: price } };
  }, {});
