import { Test, TestingModule } from '@nestjs/testing';
import { TransactionTransformer } from './transaction.transformer';
import { PackageName } from './enums/package-name.enum';
import { PackageSize } from './enums/package-size.enum';

describe(`${TransactionTransformer.name}`, () => {
  let transactionTransformer: TransactionTransformer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionTransformer],
    }).compile();

    transactionTransformer = module.get(TransactionTransformer);
  });

  describe(`${TransactionTransformer.prototype.transformToTransaction.name}`, () => {
    it('transform to transaction', () => {
      const result = transactionTransformer.transformToTransaction(['2024-01-01', 'L', 'MR']);

      expect(result).toEqual({
        day: new Date('2024-01-01'),
        name: PackageName.MondialRelay,
        packageSize: PackageSize.Large,
      });
    });
  });

  describe(`${TransactionTransformer.prototype.transformToOutput.name}`, () => {
    it('transform to transaction with discount', () => {
      const result = transactionTransformer.transformToOutput({
        day: new Date('2024-01-01'),
        name: PackageName.MondialRelay,
        packageSize: PackageSize.Large,
        price: 1.111,
        discount: 0.991,
      });

      expect(result).toBe('2024-01-01 L MR 1.11 0.99');
    });

    it('transform to transaction without discount', () => {
      const result = transactionTransformer.transformToOutput({
        day: new Date('2024-01-01'),
        name: PackageName.MondialRelay,
        packageSize: PackageSize.Large,
        price: 1.5,
        discount: 0,
      });

      expect(result).toBe('2024-01-01 L MR 1.50 -');
    });
  });
});
