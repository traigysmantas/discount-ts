import { Test, TestingModule } from '@nestjs/testing';
import { CachePort } from '../../cache/cache.port';
import { PackageSize } from '../../transaction/enums/package-size.enum';
import { PackageName } from '../../transaction/enums/package-name.enum';
import { InputTransaction } from '../../transaction/types/input-transaction.type';
import { SmallShipmentRule } from './small-shipment.rule';
import { DbPort } from '../../package-provider/db.port';
import { PackageProvider } from '../../transaction/types/package-provider.type';

const builtPackageProvidersMock = (providers?: PackageProvider[]) => {
  return (
    providers ?? [
      { name: PackageName.LaPoste, packageSize: PackageSize.Small, price: 1.5 },
      { name: PackageName.LaPoste, packageSize: PackageSize.Medium, price: 4.9 },
      { name: PackageName.LaPoste, packageSize: PackageSize.Large, price: 6.9 },
      { name: PackageName.MondialRelay, packageSize: PackageSize.Small, price: 2.0 },
    ]
  );
};

describe(`${SmallShipmentRule.name}`, () => {
  let smallShipmentRule: SmallShipmentRule;
  let cache: CachePort<number>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmallShipmentRule,
        {
          provide: CachePort<number>,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: DbPort<PackageProvider>,
          useValue: {
            getAll: jest.fn().mockResolvedValue(builtPackageProvidersMock()),
          },
        },
      ],
    }).compile();

    smallShipmentRule = module.get(SmallShipmentRule);
    cache = module.get(CachePort);
  });

  describe(`${SmallShipmentRule.prototype.calculate.name}`, () => {
    const defaultInputTransaction: InputTransaction = {
      day: new Date('2024-01-01'),
      packageSize: PackageSize.Small,
      name: PackageName.LaPoste,
    };

    beforeEach(() => {
      jest.spyOn(cache, 'get').mockResolvedValue(null);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('returns null if packageSize is not equal to S', async () => {
      const discount = await smallShipmentRule.calculate({
        ...defaultInputTransaction,
        packageSize: PackageSize.Small,
      });

      expect(discount).toEqual(null);
    });

    it('calls cache to get shipment price', async () => {
      await smallShipmentRule.calculate({ ...defaultInputTransaction, packageSize: PackageSize.Small });

      expect(cache.get).toHaveBeenCalledWith('LP-S');
    });

    it('returns null if shipment price is lower than lowestShipmentPrice', async () => {
      jest.spyOn(cache, 'get').mockResolvedValue(1);
      const discount = await smallShipmentRule.calculate(defaultInputTransaction);

      expect(discount).toEqual(null);
    });

    // TODO!
    // it('returns null if shipmentPrice for Small packages were not found', async () => {
    //   jest.spyOn(cache, 'get').mockResolvedValue(1);
    //   const discount = await smallShipmentRule.calculate(defaultInputTransaction);

    //   expect(discount).toEqual(null);
    // });

    it('returns null if shipment price is not found', async () => {
      const discount = await smallShipmentRule.calculate(defaultInputTransaction);

      expect(discount).toEqual(null);
    });

    it('returns discount if shipment price is bigger than lowestShipmentPrice', async () => {
      jest.spyOn(cache, 'get').mockResolvedValue(3.5);
      const discount = await smallShipmentRule.calculate(defaultInputTransaction);

      expect(discount).toEqual(2);
    });
  });
});
