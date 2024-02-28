import { Test, TestingModule } from '@nestjs/testing';
import { CachePort } from '../../cache/cache.port';
import { LargeShipmentLpRule } from './large-shipment-lp.rule';
import { PackageSize } from '../../transaction/enums/package-size.enum';
import { PackageName } from '../../transaction/enums/package-name.enum';
import { InputTransaction } from '../../transaction/types/input-transaction.type';

describe(`${LargeShipmentLpRule.name}`, () => {
  let largeShipmentLpRule: LargeShipmentLpRule;
  let cache: CachePort<number>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LargeShipmentLpRule,
        {
          provide: CachePort<number>,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    largeShipmentLpRule = module.get(LargeShipmentLpRule);
    cache = module.get(CachePort);
  });

  describe(`${LargeShipmentLpRule.prototype.calculate.name}`, () => {
    const defaultInputTransaction: InputTransaction = {
      day: new Date('2024-01-01'),
      packageSize: PackageSize.Large,
      name: PackageName.LaPoste,
    };

    beforeEach(() => {
      jest.spyOn(cache, 'get').mockResolvedValue(null);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('returns null if packageSize is not equal to L', async () => {
      const discount = await largeShipmentLpRule.calculate({
        ...defaultInputTransaction,
        packageSize: PackageSize.Small,
      });

      expect(discount).toEqual(null);
    });

    it('returns null if packageName is not equal to LP', async () => {
      const discount = await largeShipmentLpRule.calculate({
        ...defaultInputTransaction,
        packageSize: PackageSize.Small,
      });

      expect(discount).toEqual(null);
    });

    it('calls cache with constructed keys', async () => {
      await largeShipmentLpRule.calculate(defaultInputTransaction);

      expect(cache.get).toHaveBeenNthCalledWith(1, 'L-LP-2024-1');
      expect(cache.get).toHaveBeenNthCalledWith(2, 'LP-L');
    });

    it('sets monthly large shipment cache', async () => {
      await largeShipmentLpRule.calculate(defaultInputTransaction);

      expect(cache.set).toHaveBeenCalledWith({ key: 'L-LP-2024-1', value: 2 });
    });

    it('returns null if monthly large shipment cache is not equal to FREE_SHIPMENT_COUNT', async () => {
      const discount = await largeShipmentLpRule.calculate(defaultInputTransaction);

      expect(discount).toEqual(null);
    });

    it('returns discount as shipmentPrice if monthly cache is equal FREE_SHIPMENT_COUNT', async () => {
      const mockShipmentPrice = 5;
      jest.spyOn(cache, 'get').mockResolvedValueOnce(3).mockResolvedValueOnce(mockShipmentPrice);
      const discount = await largeShipmentLpRule.calculate(defaultInputTransaction);

      expect(discount).toEqual(mockShipmentPrice);
    });
  });
});
