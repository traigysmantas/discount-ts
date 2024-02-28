import { Test, TestingModule } from '@nestjs/testing';
import { CachePort } from '../../cache/cache.port';
import { PackageSize } from '../../transaction/enums/package-size.enum';
import { PackageName } from '../../transaction/enums/package-name.enum';
import { InputTransaction } from '../../transaction/types/input-transaction.type';
import { AccumulatedDiscountRule } from './accumulated-discount.rule';

describe(`${AccumulatedDiscountRule.name}`, () => {
  let accumulatedDiscountRule: AccumulatedDiscountRule;
  let cache: CachePort<number>;

  const defaultInputTransaction: InputTransaction = {
    day: new Date('2024-01-01'),
    packageSize: PackageSize.Large,
    name: PackageName.LaPoste,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccumulatedDiscountRule,
        {
          provide: CachePort<number>,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    accumulatedDiscountRule = module.get(AccumulatedDiscountRule);
    cache = module.get(CachePort);
  });

  describe(`${AccumulatedDiscountRule.prototype.saveDiscount.name}`, () => {
    beforeEach(() => {
      jest.spyOn(cache, 'get').mockResolvedValue(3.11);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('calls cache to get monthly accumulated discount', async () => {
      const { day } = defaultInputTransaction;
      await accumulatedDiscountRule.saveDiscount({ day, discount: 5.15 });

      expect(cache.get).toHaveBeenCalledWith('ACCUMULATED-2024-1');
    });

    it('sets cache with sum of discount and accumulated discount', async () => {
      const { day } = defaultInputTransaction;
      await accumulatedDiscountRule.saveDiscount({ day, discount: 5.15 });

      expect(cache.set).toHaveBeenCalledWith({ key: 'ACCUMULATED-2024-1', value: 8.26 });
    });
  });

  describe(`${AccumulatedDiscountRule.prototype.calculate.name}`, () => {
    beforeEach(() => {
      jest.spyOn(cache, 'get').mockResolvedValue(null);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('calls cache to get monthly accumulated discount', async () => {
      await accumulatedDiscountRule.calculate(defaultInputTransaction);

      expect(cache.get).toHaveBeenCalledWith('ACCUMULATED-2024-1');
    });

    it('returns null if accumulated discount is more than MAX_DISCOUNT', async () => {
      jest.spyOn(cache, 'get').mockResolvedValue(15);
      const discount = await accumulatedDiscountRule.calculate(defaultInputTransaction);

      expect(discount).toEqual(null);
    });

    it('returns difference between max and accrued discounts it latter is more than MAX_DISCOUNT', async () => {
      jest.spyOn(cache, 'get').mockResolvedValue(6.59);
      const discount = await accumulatedDiscountRule.calculate(defaultInputTransaction);

      expect(discount).toEqual(3.41);
    });
  });
});
