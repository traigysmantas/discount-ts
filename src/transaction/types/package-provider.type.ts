import { PackageName } from '../enums/package-name.enum';
import { PackageSize } from '../enums/package-size.enum';

export type PackageProvider = {
  name: PackageName;
  packageSize: PackageSize;
  price: number;
};
