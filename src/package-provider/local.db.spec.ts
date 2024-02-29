import { Test, TestingModule } from '@nestjs/testing';
import { LocalDb } from './local.db';
import { PackageProvider } from '../transaction/types/package-provider.type';
import { PackageName } from '../transaction/enums/package-name.enum';
import { PackageSize } from '../transaction/enums/package-size.enum';

describe(`${LocalDb.name}`, () => {
  let localDb: LocalDb<PackageProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LocalDb,
          useValue: new LocalDb<PackageProvider>([
            { name: PackageName.LaPoste, packageSize: PackageSize.Small, price: 1.5 },
            { name: PackageName.LaPoste, packageSize: PackageSize.Medium, price: 4.9 },
            { name: PackageName.LaPoste, packageSize: PackageSize.Large, price: 6.9 },
            { name: PackageName.MondialRelay, packageSize: PackageSize.Small, price: 2.0 },
            { name: PackageName.MondialRelay, packageSize: PackageSize.Medium, price: 3.0 },
            { name: PackageName.MondialRelay, packageSize: PackageSize.Large, price: 4.0 },
          ]),
        },
      ],
    }).compile();

    localDb = module.get(LocalDb);
  });

  describe(`${LocalDb.prototype.getAll.name}`, () => {
    it('returns providers', () => {
      const result = localDb.getAll();

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
