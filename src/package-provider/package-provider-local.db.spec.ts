import { Test, TestingModule } from '@nestjs/testing';
import { PackageProviderLocalDb } from './package-provider-local.db';

describe(`${PackageProviderLocalDb.name}`, () => {
  let packageProviderLocalDb: PackageProviderLocalDb;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PackageProviderLocalDb],
    }).compile();

    packageProviderLocalDb = module.get(PackageProviderLocalDb);
  });

  describe(`${PackageProviderLocalDb.prototype.getAll.name}`, () => {
    it('returns providers', () => {
      const result = packageProviderLocalDb.getAll();

      expect(result).toEqual([
        { name: 'LP', packageSize: 'S', price: 1.5 },
        { name: 'LP', packageSize: 'M', price: 4.9 },
        { name: 'LP', packageSize: 'L', price: 6.9 },
        { name: 'MR', packageSize: 'S', price: 2 },
        { name: 'MR', packageSize: 'M', price: 3 },
        { name: 'MR', packageSize: 'L', price: 4 },
      ]);
    });
  });
});
