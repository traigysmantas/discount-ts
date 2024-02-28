import { Injectable } from '@nestjs/common';
import { DbPort } from './db.port';
import { PackageProvider } from '../transaction/types/package-provider.type';
import { PackageName } from '../transaction/enums/package-name.enum';
import { PackageSize } from '../transaction/enums/package-size.enum';

@Injectable()
export class PackageProviderLocalDb extends DbPort<PackageProvider> {
  private readonly packageProviders: PackageProvider[] = [
    { name: PackageName.LaPoste, packageSize: PackageSize.Small, price: 1.5 },
    { name: PackageName.LaPoste, packageSize: PackageSize.Medium, price: 4.9 },
    { name: PackageName.LaPoste, packageSize: PackageSize.Large, price: 6.9 },
    { name: PackageName.MondialRelay, packageSize: PackageSize.Small, price: 2.0 },
    { name: PackageName.MondialRelay, packageSize: PackageSize.Medium, price: 3.0 },
    { name: PackageName.MondialRelay, packageSize: PackageSize.Large, price: 4.0 },
  ];

  constructor() {
    super();
  }

  getAll(): PackageProvider[] {
    return this.packageProviders;
  }
}
