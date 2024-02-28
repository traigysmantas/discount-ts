import { Test, TestingModule } from '@nestjs/testing';
import { TransactionValidator } from './transaction.validator';

describe(`${TransactionValidator.name}`, () => {
  let transactionValidator: TransactionValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionValidator],
    }).compile();

    transactionValidator = module.get(TransactionValidator);
  });

  describe(`${TransactionValidator.prototype.isInputTransactionValid.name}`, () => {
    it('returns false if input array length is not equal to 2', () => {
      const result = transactionValidator.isInputTransactionValid(['a', 'b']);

      expect(result).toBe(false);
    });

    it('returns false if first array element is not data', () => {
      const result = transactionValidator.isInputTransactionValid(['a', 'b', 'c']);

      expect(result).toBe(false);
    });

    it('returns false if second array element has invalid packageSize', () => {
      const result = transactionValidator.isInputTransactionValid(['2024-01-01', 'LLL', 'c']);

      expect(result).toBe(false);
    });

    it('returns false if third array element has invalid provider', () => {
      const result = transactionValidator.isInputTransactionValid(['2024-01-01', 'L', 'MLP']);

      expect(result).toBe(false);
    });

    it('returns true if input is valid', () => {
      const result = transactionValidator.isInputTransactionValid(['2024-01-01', 'L', 'MR']);

      expect(result).toBe(true);
    });
  });
});
