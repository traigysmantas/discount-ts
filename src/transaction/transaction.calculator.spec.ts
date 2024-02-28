import { Test, TestingModule } from '@nestjs/testing';
import { TransactionCalculator } from './transaction.calculator';
import { CachePort } from '../cache/cache.port';
import { getInputFile } from '../utils/get-input-file';
import { DbPort } from '../package-provider/db.port';
import { PackageProvider } from './types/package-provider.type';
import { PackageName } from './enums/package-name.enum';
import { PackageSize } from './enums/package-size.enum';
import { TransactionValidator } from './transaction.validator';
import { DiscountCalculator } from '../discount/discount.calculator';
import { TransactionTransformer } from './transaction.transformer';

jest.mock('../utils/get-input-file');

describe(`${TransactionCalculator.name}`, () => {
  let transactionCalculator: TransactionCalculator;

  let packagePriceCache: CachePort<number>;
  let packageProviderDb: DbPort<PackageProvider>;
  let discountCalculator: DiscountCalculator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionCalculator,
        TransactionValidator,
        TransactionTransformer,
        {
          provide: CachePort<number>,
          useValue: {
            setMultiple: jest.fn(),
          },
        },
        {
          provide: DbPort<PackageProvider>,
          useValue: {
            getAll: jest.fn(),
          },
        },
        {
          provide: DiscountCalculator,
          useValue: {
            calculateDiscountAndPrice: jest.fn(),
          },
        },
      ],
    }).compile();

    transactionCalculator = module.get(TransactionCalculator);
    packagePriceCache = module.get(CachePort);
    packageProviderDb = module.get(DbPort);
    discountCalculator = module.get(DiscountCalculator);
  });

  describe(`${TransactionCalculator.prototype.init.name}`, () => {
    const mockPackages = [
      { name: PackageName.MondialRelay, packageSize: PackageSize.Small, price: 2.0 },
      { name: PackageName.MondialRelay, packageSize: PackageSize.Medium, price: 3.0 },
      { name: PackageName.MondialRelay, packageSize: PackageSize.Large, price: 4.0 },
    ];
    const mockInput = ['2015-02-01 S MR', '2015-02-02 L MR', '2015-02-13 M LP', '2015-02-13 SMLP'];

    beforeEach(() => {
      jest.spyOn(packageProviderDb, 'getAll').mockResolvedValue(mockPackages);
      jest.spyOn(packagePriceCache, 'setMultiple');
      jest.mocked(getInputFile).mockResolvedValue(mockInput);
      jest
        .spyOn(discountCalculator, 'calculateDiscountAndPrice')
        .mockResolvedValueOnce({ price: 1.5, discount: 0.5 })
        .mockResolvedValueOnce({ price: 4.0, discount: 0 })
        .mockResolvedValueOnce({ price: 3.0, discount: 0 });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('gets providers and sets cache with mapped values', async () => {
      await transactionCalculator.init();

      expect(packageProviderDb.getAll).toHaveBeenCalled();
      expect(packagePriceCache.setMultiple).toHaveBeenCalledWith({ 'MR-L': 4, 'MR-M': 3, 'MR-S': 2 });
    });

    it('transforms and validates input correctly', async () => {
      const result = await transactionCalculator.init();

      const expectedOutput = [
        '2015-02-01 S MR 1.50 0.50',
        '2015-02-02 L MR 4.00 -',
        '2015-02-13 M LP 3.00 -',
        '2015-02-13 SMLP Ignored',
      ];

      expect(result).toBe(expectedOutput.join('\n'));
    });
  });
});
