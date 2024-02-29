import { Module } from '@nestjs/common';
import { DbPort } from './db.port';
import { PackageName } from '../transaction/enums/package-name.enum';
import { PackageSize } from '../transaction/enums/package-size.enum';
import { PackageProvider } from '../transaction/types/package-provider.type';
import { LocalDb } from './local.db';

@Module({
  providers: [
    {
      provide: DbPort,
      useFactory: () => {
        const packageProviders: PackageProvider[] = [
          { name: PackageName.LaPoste, packageSize: PackageSize.Small, price: 1.5 },
          { name: PackageName.LaPoste, packageSize: PackageSize.Medium, price: 4.9 },
          { name: PackageName.LaPoste, packageSize: PackageSize.Large, price: 6.9 },
          { name: PackageName.MondialRelay, packageSize: PackageSize.Small, price: 2.0 },
          { name: PackageName.MondialRelay, packageSize: PackageSize.Medium, price: 3.0 },
          { name: PackageName.MondialRelay, packageSize: PackageSize.Large, price: 4.0 },
        ];
        return new LocalDb(packageProviders);
      },
    },
  ],
  exports: [DbPort],
})
export class PackageProviderModule {}
