import { PackageProvider } from '../transaction/types/package-provider.type';
import { PackageName } from '../transaction/enums/package-name.enum';
import { PackageSize } from '../transaction/enums/package-size.enum';
import { mapPricesByPackageAndProvider } from './map-prices-by-provider';

describe(`${mapPricesByPackageAndProvider.name}`, () => {
  const mockPackageProviders: PackageProvider[] = [
    { name: PackageName.LaPoste, packageSize: PackageSize.Medium, price: 4.9 },
    { name: PackageName.LaPoste, packageSize: PackageSize.Large, price: 6.9 },
    { name: PackageName.MondialRelay, packageSize: PackageSize.Small, price: 2.0 },
    { name: PackageName.MondialRelay, packageSize: PackageSize.Medium, price: 3.0 },
  ];

  it('returns transformed packageProvider object', () => {
    const result = mapPricesByPackageAndProvider(mockPackageProviders);

    expect(result).toEqual({ 'LP-L': 6.9, 'LP-M': 4.9, 'MR-M': 3, 'MR-S': 2 });
  });
});
