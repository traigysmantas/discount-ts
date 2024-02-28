import { Test, TestingModule } from '@nestjs/testing';
import { DiscountCalculator } from './discount.calculator';
import { LargeShipmentLpRule } from './rules/large-shipment-lp.rule';
import { SmallShipmentRule } from './rules/small-shipment.rule';
import { AccumulatedDiscountRule } from './rules/accumulated-discount.rule';
import { InputTransaction } from '../transaction/types/input-transaction.type';
import { PackageName } from '../transaction/enums/package-name.enum';
import { PackageSize } from '../transaction/enums/package-size.enum';
import { CachePort } from '../cache/cache.port';

describe(`${DiscountCalculator.name}`, () => {
  let discountCalculator: DiscountCalculator;
  let largeShipmentLpRule: LargeShipmentLpRule;
  let smallShipmentRule: SmallShipmentRule;
  let accumulatedDiscountRule: AccumulatedDiscountRule;
  let shipmentPriceCache: CachePort<number>;

  const defaultInputTransaction: InputTransaction = {
    day: new Date('2024-01-01'),
    packageSize: PackageSize.Large,
    name: PackageName.LaPoste,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscountCalculator,
        {
          provide: CachePort<number>,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: LargeShipmentLpRule,
          useValue: {
            calculate: jest.fn(),
          },
        },
        {
          provide: SmallShipmentRule,
          useValue: {
            calculate: jest.fn(),
          },
        },
        {
          provide: AccumulatedDiscountRule,
          useValue: {
            calculate: jest.fn(),
            saveDiscount: jest.fn(),
          },
        },
      ],
    }).compile();

    discountCalculator = module.get(DiscountCalculator);
    shipmentPriceCache = module.get(CachePort);
    accumulatedDiscountRule = module.get(AccumulatedDiscountRule);
    smallShipmentRule = module.get(SmallShipmentRule);
    largeShipmentLpRule = module.get(LargeShipmentLpRule);
  });

  describe(`${DiscountCalculator.prototype.calculateDiscountAndPrice.name}`, () => {
    beforeEach(() => {
      jest.spyOn(shipmentPriceCache, 'get').mockResolvedValue(5.0);
      jest.spyOn(accumulatedDiscountRule, 'calculate').mockResolvedValue(7.0);
      jest.spyOn(smallShipmentRule, 'calculate').mockResolvedValue(null);
      jest.spyOn(largeShipmentLpRule, 'calculate').mockResolvedValue(2.0);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('calls shipmentPriceCache to get fullPrice of shipment', async () => {
      jest.spyOn(accumulatedDiscountRule, 'calculate').mockResolvedValue(null);
      await discountCalculator.calculateDiscountAndPrice(defaultInputTransaction);

      expect(shipmentPriceCache.get).toHaveBeenCalledWith('LP-L');
    });

    describe('when no available discount left', () => {
      it('returns full price and zero discount', async () => {
        jest.spyOn(accumulatedDiscountRule, 'calculate').mockResolvedValue(null);
        const result = await discountCalculator.calculateDiscountAndPrice(defaultInputTransaction);

        expect(result).toEqual({ discount: 0, price: 5 });
      });
    });

    describe('when available discount exists', () => {
      it('calls accumulatedDiscountRule to save new accumulated discount', async () => {
        await discountCalculator.calculateDiscountAndPrice(defaultInputTransaction);

        expect(accumulatedDiscountRule.saveDiscount).toHaveBeenCalledWith({
          availableDiscountLeft: 7,
          day: new Date('2024-01-01'),
          discount: 2,
        });
      });

      it('returns fullPrice and zero discount if all applicableRules returns null', async () => {
        jest.spyOn(shipmentPriceCache, 'get').mockResolvedValue(6.0);
        jest.spyOn(smallShipmentRule, 'calculate').mockResolvedValue(null);
        jest.spyOn(largeShipmentLpRule, 'calculate').mockResolvedValue(null);

        const result = await discountCalculator.calculateDiscountAndPrice(defaultInputTransaction);

        expect(result).toEqual({ discount: 0, price: 6 });
      });

      it('returns price with available discount, if it is smaller than applicable discount', async () => {
        jest.spyOn(shipmentPriceCache, 'get').mockResolvedValue(6.0);
        jest.spyOn(largeShipmentLpRule, 'calculate').mockResolvedValue(2.0);
        jest.spyOn(accumulatedDiscountRule, 'calculate').mockResolvedValue(1.3);

        const result = await discountCalculator.calculateDiscountAndPrice(defaultInputTransaction);

        expect(result).toEqual({ discount: 1.3, price: 4.7 });
      });

      it('throws error if more than 1 of applicableRules returns discount', async () => {
        jest.spyOn(smallShipmentRule, 'calculate').mockResolvedValue(2.0);
        jest.spyOn(largeShipmentLpRule, 'calculate').mockResolvedValue(3.0);

        const promise = discountCalculator.calculateDiscountAndPrice(defaultInputTransaction);

        await expect(promise).rejects.toThrow('Discount rules violation. More than 1 applicable discount found');
      });
    });
  });
});
